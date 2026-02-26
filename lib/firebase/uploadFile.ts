import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import { storage } from "@/lib/firebase"

type UploadProgressCallback = (progress: number) => void

export async function uploadFile(
  file: File,
  path: string,
  onProgress?: UploadProgressCallback
) {
  const storageRef = ref(storage, path)

  return new Promise<string>((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file)

    task.on(
      "state_changed",
      (snapshot) => {
        if (!onProgress) return
        const percent = snapshot.totalBytes
          ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          : 0
        onProgress(percent)
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref)
          resolve(url)
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

export function sanitizeFileName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
