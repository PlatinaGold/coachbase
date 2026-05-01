"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Bruker opprettet. Sjekk e-posten din for bekreftelse.");
    setName("");
    setEmail("");
    setPassword("");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#f3f3f3] text-[#1f1f1f]">
      <section className="page-section-narrow flex min-h-screen items-center">
        <div className="w-full">
          <div className="mb-10 text-center">
            <Link href="/" className="text-sm font-medium text-black/60 hover:text-black">
              ← Tilbake til forsiden
            </Link>
            <h1 className="page-title mt-4">Ny bruker</h1>
            <p className="page-subtitle">
              Opprett bruker for å lagre økter og øvelser i CoachBase.
            </p>
          </div>

          <div className="card card-padding mx-auto max-w-md">
            <form onSubmit={handleSignup} className="flex flex-col gap-5">
              <div>
                <label htmlFor="name" className="field-label">
                  Navn
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="navn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="email" className="field-label">
                  E-post
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="epost"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="password" className="field-label">
                  Passord
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="passord"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                />
              </div>

              <button type="submit" disabled={loading} className="primary-button">
                {loading ? "Oppretter bruker..." : "Opprett bruker"}
              </button>

              <div className="mt-2 flex items-center justify-between text-sm">
                <Link href="/login" className="hover:underline">
                  Har du allerede bruker?
                </Link>

                <Link href="/login" className="hover:underline">
                  Logg inn
                </Link>
              </div>
            </form>

            {message && <p className="success-message mt-6">{message}</p>}
            {errorMessage && <p className="error-message mt-6">{errorMessage}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}