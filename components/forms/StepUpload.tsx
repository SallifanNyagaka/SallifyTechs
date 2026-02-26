"use client"

type StepUploadProps = {
  files: File[]
  onAddFiles: (files: FileList | null) => void
  onRemoveFile: (index: number) => void
  uploadProgress: number
  uploading: boolean
}

export default function StepUpload({
  files,
  onAddFiles,
  onRemoveFile,
  uploadProgress,
  uploading,
}: StepUploadProps) {
  return (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold text-[var(--color-heading)]">File Uploads</h3>
      <p className="text-sm text-[var(--color-body)]">
        Upload design files, mockups, logos, documents, PDFs, or reference screenshots.
      </p>

      <label className="block rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-section-alt)] p-6 text-center text-sm text-[var(--color-body)]">
        <span className="font-semibold text-[var(--color-heading)]">Click to choose files</span>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar,.png,.jpg,.jpeg,.webp,.svg"
          className="sr-only"
          onChange={(event) => onAddFiles(event.target.files)}
        />
      </label>

      {files.length ? (
        <ul className="space-y-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-4">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-[var(--color-body)]">{file.name}</span>
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                className="rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-body)] transition hover:border-red-500 hover:text-red-500"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {uploading ? (
        <div className="space-y-2">
          <p className="text-xs text-[var(--color-muted)]">Uploading files... {uploadProgress}%</p>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--color-section-alt)]">
            <div className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
