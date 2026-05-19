"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface UploadZoneProps {
  onUploadComplete: (analysisId: string) => void;
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    if (!file?.name?.toLowerCase()?.endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      // Get presigned URL
      const presignedRes = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });
      const { uploadUrl, cloud_storage_path } = await presignedRes.json();
      setUploadProgress(30);

      // Check if content-disposition is in signed headers
      const url = new URL(uploadUrl);
      const signedHeaders = url.searchParams.get("X-Amz-SignedHeaders") || "";
      const headers: HeadersInit = { "Content-Type": file.type };
      if (signedHeaders.includes("content-disposition")) {
        headers["Content-Disposition"] = "attachment";
      }

      // Upload to S3
      await fetch(uploadUrl, {
        method: "PUT",
        headers,
        body: file,
      });
      setUploadProgress(70);

      // Create analysis record
      const completeRes = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, cloud_storage_path }),
      });
      const { analysis } = await completeRes.json();
      setUploadProgress(100);
      setUploadedFile(file.name);
      
      toast.success("Manuscript uploaded!");
      onUploadComplete(analysis?.id);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target?.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
          isDragging
            ? "border-amber-500 bg-amber-500/10"
            : uploadedFile
            ? "border-green-500/50 bg-green-500/5"
            : "border-border hover:border-amber-500/50 hover:bg-secondary/50"
        }`}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
              <p className="text-lg font-medium">Uploading manuscript...</p>
              <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          ) : uploadedFile ? (
            <motion.div
              key="uploaded"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <p className="text-lg font-medium">{uploadedFile}</p>
              </div>
              <p className="text-sm text-muted-foreground">Ready for analysis</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-500 animate-pulse" />
              </div>
              <div>
                <p className="text-lg font-medium">Drop your manuscript here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse (PDF only)</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
