import { getApp, getApps, initializeApp } from "firebase/app"
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage"

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }
}

function getServerStorage() {
  const config = getFirebaseConfig()
  const app = getApps().length ? getApp() : initializeApp(config)
  return getStorage(app)
}

export async function uploadPdfAndGetUrl(path: string, bytes: Uint8Array) {
  const storage = getServerStorage()
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, bytes, {
    contentType: "application/pdf",
    cacheControl: "public,max-age=3600",
  })
  return getDownloadURL(storageRef)
}

export async function deleteFileAtPath(path: string) {
  if (!path) return
  const storage = getServerStorage()
  const storageRef = ref(storage, path)
  await deleteObject(storageRef)
}
