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
  session_date: string | null;
  location: string | null;
  coach_name: string | null;
  team_name: string | null;
  session_goal: string | null;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [theme, setTheme] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  const [sessionDate, setSessionDate] = useState("");
  const [location, setLocation] = useState("");
  const [coachName, setCoachName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [sessionGoal, setSessionGoal] = useState("");

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
      session_date: sessionDate || null,
      location: location || null,
      coach_name: coachName || null,
      team_name: teamName || null,
      session_goal: sessionGoal || null,
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
    setSessionDate("");
    setLocation("");
    setCoachName("");
    setTeamName("");
    setSessionGoal("");

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

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="sessionDate" className="field-label">
                  Dato
                </label>
                <input
                  id="sessionDate"
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="location" className="field-label">
                  Sted
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-field"
                  placeholder="For eksempel: Atlanten stadion"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="coachName" className="field-label">
                  Trenavn
                </label>
                <input
                  id="coachName"
                  type="text"
                  value={coachName}
                  onChange={(e) => setCoachName(e.target.value)}
                  className="input-field"
                  placeholder="For eksempel: John"
                />
              </div>

              <div>
                <label htmlFor="teamName" className="field-label">
                  Lag / årskull
                </label>
                <input
                  id="teamName"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="input-field"
                  placeholder="For eksempel: G2018"
                />
              </div>
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
              <label htmlFor="sessionGoal" className="field-label">
                Øktmål
              </label>
              <textarea
                id="sessionGoal"
                value={sessionGoal}
                onChange={(e) => setSessionGoal(e.target.value)}
                className="textarea-field"
                placeholder="For eksempel: Barna skal ha mange ballberøringer og øve på føring med kontroll."
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
            <div className="mt-6 rounded-xl border border-dashed border-black/15 bg-[#fafafa] p-6">
              <h3 className="text-lg font-semibold">Ingen lagrede økter</h3>
              <p className="mt-2 text-black/70">
                Fyll ut skjemaet til venstre for å opprette din første treningsøkt.
              </p>
              <p className="mt-2 text-sm text-black/55">
                Tips: Start enkelt med navn, dato, lag og tema.
              </p>
            </div>
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
                    Lag: {session.team_name || "Ikke satt"}
                  </p>
                  <p className="mt-1 text-sm text-black/70">
                    Tema: {session.theme || "Ikke satt"}
                  </p>
                  <p className="mt-1 text-sm text-black/70">
                    Dato: {session.session_date || "Ikke satt"}
                  </p>
                  <p className="mt-1 text-sm text-black/70">
                    Varighet: {session.duration ? `${session.duration} min` : "Ikke satt"}
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