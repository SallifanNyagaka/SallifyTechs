import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { firestore } from "@/lib/firebase"
import { collectStoragePathsFromValue } from "@/lib/media-utils"
import { deleteFile } from "@/services/storage"

export function collectionRef(path: string) {
  return collection(firestore, path)
}

export function documentRef(path: string, id: string) {
  return doc(firestore, path, id)
}

export async function fetchCollection<T>(path: string) {
  const snapshot = await getDocs(collectionRef(path))
  return snapshot.docs.map((snap) => ({
    id: snap.id,
    ...(snap.data() as T),
  }))
}

export async function fetchDocument<T>(path: string, id: string) {
  const snapshot = await getDoc(documentRef(path, id))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...(snapshot.data() as T) }
}

export function subscribeCollection<T>(
  path: string,
  onData: (items: (T & { id: string })[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    query(collectionRef(path)),
    (snapshot) => {
      const items = snapshot.docs.map((snap) => ({
        id: snap.id,
        ...(snap.data() as T),
      }))
      onData(items)
    },
    (error) => {
      if (onError) onError(error)
    }
  )
}

export function subscribeDocument<T>(
  path: string,
  id: string,
  onData: (item: (T & { id: string }) | null) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    documentRef(path, id),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null)
        return
      }
      onData({ id: snapshot.id, ...(snapshot.data() as T) })
    },
    (error) => {
      if (onError) onError(error)
    }
  )
}

export async function upsertDocument<T>(path: string, id: string, data: T) {
  await setDoc(documentRef(path, id), data as unknown as Record<string, unknown>, { merge: true })
}

export async function updateDocument<T>(path: string, id: string, data: Partial<T>) {
  await updateDoc(documentRef(path, id), data as unknown as Record<string, unknown>)
}

export async function removeDocument(path: string, id: string) {
  const ref = documentRef(path, id)
  const snapshot = await getDoc(ref)
  const data = snapshot.exists() ? snapshot.data() : null

  const storagePaths = collectStoragePathsFromValue(data)

  for (const filePath of storagePaths) {
    try {
      await deleteFile(filePath)
    } catch {
      // Ignore and continue; prevents partial deletes from blocking content cleanup.
    }
  }

  if (data) {
    const possibleUrls = Object.values(data)
      .flatMap((value) => (typeof value === "string" ? [value] : []))
      .filter((value) => typeof value === "string" && value.startsWith("http")) as string[]

    for (const mediaUrl of possibleUrls) {
      try {
        const mediaSnapshot = await getDocs(query(collectionRef("media"), where("url", "==", mediaUrl)))
        for (const mediaDoc of mediaSnapshot.docs) {
          await deleteDoc(doc(firestore, "media", mediaDoc.id))
        }
      } catch {
        // Ignore media metadata cleanup failures.
      }
    }
  }

  await deleteDoc(ref)
}
