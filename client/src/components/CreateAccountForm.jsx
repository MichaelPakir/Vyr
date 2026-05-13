import { useState } from "react"

const CreateAccountForm = ({
  title,
  subtitle,
  buttonText,
  fields,
  onSubmit,
}) => {
  const initialState = fields.reduce((acc, field) => {
    acc[field.name] = ""
    return acc
  }, {})

  const [formData, setFormData] = useState(initialState)

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    await onSubmit(formData)
  }

  return (
    <section
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-zinc-950
        px-6
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-3xl
          border
          border-white/10
          bg-zinc-900
          p-8
          shadow-2xl
        "
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {title}
          </h1>

          <p className="mt-3 text-zinc-400">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                {field.label}
              </label>

              <input
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={handleChange}
                className="
                  w-full
                  rounded-2xl
                  border
                  border-white/10
                  bg-zinc-950
                  px-4
                  py-4
                  text-white
                  outline-none
                  transition
                  placeholder:text-zinc-500
                  focus:border-white/30
                  focus:bg-zinc-900
                "
              />
            </div>
          ))}

          <button
            type="submit"
            className="
              w-full
              rounded-2xl
              bg-white
              px-5
              py-4
              font-semibold
              text-black
              transition
              hover:bg-zinc-200
              active:scale-[0.99]
            "
          >
            {buttonText}
          </button>
        </form>
      </div>
    </section>
  )
}

export default CreateAccountForm
