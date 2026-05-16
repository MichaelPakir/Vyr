import { useState } from "react"
import { useRef } from "react"

const TicketForm = ({ isFormOpen, onSubmit, onClose }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState([])
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    // build FormData to include attachments
    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)

    files.forEach((f) => {
      formData.append("attachments", f)
    })

    onSubmit(formData)

    setTitle("")
    setDescription("")
    setFiles([])
  }

  if (!isFormOpen) return null

  const onPaste = (e) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.kind === "file") {
        const file = item.getAsFile()
        if (file) {
          setFiles((prev) => [...prev, file])
        }
      }
    }
  }

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length) setFiles((prev) => [...prev, ...selected])
    // reset input so same file can be added again if needed
    e.target.value = null
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <section className="w-full max-w-2xl rounded-3xl border border-white/10 bg-zinc-950 p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Support Ticket
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
            Create New Ticket
          </h2>

          <p className="mt-3 text-zinc-400">
            Describe the issue clearly so your team can resolve it efficiently.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Title
            </label>

            <input
              type="text"
              placeholder="Payment gateway issue..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-white/30 focus:bg-zinc-800"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Description
            </label>

            <textarea
              rows={6}
              placeholder="Explain the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onPaste={onPaste}
              className="w-full resize-none rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-white/30 focus:bg-zinc-800"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Attachments
            </label>

            <div className="mb-2 flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Select images
              </button>

              <span className="text-sm text-zinc-500">or paste image (Ctrl+V)</span>
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {files.map((f, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="h-24 w-full rounded object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.98]"
            >
              Create Ticket
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default TicketForm
