"use client"

import { useMemo, useState } from "react"
import { serverTimestamp } from "firebase/firestore"
import Link from "next/link"
import EditorLayout from "@/components/admin/EditorLayout"
import FormBuilder from "@/components/admin/FormBuilder"
import ImageUploader from "@/components/admin/ImageUploader"
import DataTable from "@/components/admin/DataTable"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import LoadingSkeleton from "@/components/admin/LoadingSkeleton"
import RichTextEditor from "@/components/admin/RichTextEditor"
import { BlogPost } from "@/types/cms"
import { useCollection } from "@/hooks/admin/useCollection"
import { upsertDocument, removeDocument } from "@/services/firestore"
import { useToast } from "@/components/admin/ToastProvider"

type EditorBlog = BlogPost & {
  heroImageUrl?: string
  galleryImages?: string[]
  bloggerName?: string
  bloggerPhotoUrl?: string
  publishedDate?: string
  createdAt?: unknown
  updatedAt?: unknown
}

function parseCsv(text: string) {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseLines(text: string) {
  return text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
}

function toLines(values?: string[]) {
  return (values || []).join("\n")
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

function normalizeBlog(item: BlogPost): EditorBlog {
  return {
    ...item,
    bloggerName: item.bloggerName || item.blogger_name || item.author || "",
    bloggerPhotoUrl: item.bloggerPhotoUrl || item.blogger_photo_url || "",
    heroImageUrl: item.heroImageUrl || item.hero_image_url || item.featuredImage || "",
    galleryImages: item.galleryImages || item.gallery_images || [],
    publishedDate: typeof item.publishedDate === "string" ? item.publishedDate : "",
  }
}

const basicFields = [
  { name: "title", label: "Title" },
  { name: "slug", label: "Slug" },
  { name: "bloggerName", label: "Blogger Name" },
  { name: "category", label: "Category" },
  { name: "readTime", label: "Read Time (min)", type: "number" as const },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { label: "Published", value: "published" },
      { label: "Draft", value: "draft" },
    ],
  },
  { name: "excerpt", label: "Excerpt", type: "textarea" as const },
]

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-heading)] dark:text-[var(--color-heading)] placeholder:text-[var(--color-muted)] dark:placeholder:text-[var(--color-muted)]"

