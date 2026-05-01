"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

type Exercise = {
  id: number;
  title: string;
  age_group: string | null;
  focus_area: string | null;
  difficulty: string | null;
  players: string | null;
  duration: number | null;
  equipment: string | null;
  explanation: string | null;
  coaching_points: string | null;
  organization: string | null;
  user_id: string | null;
  is_public: boolean | null;
};

type SessionOption = {
  id: number;
  title: string;
};

export default function ExerciseDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
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

      setCurrentUserId(user.id);

      const { data: exerciseData, error: exerciseError } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", Number(params.id))
        .single();

      if (exerciseError) {
        setErrorMessage("Fant ikke øvelsen.");
        setLoading(false);
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select("id, title")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (sessionError) {
        setErrorMessage(sessionError.message);
        setLoading(false);
        return;
      }

      setExercise(exerciseData);
      setSessions(sessionData || []);
      setLoading(false);
    }

    if (params?.id) {
      fetchData();
    }
  }, [params]);

  async function handleAddToSession() {
    setMessage("");
    setErrorMessage("");

    if (!selectedSessionId || !exercise) {
      setErrorMessage("Velg en økt først.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("Du må være logget inn.");
      return;
    }

    const { data: existingRows, error: countError } = await supabase
      .from("session_exercises")
      .select("id")
      .eq("session_id", Number(selectedSessionId))
      .eq("user_id", user.id);

    if (countError) {
      setErrorMessage(countError.message);
      return;
    }

    const sortOrder = existingRows ? existingRows.length + 1 : 1;

    const { error } = await supabase.from("session_exercises").insert({
      session_id: Number(selectedSessionId),
      exercise_id: exercise.id,
      user_id: user.id,
      sort_order: sortOrder,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Øvelsen ble lagt til i økten.");
    setSelectedSessionId("");
  }

  async function handleDeleteExercise() {
    if (!exercise) return;

    const confirmed = window.confirm(
      "Er du sikker på at du vil slette denne øvelsen?"
    );

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
      .from("exercises")
      .delete()
      .eq("id", exercise.id)
      .eq("user_id", user.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/dashboard/exercises");
  }

  const isOwnExercise =
    exercise?.is_public === false && exercise?.user_id === currentUserId;

  return (
    <section className="page-section">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            href="/dashboard/exercises"
            className="text-sm font-medium text-black/60 hover:text-black"
          >
            ← Tilbake til øvelsesbank
          </Link>
          {!loading && exercise && (
            <>
              <h1 className="page-title mt-4">{exercise.title}</h1>

              <div className="mt-4">
                {exercise.is_public ? (
                  <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-black/70">
                    Felles øvelse
                  </span>
                ) : (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                    Min øvelse
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {isOwnExercise && (
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/dashboard/exercises/${params.id}/edit`}
              className="primary-button"
            >
              Rediger øvelse
            </Link>

            <button onClick={handleDeleteExercise} className="danger-button">
              Slett øvelse
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="mt-8 text-black/70">Laster øvelse...</p>
      ) : errorMessage ? (
        <p className="error-message mt-8">{errorMessage}</p>
      ) : exercise ? (
        <div className="mt-8 space-y-6">
          {message && <p className="success-message">{message}</p>}

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.8fr]">
            <div className="card card-padding-lg">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="card-soft">
                  <h2 className="text-lg font-semibold">Alder</h2>
                  <p className="mt-2 text-black/70">
                    {exercise.age_group || "Ikke satt"}
                  </p>
                </div>

                <div className="card-soft">
                  <h2 className="text-lg font-semibold">Fokusområde</h2>
                  <p className="mt-2 text-black/70">
                    {exercise.focus_area || "Ikke satt"}
                  </p>
                </div>

                <div className="card-soft">
                  <h2 className="text-lg font-semibold">Nivå</h2>
                  <p className="mt-2 text-black/70">
                    {exercise.difficulty || "Ikke satt"}
                  </p>
                </div>

                <div className="card-soft">
                  <h2 className="text-lg font-semibold">Spillere</h2>
                  <p className="mt-2 text-black/70">
                    {exercise.players || "Ikke satt"}
                  </p>
                </div>

                <div className="card-soft">
                  <h2 className="text-lg font-semibold">Varighet</h2>
                  <p className="mt-2 text-black/70">
                    {exercise.duration ? `${exercise.duration} min` : "Ikke satt"}
                  </p>
                </div>

                <div className="card-soft">
                  <h2 className="text-lg font-semibold">Utstyr</h2>
                  <p className="mt-2 text-black/70">
                    {exercise.equipment || "Ikke satt"}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                <div className="card-soft">
                  <h2 className="text-lg font-semibold">Forklaring</h2>
                  <p className="mt-2 whitespace-pre-line text-black/70">
                    {exercise.explanation || "Ingen forklaring"}
                  </p>
                </div>

                <div className="card-soft">
                  <h2 className="text-lg font-semibold">Coachingpunkter</h2>
                  <p className="mt-2 whitespace-pre-line text-black/70">
                    {exercise.coaching_points || "Ingen coachingpunkter"}
                  </p>
                </div>

                <div className="card-soft">
                  <h2 className="text-lg font-semibold">Organisering</h2>
                  <p className="mt-2 whitespace-pre-line text-black/70">
                    {exercise.organization || "Ingen organisering"}
                  </p>
                </div>
              </div>
            </div>

            <div className="card card-padding">
              <h2 className="section-title">Legg til i økt</h2>

              <div className="mt-4 flex flex-col gap-3">
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="select-field"
                >
                  <option value="">Velg økt</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.title}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAddToSession}
                  className="primary-button"
                >
                  Legg til i økt
                </button>
              </div>

              {sessions.length === 0 && (
                <p className="mt-4 text-sm text-black/60">
                  Du må opprette en økt først.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}