/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const isPlaceholder = (url: string, key: string) => {
  return !url || !key || 
         url.includes("your-project") || 
         key.includes("your-anon-key") || 
         url.includes("example.com") ||
         url === "MY_SUPABASE_URL" || 
         key === "MY_SUPABASE_KEY" ||
         url.trim() === "" ||
         key.trim() === "";
};

export const isSupabaseConfigured = !isPlaceholder(supabaseUrl, supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Uploads a file to Supabase Storage and returns its public URL.
 * If Supabase is not configured, it will fallback to the local Express-based upload.
 * 
 * @param file The file object to upload
 * @param bucket Name of the storage bucket
 * @returns Promise containing the public URL of the uploaded file
 */
export async function uploadMedia(file: File, bucket: string = "playfoliyo-media"): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn("Supabase is not configured. Falling back to local URL-based upload.");
    return uploadLocally(file);
  }

  // Generate unique file path to prevent naming collisions
  const ext = file.name.split(".").pop() || "png";
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${ext}`;
  const filePath = `uploads/${uniqueName}`;

  try {
    // Attempt uploading to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase Storage SDK upload error, falling back to local server:", error);
      return uploadLocally(file);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (err) {
    console.error("Failed to upload to Supabase, falling back to local server upload:", err);
    return uploadLocally(file);
  }
}

async function uploadLocally(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: file.name,
            base64: base64String,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to upload file to local server");
        }

        const data = await response.json();
        resolve(data.url);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Error reading file for local upload"));
    reader.readAsDataURL(file);
  });
}
