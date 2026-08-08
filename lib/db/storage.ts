import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminClientInstance: SupabaseClient | null = null;

/**
 * Makes a caller-supplied id safe to use as a storage path segment.
 *
 * Upload routes build keys like `photos/<userId>/<file>`, and userId arrives straight from a
 * multipart form field. Without this, a value such as `../voice` or `a/../../other-user`
 * writes outside the intended prefix and can overwrite another user's objects.
 */
export function sanitizePathSegment(value: string, fallback = "anonymous"): string {
  const cleaned = (value || "")
    .normalize("NFKC")
    .replace(/[^A-Za-z0-9_-]/g, "") // drops "/", "\", ".", and everything else
    .slice(0, 64);
  return cleaned || fallback;
}

export function getSupabaseAdminClient(): SupabaseClient {
  if (adminClientInstance) return adminClientInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  // Falling back to the anon key here produced a client that looks like an admin client but
  // silently can't do admin things, uploads then failed with confusing storage errors. Keep
  // the fallback so local dev still boots, but make the degradation loud.
  const supabaseServiceKey = serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase URL or key missing, storage operations will fail.");
  } else if (!serviceKey) {
    console.error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Falling back to the anon key, which has no " +
        "storage or table privileges, uploads and API reads will fail. Set it in .env."
    );
  }

  adminClientInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClientInstance;
}

// Bucket existence is process-wide state, not per-request. Caching the in-flight promise keeps
// every upload from paying for a listBuckets() round trip (and stops a burst of concurrent
// uploads from each trying to create the same bucket).
const bucketReady = new Map<string, Promise<void>>();

export async function ensureBucketExists(bucketName: string = "card-media"): Promise<void> {
  const cached = bucketReady.get(bucketName);
  if (cached) return cached;

  const task = (async () => {
    const client = getSupabaseAdminClient();
    const { data: buckets, error: getBucketsErr } = await client.storage.listBuckets();

    if (getBucketsErr) {
      console.warn("Could not list buckets:", getBucketsErr);
      return;
    }

    const exists = buckets?.some((b) => b.name === bucketName);
    if (!exists) {
      const { error: createBucketErr } = await client.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ["image/*", "audio/*"],
        fileSizeLimit: 104857600, // 100MB
      });
      if (createBucketErr) {
        console.warn(`Could not create ${bucketName} bucket:`, createBucketErr);
      }
    }
  })();

  bucketReady.set(bucketName, task);
  try {
    await task;
  } catch (err) {
    // Don't cache a rejected probe, the next upload should retry.
    bucketReady.delete(bucketName);
    throw err;
  }
}

export async function uploadStorageFile(
  bucketName: string,
  filePath: string,
  fileData: Buffer | Blob | ArrayBuffer,
  contentType: string
): Promise<{ publicUrl: string | null; error: Error | null }> {
  try {
    await ensureBucketExists(bucketName);
    const client = getSupabaseAdminClient();

    const { error: uploadError } = await client.storage
      .from(bucketName)
      .upload(filePath, fileData, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      return { publicUrl: null, error: uploadError };
    }

    const { data: urlData } = client.storage.from(bucketName).getPublicUrl(filePath);
    return { publicUrl: urlData.publicUrl, error: null };
  } catch (err: unknown) {
    return { publicUrl: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export interface StorageFileEntry {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  created_at: string;
}

export async function listStorageFiles(
  bucketName: string,
  folder: string
): Promise<{ files: StorageFileEntry[]; error: Error | null }> {
  try {
    const client = getSupabaseAdminClient();
    const { data, error } = await client.storage.from(bucketName).list(folder, {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      return { files: [], error };
    }

    const filesWithUrls = (data || []).map((file) => {
      const { data: urlData } = client.storage
        .from(bucketName)
        .getPublicUrl(`${folder}/${file.name}`);

      return {
        id: file.id || file.name,
        name: file.name,
        size: file.metadata?.size || 0,
        type: folder.slice(0, -1), // 'photo' or 'voice'
        url: urlData.publicUrl,
        created_at: file.created_at || new Date().toISOString(),
      };
    });

    return { files: filesWithUrls, error: null };
  } catch (err: unknown) {
    return { files: [], error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export async function deleteStorageFile(
  bucketName: string,
  filePath: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const client = getSupabaseAdminClient();
    const { error } = await client.storage.from(bucketName).remove([filePath]);
    if (error) {
      return { success: false, error };
    }
    return { success: true, error: null };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}
