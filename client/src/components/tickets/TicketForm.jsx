import { useState } from "react"

const TicketForm = ({ isFormOpen, onSubmit, onClose }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    onSubmit({
      title,
      description,
    })

    setTitle("")
    setDescription("")
  }

  if (!isFormOpen) return null

  return (
    <section className="mb-8 rounded-2xl bg-white p-6 shadow">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-green-600 px-4 py-2 text-white"
          >
            Submit
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-300 px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}

export default TicketForm
