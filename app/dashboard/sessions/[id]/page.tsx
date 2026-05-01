"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

type Session = {
  id: number;
  title: string;
  age_group: string | null;
  theme: string | null;
  duration: number | null;
  notes: string | null;
  created_at: string;
};

type SessionExercise = {
  id: number;
  sort_order: number | null;
  exercise:
    | {
        id: number;
        title: string;
        focus_area: string | null;
        duration: number | null;
      }
    | null;
};

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [theme, setTheme] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  async function loadSessionDetails() {
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

    const sessionId = Number(params.id);

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      setErrorMessage("Fant ikke økten.");
      setLoading(false);
      return;
    }

    setSession(data);
    setTitle(data.title || "");
    setAgeGroup(data.age_group || "");
    setTheme(data.theme || "");
    setDuration(data.duration ? String(data.duration) : "");
    setNotes(data.notes || "");

    const { data: exercisesData, error: exercisesError } = await supabase
      .from("session_exercises")
      .select(
        `
        id,
        sort_order,
        exercise:exercises (
          id,
          title,
          focus_area,
          duration
        )
      `
      )
      .eq("session_id", data.id)
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true });

    if (exercisesError) {
      setErrorMessage(exercisesError.message);
      setLoading(false);
      return;
    }

    setSessionExercises((exercisesData ?? []) as unknown as SessionExercise[]);
    setLoading(false);
  }

  useEffect(() => {
    if (params?.id) {
      loadSessionDetails();
    }
  }, [params]);

  async function handleUpdateSession(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !session) {
      setErrorMessage("Du må være logget inn.");
      return;
    }

    const { error } = await supabase
      .from("sessions")
      .update({
        title,
        age_group: ageGroup || null,
        theme: theme || null,
        duration: duration ? Number(duration) : null,
        notes: notes || null,
      })
      .eq("id", session.id)
      .eq("user_id", user.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSession({
      ...session,
      title,
      age_group: ageGroup || null,
      theme: theme || null,
      duration: duration ? Number(duration) : null,
      notes: notes || null,
    });

    setMessage("Økten er oppdatert.");
    setIsEditing(false);
  }

  async function handleDeleteSession() {
    const confirmed = window.confirm(
      "Er du sikker på at du vil slette denne økten?"
    );

    if (!confirmed || !session) return;

    setMessage("");
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("Du må være logget inn.");
      return;
    }

    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", session.id)
      .eq("user_id", user.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/dashboard/sessions");
  }

  async function handleRemoveExercise(sessionExerciseId: number) {
    const confirmed = window.confirm("Fjerne denne øvelsen fra økten?");

    if (!confirmed) return;

    setMessage("");
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("Du må være logget inn.");
      return;
    }

    const { error } = await supabase
      .from("session_exercises")
      .delete()
      .eq("id", sessionExerciseId)
      .eq("user_id", user.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Øvelsen ble fjernet fra økten.");
    loadSessionDetails();
  }

  async function handleMoveExercise(
    currentId: number,
    direction: "up" | "down"
  ) {
    setMessage("");
    setErrorMessage("");

    const currentIndex = sessionExercises.findIndex(
      (item) => item.id === currentId
    );

    if (currentIndex === -1) return;

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sessionExercises.length) return;

    const currentItem = sessionExercises[currentIndex];
    const targetItem = sessionExercises[targetIndex];

    const currentSortOrder = currentItem.sort_order ?? currentIndex + 1;
    const targetSortOrder = targetItem.sort_order ?? targetIndex + 1;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("Du må være logget inn.");
      return;
    }

    const { error: error1 } = await supabase
      .from("session_exercises")
      .update({ sort_order: targetSortOrder })
      .eq("id", currentItem.id)
      .eq("user_id", user.id);

    if (error1) {
      setErrorMessage(error1.message);
      return;
    }

    const { error: error2 } = await supabase
      .from("session_exercises")
      .update({ sort_order: currentSortOrder })
      .eq("id", targetItem.id)
      .eq("user_id", user.id);

    if (error2) {
      setErrorMessage(error2.message);
      return;
    }

    setMessage("Rekkefølgen ble oppdatert.");
    loadSessionDetails();
  }

  const exerciseCount = sessionExercises.length;

  const totalExerciseDuration = sessionExercises.reduce((sum, item) => {
    return sum + (item.exercise?.duration || 0);
  }, 0);

  return (
    <section className="page-section">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            href="/dashboard/sessions"
            className="text-sm font-medium text-black/60 hover:text-black"
          >
            ← Tilbake til mine økter
          </Link>
          {!loading && session && (
            <>
              <h1 className="page-title mt-4">{session.title}</h1>
              <p className="page-subtitle">
                Opprettet:{" "}
                {new Date(session.created_at).toLocaleDateString("no-NO")}
              </p>
            </>
          )}
        </div>

        {!loading && session && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setMessage("");
              }}
              className="primary-button"
            >
              {isEditing ? "Avbryt" : "Rediger økt"}
            </button>

            <button onClick={handleDeleteSession} className="danger-button">
              Slett økt
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="mt-8 text-lg text-black/70">Laster økt...</p>
      ) : errorMessage ? (
        <p className="error-message mt-8">{errorMessage}</p>
      ) : session ? (
        <div className="mt-8 space-y-6">
          {message && <p className="success-message">{message}</p>}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="card-soft">
              <h2 className="meta-label">Antall øvelser</h2>
              <p className="mt-2 text-3xl font-bold">{exerciseCount}</p>
            </div>

            <div className="card-soft">
              <h2 className="meta-label">Total øvelsestid</h2>
              <p className="mt-2 text-3xl font-bold">
                {totalExerciseDuration} min
              </p>
            </div>

            <div className="card-soft">
              <h2 className="meta-label">Øktstatus</h2>
              <p className="mt-2 text-3xl font-bold">
                {exerciseCount > 0 ? "Planlagt" : "Tom"}
              </p>
            </div>
          </div>

          <div className="card card-padding-lg">
            {isEditing ? (
              <form
                onSubmit={handleUpdateSession}
                className="grid gap-4"
              >
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
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
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
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="field-label">
                    Notater
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="textarea-field"
                  />
                </div>

                <button type="submit" className="primary-button">
                  Lagre endringer
                </button>
              </form>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="card-soft">
                    <h2 className="text-lg font-semibold">Alder</h2>
                    <p className="mt-2 text-black/70">
                      {session.age_group || "Ikke satt"}
                    </p>
                  </div>

                  <div className="card-soft">
                    <h2 className="text-lg font-semibold">Tema</h2>
                    <p className="mt-2 text-black/70">
                      {session.theme || "Ikke satt"}
                    </p>
                  </div>

                  <div className="card-soft">
                    <h2 className="text-lg font-semibold">Varighet</h2>
                    <p className="mt-2 text-black/70">
                      {session.duration
                        ? `${session.duration} min`
                        : "Ikke satt"}
                    </p>
                  </div>

                  <div className="card-soft">
                    <h2 className="text-lg font-semibold">Status</h2>
                    <p className="mt-2 text-black/70">Klar til bruk</p>
                  </div>
                </div>

                <div className="mt-6 card-soft">
                  <h2 className="text-lg font-semibold">Notater</h2>
                  <p className="mt-2 whitespace-pre-line text-black/70">
                    {session.notes || "Ingen notater"}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="card card-padding-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="section-title">Øvelser i økten</h2>
                <p className="mt-2 text-black/70">
                  Denne økta inneholder {exerciseCount} øvelse
                  {exerciseCount === 1 ? "" : "r"} med totalt{" "}
                  {totalExerciseDuration} minutter.
                </p>
              </div>

              <Link href="/dashboard/exercises" className="primary-button">
                Finn øvelse
              </Link>
            </div>

            {sessionExercises.length === 0 ? (
              <p className="mt-6 text-black/70">
                Ingen øvelser lagt til ennå.
              </p>
            ) : (
              <div className="mt-6 flex flex-col gap-4">
                {sessionExercises.map((item) => (
                  <div
                    key={item.id}
                    className="card-soft flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-black/50">
                        Øvelse {item.sort_order || "-"}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold">
                        {item.exercise?.title || "Ukjent øvelse"}
                      </h3>
                      <p className="mt-2 text-sm text-black/70">
                        Fokusområde:{" "}
                        {item.exercise?.focus_area || "Ikke satt"}
                      </p>
                      <p className="mt-1 text-sm text-black/70">
                        Varighet:{" "}
                        {item.exercise?.duration
                          ? `${item.exercise.duration} min`
                          : "Ikke satt"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleMoveExercise(item.id, "up")}
                        className="secondary-button"
                      >
                        Oppover
                      </button>

                      <button
                        onClick={() => handleMoveExercise(item.id, "down")}
                        className="secondary-button"
                      >
                        Nedover
                      </button>

                      <button
                        onClick={() => handleRemoveExercise(item.id)}
                        className="danger-button"
                      >
                        Fjern
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}