"use client";

import React, { useRef, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Image as ImageIcon, Music, Upload, Search, Trash2 } from "lucide-react";
import { useMyMedia } from "@/lib/hooks/useSupabaseData";
import { useUserId } from "@/lib/hooks/useUserId";
import { EmptyState } from "@/components/ui/EmptyState";
import { supabase } from "@/lib/db/client";
import { useToast } from "@/components/ui/ToastQueue";
import { Modal } from "@/components/ui/Modal";

export default function MediaPage() {
  const toast = useToast();
  const userId = useUserId();
  const { data: mediaFiles, loading, refetch } = useMyMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Delete Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetFile, setDeleteTargetFile] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const isImage = file.type.startsWith("image/");
    const isAudio = file.type.startsWith("audio/") || file.name.endsWith(".webm") || file.name.endsWith(".mp3") || file.name.endsWith(".wav");

    if (!isImage && !isAudio) {
      toast.error("Only images and audio recordings are supported.");
      return;
    }

    const endpoint = isImage ? "/api/upload/photo" : "/api/upload/voice";

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      if (userId) {
        formData.append("userId", userId);
      }

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }

      refetch();
      toast.success("File uploaded successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerDeleteConfirm = (file: any) => {
    setDeleteTargetFile(file);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!deleteTargetFile || !userId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/media?userId=${userId}&name=${deleteTargetFile.name}&type=${deleteTargetFile.type}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete file");
      }
      toast.success("File deleted successfully.");
      setShowDeleteModal(false);
      setDeleteTargetFile(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete file");
    } finally {
      setDeleting(false);
    }
  };

  // Filter files based on search query
  const filteredFiles = mediaFiles.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:pl-64">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">Media Library</h1>
            <p className="text-muted-foreground mt-1 font-medium">Manage your photos, custom recordings, and audio assets.</p>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,audio/*"
              className="hidden"
            />
            <Button onClick={handleUploadClick} loading={uploading} className="flex items-center gap-2 shadow-lg shadow-primary-glow shrink-0">
              <Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload Media"}
            </Button>
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <div className="aspect-square bg-secondary/20 animate-pulse" />
                <div className="p-2 border-t border-border/40">
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredFiles.length === 0 ? (
          <EmptyState
            icon={<ImageIcon className="w-8 h-8" />}
            title={searchQuery ? "No search results" : "Your media library is empty"}
            description={searchQuery ? "Try searching for a different file name." : "Upload photos or audio files to use in your celebration cards."}
            actionText={searchQuery ? undefined : "Upload First File"}
            onAction={searchQuery ? undefined : handleUploadClick}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <div key={file.name} className="bg-card border border-border/50 rounded-2xl overflow-hidden flex flex-col relative group hover:border-primary/50 transition-all">
                {file.type === "photo" ? (
                  <div className="aspect-square relative overflow-hidden bg-secondary/15 flex items-center justify-center">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-square flex flex-col items-center justify-center bg-secondary/10 p-4 gap-2 text-primary">
                    <Music className="w-10 h-10" />
                    <audio src={file.url} controls className="w-full max-w-[130px] scale-75 origin-center" />
                  </div>
                )}
                <div className="p-2 border-t border-border/40 flex items-center justify-between bg-card text-xs">
                  <span className="truncate flex-1 font-medium text-muted-foreground mr-2" title={file.name}>
                    {file.name}
                  </span>
                  <button
                    onClick={() => triggerDeleteConfirm(file)}
                    className="text-destructive hover:scale-110 transition-transform p-1"
                    title="Delete media file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />

      {/* ==================== DELETE MODAL ==================== */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Media File"
        description="Are you sure you want to permanently delete this media file?"
        size="sm"
      >
        <div className="space-y-5 py-2">
          <p className="text-sm text-muted-foreground">
            This file will be deleted from storage and cannot be restored. Any celebration cards referencing this media URL will no longer be able to display it.
          </p>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={executeDelete} 
              loading={deleting}
              className="flex-1"
            >
              Delete File
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
