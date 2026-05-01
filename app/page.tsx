import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f3f3f3] text-[#1f1f1f]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold tracking-tight">CoachBase</div>

          <nav className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-md bg-black/5 px-3 py-2 text-sm font-medium"
            >
              Hjem
            </Link>
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-medium transition hover:bg-black/5"
            >
              Logg inn
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-black px-4 py-2 text-sm text-white transition hover:bg-black/85"
            >
              Opprett bruker
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-black/45">
              CoachBase
            </p>

            <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-6xl">
              Planlegg gode fotballøkter enkelt
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-black/70">
              For nye trenere i barnefotball. Finn øvelser, bygg økter, lag egne
              øvelser og få bedre oversikt over treningene dine.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="primary-button">
                Kom i gang
              </Link>
              <Link href="/login" className="secondary-button">
                Logg inn
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="card-soft">
                <p className="meta-label">Øvelser</p>
                <p className="mt-2 text-base font-semibold">Felles og egne</p>
              </div>

              <div className="card-soft">
                <p className="meta-label">Økter</p>
                <p className="mt-2 text-base font-semibold">Bygg og sorter</p>
              </div>

              <div className="card-soft">
                <p className="meta-label">Målgruppe</p>
                <p className="mt-2 text-base font-semibold">Barnefotball</p>
              </div>
            </div>
          </div>

          <div className="card card-padding-lg">
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-black/10">
                <Image
                  src="/football-pitch.png"
                  alt="Fotballbane illustrasjon"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <p className="mt-4 text-sm text-black/55">
                Visualiser økter, øvelser og banestruktur i CoachBase.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="card card-padding">
            <p className="meta-label">1</p>
            <h2 className="mt-2 text-xl font-semibold">Finn øvelser</h2>
            <p className="mt-3 text-black/70">
              Bruk øvelsesbanken til å finne passende øvelser for alder,
              fokusområde og nivå.
            </p>
          </div>

          <div className="card card-padding">
            <p className="meta-label">2</p>
            <h2 className="mt-2 text-xl font-semibold">Bygg en økt</h2>
            <p className="mt-3 text-black/70">
              Opprett en økt og legg inn øvelser i riktig rekkefølge med total
              oversikt over innholdet.
            </p>
          </div>

          <div className="card card-padding">
            <p className="meta-label">3</p>
            <h2 className="mt-2 text-xl font-semibold">Lag egne øvelser</h2>
            <p className="mt-3 text-black/70">
              Opprett egne øvelser, rediger dem og bruk dem igjen i nye økter.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="card card-padding-lg text-center">
          <h2 className="text-3xl font-bold">Klar til å komme i gang?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-black/70">
            Opprett bruker og start med å bygge dine første økter i CoachBase.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <Link href="/signup" className="primary-button">
              Opprett bruker
            </Link>
            <Link href="/login" className="secondary-button">
              Logg inn
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}