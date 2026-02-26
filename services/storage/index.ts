import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { extractStoragePathFromUrl } from "@/lib/media-utils"

export async function uploadFile(file: File, path: string) {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function deleteFile(path: string) {
  const storageRef = ref(storage, path)
  await deleteObject(storageRef)
}

export async function deleteFileByUrl(url: string) {
  const path = extractStoragePathFromUrl(url)
  if (!path) return
  await deleteFile(path)
}

export function storagePath(folder: string, fileName: string) {
  return `${folder}/${fileName}`
}
