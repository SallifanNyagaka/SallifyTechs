"use client"

import React, { useMemo, useState } from "react"
import Image from "next/image"
import { addDoc, collection, deleteDoc, getDocs, query, serverTimestamp, where } from "firebase/firestore"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import { firestore } from "@/lib/firebase"
import { extractStoragePathFromUrl } from "@/lib/media-utils"
import { deleteFileByUrl, storagePath, uploadFile } from "@/services/storage"

export default function ImageUploader({
  folder,
  label,
  onUploaded,
  currentUrl,
  onDeleted,
  relatedCollection,
  relatedId,
  relatedTitle,
}: {
  folder: string
  label: string
  onUploaded: (url: string) => void
  currentUrl?: string
  onDeleted?: () => void
  relatedCollection?: string
  relatedId?: string
  relatedTitle?: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const fileName = useMemo(() => {
    if (!currentUrl) return ""
    const path = extractStoragePathFromUrl(currentUrl)
    if (!path) return ""
    const parts = path.split("/")
    return parts[parts.length - 1] || ""
  }, [currentUrl])

  const removeMediaMetadataByUrl = async (url: string) => {
    if (!url) return
    try {
      const snapshot = await getDocs(query(collection(firestore, "media"), where("url", "==", url)))
      for (const item of snapshot.docs) {
        await deleteDoc(item.ref)
      }
    } catch {
      // best effort cleanup
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const fingerprint = `${file.name}-${file.size}-${file.lastModified}`
      const existing = await getDocs(
        query(
          collection(firestore, "media"),
          where("fingerprint", "==", fingerprint),
          where("folder", "==", folder)
        )
      )

      let url = ""
      let path = ""

      if (!existing.empty) {
        const existingData = existing.docs[0].data() as { url?: string; path?: string }
        url = existingData.url || ""
        path = existingData.path || extractStoragePathFromUrl(url)
      } else {
        const safeName = file.name.replace(/[^\w.\-]+/g, "_")
        path = storagePath(folder, `${fingerprint.replace(/[^\w.\-]+/g, "_")}-${safeName}`)
        url = await uploadFile(file, path)

        await addDoc(collection(firestore, "media"), {
          fileName: file.name,
          url,
          path,
          folder,
          altText: file.name,
          uploadedAt: serverTimestamp(),
          size: file.size,
          type: file.type,
          fingerprint,
          relatedCollection: relatedCollection || "",
          relatedId: relatedId || "",
          relatedTitle: relatedTitle || "",
          status: "active",
        })
      }

      if (currentUrl && currentUrl !== url) {
        await deleteFileByUrl(currentUrl)
        await removeMediaMetadataByUrl(currentUrl)
      }

      onUploaded(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setLoading(false)
      event.target.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[var(--color-subheading)]">{label}</label>
      {currentUrl ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] p-3">
          <div className="relative h-28 w-full overflow-hidden rounded-lg">
            <Image src={currentUrl} alt={label} fill className="object-cover" unoptimized />
          </div>
          <p className="mt-2 text-xs text-[var(--color-body)]">{fileName || "Current file"}</p>
          {relatedTitle ? <p className="text-xs text-[var(--color-muted)]">{relatedTitle}</p> : null}
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="mt-2 rounded-lg border border-red-300 px-2 py-1 text-xs font-semibold text-red-700"
          >
            Delete Image
          </button>
        </div>
      ) : null}
      <input type="file" accept="image/*" onChange={handleUpload} className="block w-full text-sm text-[var(--color-body)]" />
      {loading ? <p className="text-xs text-[var(--color-muted)]">Uploading...</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Image"
        description="This will remove the image from Firebase Storage and media metadata."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (!currentUrl) {
            setConfirmDelete(false)
            return
          }
          try {
            await deleteFileByUrl(currentUrl)
            await removeMediaMetadataByUrl(currentUrl)
            onDeleted?.()
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to delete image")
          } finally {
            setConfirmDelete(false)
          }
        }}
      />
    </div>
  )
}
