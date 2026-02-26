"use client"

import { useState } from "react"
import Image from "next/image"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import EditorLayout from "@/components/admin/EditorLayout"
import DataTable from "@/components/admin/DataTable"
import ImageUploader from "@/components/admin/ImageUploader"
import LoadingSkeleton from "@/components/admin/LoadingSkeleton"
import { MediaItem } from "@/types/cms"
import { useCollection } from "@/hooks/admin/useCollection"
import { removeDocument, upsertDocument } from "@/services/firestore"
import { useToast } from "@/components/admin/ToastProvider"

type ExtendedMediaItem = MediaItem & {
  path?: string
  relatedCollection?: string
  relatedId?: string
  relatedTitle?: string
}

export default function MediaManager() {
  const { data, loading } = useCollection<ExtendedMediaItem>("media")
  const { notify } = useToast()
  const [values, setValues] = useState<ExtendedMediaItem>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (loading) return <LoadingSkeleton rows={6} />

  const saveMedia = async () => {
    const id = values.id || `${Date.now()}`
    await upsertDocument("media", id, {
      ...values,
      id,
      uploadedAt: values.uploadedAt || new Date().toISOString(),
    })
    setValues({})
    notify("Media entry saved")
  }

  const deleteMedia = async () => {
    if (!deleteId) return
    await removeDocument("media", deleteId)
    setDeleteId(null)
    notify("Media deleted")
  }

  return (
    <div className="space-y-8">
      <EditorLayout
        title="Media Library"
        subtitle="Upload, preview, replace, and remove assets with storage cleanup."
        actions={
          <button
            onClick={saveMedia}
            className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]"
          >
            Save Media
          </button>
        }
      >
        <div className="grid gap-6 md:grid-cols-2">
          <ImageUploader
            folder="media/uploads"
            label="Upload Asset"
            currentUrl={values.url}
            relatedCollection="media"
            relatedId={values.id}
            relatedTitle={values.relatedTitle || values.fileName}
            onDeleted={() => setValues((prev) => ({ ...prev, url: "", path: "" }))}
            onUploaded={(url) => setValues((prev) => ({ ...prev, url }))}
          />
          <div className="space-y-4">
            <label className="text-sm font-medium text-[var(--color-body)]">
              File Name
              <input
                value={values.fileName || ""}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, fileName: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"
              />
            </label>
            <label className="text-sm font-medium text-[var(--color-body)]">
              Folder
              <input
                value={values.folder || "media/uploads"}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, folder: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"
              />
            </label>
            <label className="text-sm font-medium text-[var(--color-body)]">
              Alt Text
              <input
                value={values.altText || ""}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, altText: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"
              />
            </label>
            <label className="text-sm font-medium text-[var(--color-body)]">
              Related Content Title
              <input
                value={values.relatedTitle || ""}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, relatedTitle: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-section)] px-3 py-2 text-sm text-[var(--color-heading)]"
              />
            </label>
          </div>
        </div>
      </EditorLayout>

      <DataTable
        data={data}
        columns={[
          {
            header: "Preview",
            accessor: (row) =>
              row.url ? (
                <div className="relative h-16 w-24 overflow-hidden rounded-md">
                  <Image
                    src={row.url}
                    alt={row.altText || row.fileName || "media"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <span className="text-xs text-[var(--color-muted)]">No image</span>
              ),
          },
          { header: "File Name", accessor: (row) => row.fileName || "-" },
          { header: "Folder", accessor: (row) => row.folder || "-" },
          { header: "Related", accessor: (row) => row.relatedTitle || `${row.relatedCollection || ""} ${row.relatedId || ""}`.trim() || "-" },
          {
            header: "Actions",
            accessor: (row) => (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setValues(row)}
                  className="rounded border border-[var(--color-border)] px-2 py-1 text-xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(row.id || null)}
                  className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Media"
        description="This removes the media document and its file from Firebase Storage."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void deleteMedia()}
      />
    </div>
  )
}
