import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminClientInstance: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  if (adminClientInstance) return adminClientInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase URL or Service Role Key missing for Admin Client.");
  }

  adminClientInstance = createClient(supabaseUrl, supabaseServiceKey);
  return adminClientInstance;
}

export async function ensureBucketExists(bucketName: string = "card-media"): Promise<void> {
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
      allowedMimeTypes: ["image/*", "audio/*", "application/pdf"],
      fileSizeLimit: 104857600, // 100MB
    });
    if (createBucketErr) {
      console.warn(`Could not create ${bucketName} bucket:`, createBucketErr);
    }
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
  } catch (err: any) {
    return { publicUrl: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export async function listStorageFiles(
  bucketName: string,
  folder: string
): Promise<{ files: any[]; error: Error | null }> {
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
  } catch (err: any) {
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
  } catch (err: any) {
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}
