"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Session = {
  id: number;
  title: string;
  age_group: string | null;
  theme: string | null;
  duration: number | null;
  notes: string | null;
  created_at: string;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [theme, setTheme] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function fetchSessions() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("Du må være logget inn.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setSessions(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  async function handleCreateSession(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("Du må være logget inn.");
      return;
    }

    const { error } = await supabase.from("sessions").insert({
      user_id: user.id,
      title,
      age_group: ageGroup || null,
      theme: theme || null,
      duration: duration ? Number(duration) : null,
      notes: notes || null,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Økt opprettet.");
    setTitle("");
    setAgeGroup("");
    setTheme("");
    setDuration("");
    setNotes("");

    fetchSessions();
  }

  return (
    <section className="page-section">
      <div className="max-w-3xl">
        <h1 className="page-title">Mine økter</h1>
        <p className="page-subtitle">
          Opprett, planlegg og lagre dine egne treningsøkter.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="card card-padding">
          <h2 className="section-title">Opprett ny økt</h2>

          <form onSubmit={handleCreateSession} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="title" className="field-label">
                Navn på økt
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="For eksempel: Tirsdagstrening uke 18"
                required
              />
            </div>

            <div>
              <label htmlFor="ageGroup" className="field-label">
                Alder
              </label>
              <input
                id="ageGroup"
                type="text"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="input-field"
                placeholder="For eksempel: 5–8 år"
              />
            </div>

            <div>
              <label htmlFor="theme" className="field-label">
                Tema
              </label>
              <input
                id="theme"
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="input-field"
                placeholder="For eksempel: føring og lek"
              />
            </div>

            <div>
              <label htmlFor="duration" className="field-label">
                Varighet i minutter
              </label>
              <input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="input-field"
                placeholder="For eksempel: 60"
              />
            </div>

            <div>
              <label htmlFor="notes" className="field-label">
                Egne notater
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="textarea-field"
                placeholder="Skriv notater her"
              />
            </div>

            <button type="submit" className="primary-button">
              Opprett økt
            </button>
          </form>

          {message && <p className="success-message mt-4">{message}</p>}

          {errorMessage && <p className="error-message mt-4">{errorMessage}</p>}
        </div>

        <div className="card card-padding">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Lagrede økter</h2>
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-black/70">
              {sessions.length} stk
            </span>
          </div>

          {loading ? (
            <p className="mt-6 text-black/70">Laster økter...</p>
          ) : sessions.length === 0 ? (
            <p className="mt-6 text-black/70">Du har ingen økter ennå.</p>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              {sessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/dashboard/sessions/${session.id}`}
                  className="card-soft block transition hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold">{session.title}</h3>
                  <p className="mt-2 text-sm text-black/70">
                    Alder: {session.age_group || "Ikke satt"}
                  </p>
                  <p className="mt-1 text-sm text-black/70">
                    Tema: {session.theme || "Ikke satt"}
                  </p>
                  <p className="mt-1 text-sm text-black/70">
                    Varighet:{" "}
                    {session.duration ? `${session.duration} min` : "Ikke satt"}
                  </p>
                  <p className="mt-2 text-sm text-black/60">
                    {session.notes || "Ingen notater"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}