export default function BlogManager() {
  const { data, loading } = useCollection<BlogPost>("blogs")
  const { notify } = useToast()
  const [values, setValues] = useState<EditorBlog>({ status: "published" })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const records = useMemo(
    () => data.map(normalizeBlog).sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [data]
  )

  if (loading) return <LoadingSkeleton rows={8} />

  const savePost = async () => {
    const slug = values.slug || (values.title ? slugify(values.title) : "")
    if (!values.title || !slug) {
      notify("Title and slug are required")
      return
    }

    const id = values.id || slug
    const publishedDate = values.publishedDate || new Date().toISOString()

    const payload: EditorBlog = {
      ...values,
      id,
      slug,
      author: values.bloggerName || "",
      bloggerName: values.bloggerName || "",
      blogger_name: values.bloggerName || "",
      bloggerPhotoUrl: values.bloggerPhotoUrl || "",
      blogger_photo_url: values.bloggerPhotoUrl || "",
      featuredImage: values.heroImageUrl || "",
      heroImageUrl: values.heroImageUrl || "",
      hero_image_url: values.heroImageUrl || "",
      galleryImages: values.galleryImages || [],
      gallery_images: values.galleryImages || [],
      publishedDate,
      published_date: publishedDate,
      publishedAt: publishedDate,
      tags: values.tags || [],
      createdAt: values.createdAt || serverTimestamp(),
      created_at: values.created_at || serverTimestamp(),
      updatedAt: serverTimestamp(),
      updated_at: serverTimestamp(),
    }

    await upsertDocument("blogs", id, payload)
    setValues({ status: "published" })
    notify("Blog post saved")
  }

  const deletePost = async () => {
    if (!deleteId) return
    await removeDocument("blogs", deleteId)
    setDeleteId(null)
    notify("Blog post deleted")
  }

  return (
    <div className="space-y-8">
      <EditorLayout
        title="Blog"
        subtitle="Create rich blog posts with author profile, inline images, and gallery." 
        actions={
          <div className="flex flex-wrap gap-3">
            {values.slug ? (
              <Link
                href={`/blog/${values.slug}`}
                target="_blank"
                className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-body)] dark:border-[var(--color-border)] dark:text-[var(--color-heading)]"
              >
                Preview
              </Link>
            ) : null}
            <button
              onClick={savePost}
              className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]"
            >
              Save Post
            </button>
          </div>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">Post Overview</h2>
              <FormBuilder
                fields={basicFields}
                values={values as unknown as Record<string, unknown>}
                onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value as never }))}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-[var(--color-body)] dark:text-[var(--color-subheading)]">
                  Tags (comma-separated)
                  <input
                    value={(values.tags || []).join(", ")}
                    onChange={(event) =>
                      setValues((prev) => ({
                        ...prev,
                        tags: parseCsv(event.target.value),
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-heading)] dark:text-[var(--color-heading)]"
                  />
                </label>
                <label className="text-sm font-medium text-[var(--color-body)] dark:text-[var(--color-subheading)]">
                  Published Date
                  <input
                    type="date"
                    value={values.publishedDate ? values.publishedDate.slice(0, 10) : ""}
                    onChange={(event) => setValues((prev) => ({ ...prev, publishedDate: event.target.value }))}
                    className="mt-2 w-full rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-heading)] dark:text-[var(--color-heading)]"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">Content</h2>
              <RichTextEditor
                value={values.content || ""}
                onChange={(value) => setValues((prev) => ({ ...prev, content: value }))}
              />
              <ImageUploader
                folder="media/blog"
                label="Upload Inline Image"
                onUploaded={(url) =>
                  setValues((prev) => ({
                    ...prev,
                    content: `${prev.content || ""}<p><img src=\"${url}\" alt=\"Inline blog image\" /></p>`,
                  }))
                }
              />
            </section>
          </div>

          <div className="space-y-6">
            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">Author & Hero</h2>
              <ImageUploader
                folder="media/blog"
                label="Hero Image"
                onUploaded={(url) => setValues((prev) => ({ ...prev, heroImageUrl: url }))}
              />
              <ImageUploader
                folder="media/blog"
                label="Blogger Photo"
                onUploaded={(url) => setValues((prev) => ({ ...prev, bloggerPhotoUrl: url }))}
              />
              <input
                placeholder="Blogger photo URL (optional)"
                value={values.bloggerPhotoUrl || ""}
                onChange={(event) => setValues((prev) => ({ ...prev, bloggerPhotoUrl: event.target.value }))}
                className={inputClass}
              />
            </section>

            <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
              <h2 className="text-lg font-semibold text-[var(--color-heading)] dark:text-[var(--color-subheading)]">Gallery Images</h2>
              <ImageUploader
                folder="media/blog"
                label="Add Gallery Image"
                onUploaded={(url) =>
                  setValues((prev) => ({
                    ...prev,
                    galleryImages: [...(prev.galleryImages || []), url],
                  }))
                }
              />
              <label className="block text-sm font-medium text-[var(--color-body)] dark:text-[var(--color-subheading)]">
                Gallery URLs (one per line)
                <textarea
                  value={toLines(values.galleryImages)}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, galleryImages: parseLines(event.target.value) }))
                  }
                  className="mt-2 min-h-[160px] w-full rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-bg)] px-3 py-2 text-xs text-[var(--color-body)] dark:text-[var(--color-heading)]"
                />
              </label>
            </section>
          </div>
        </div>
      </EditorLayout>

      <DataTable
        data={records}
        columns={[
          { header: "Title", accessor: (row) => row.title },
          { header: "Author", accessor: (row) => row.bloggerName || row.author || "" },
          { header: "Category", accessor: (row) => row.category || "" },
          { header: "Status", accessor: (row) => row.status || "" },
          {
            header: "Actions",
            accessor: (row) => (
              <div className="flex gap-2">
                <button
                  className="text-xs font-semibold text-[var(--color-body)] dark:text-[var(--color-heading)]"
                  onClick={() => setValues(row)}
                >
                  Edit
                </button>
                {row.slug ? (
                  <Link
                    href={`/blog/${row.slug}`}
                    target="_blank"
                    className="text-xs font-semibold text-[var(--color-body)] dark:text-[var(--color-heading)]"
                  >
                    Preview
                  </Link>
                ) : null}
                <button
                  className="text-xs font-semibold text-red-500"
                  onClick={() => setDeleteId(row.id || "")}
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
        title="Delete blog post"
        description="This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={deletePost}
      />
    </div>
  )
}
