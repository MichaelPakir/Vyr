import { useState } from "react"

const CreateAccountForm = ({
  title,
  subtitle,
  buttonText,
  fields,
  onSubmit,
  showGoogleSignIn = false,
  googleButtonText = "Continue with Google",
  onGoogleSignIn,
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
    <section className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl">
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
                className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-white/30 focus:bg-zinc-900"
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.99]"
          >
            {buttonText}
          </button>
        </form>

        {showGoogleSignIn && (
          <div className="mt-6">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                or
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              onClick={onGoogleSignIn}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-zinc-950 px-5 py-4 font-semibold text-white transition hover:border-white/20 hover:bg-zinc-900 active:scale-[0.99]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-zinc-950">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="100"
                  height="100"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  ></path>
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  ></path>
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                </svg>
              </span>
              <span>{googleButtonText}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default CreateAccountForm
