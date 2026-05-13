import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Home = () => {
  const { user } = useAuth()
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm uppercase tracking-[0.3em] text-zinc-500">
              Modern Support Platform
            </p>

            <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              Manage support tickets with clarity and speed.
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-zinc-400">
              A streamlined ticket management platform built for teams that
              value organization, efficiency, and exceptional support workflows.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              {user ? (
                <></>
              ) : (
                <>
                  <Link to="/register" className="rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-zinc-200">
                    Get Started
                  </Link>

                  <Link to="/login" className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-white transition hover:bg-white/10">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="absolute -right-50 -top-50 h-125 w-125 rounded-full bg-blue-500/10 blur-3xl" />
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Features
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight">
              Everything your support team needs.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: "🎫",
                title: "Ticket Management",
                desc: "Organize and resolve support requests efficiently.",
              },
              {
                icon: "⚡",
                title: "Fast Collaboration",
                desc: "Enable teams to work together seamlessly.",
              },
              {
                icon: "📊",
                title: "Insights & Analytics",
                desc: "Track performance and response metrics.",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-white/10 bg-zinc-900 p-8 transition hover:border-white/20 hover:bg-zinc-900/70">
                <div className="text-4xl">{feature.icon}</div>

                <h3 className="mt-6 text-2xl font-semibold">{feature.title}</h3>

                <p className="mt-4 leading-relaxed text-zinc-400">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
