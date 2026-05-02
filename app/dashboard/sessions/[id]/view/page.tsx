"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

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

type SessionExercise = {
  id: number;
  sort_order: number | null;
  exercise:
    | {
        id: number;
        title: string;
        focus_area: string | null;
        duration: number | null;
        explanation: string | null;
        coaching_points: string | null;
        organization: string | null;
      }
    | null;
};

export default function SessionTrainerViewPage() {
  const params = useParams();

  const [session, setSession] = useState<Session | null>(null);
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadTrainerView() {
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

    if (error || !data) {
      setErrorMessage("Fant ikke økten.");
      setLoading(false);
      return;
    }

    setSession(data);

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
          duration,
          explanation,
          coaching_points,
          organization
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
      loadTrainerView();
    }
  }, [params]);

  const exerciseCount = sessionExercises.length;

  const totalExerciseDuration = sessionExercises.reduce((sum, item) => {
    return sum + (item.exercise?.duration || 0);
  }, 0);

  return (
    <section className="page-section-narrow print-page">
      <div className="print-hide flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            href={`/dashboard/sessions/${params.id}`}
            className="text-sm font-medium text-black/60 hover:text-black"
          >
            ← Tilbake til økt
          </Link>

          {!loading && session && (
            <>
              <h1 className="page-title mt-4">{session.title}</h1>
              <p className="page-subtitle">Enklere trener-visning av økten.</p>
            </>
          )}
        </div>

        {!loading && session && (
          <div className="flex flex-wrap gap-3">
            <button onClick={() => window.print()} className="secondary-button">
              Skriv ut
            </button>
          </div>
        )}
      </div>

      {!loading && session && (
        <div className="print-show hidden">
          <h1 className="print-title">{session.title}</h1>

          <p className="print-subtitle">
            Dato: {session.session_date || "Ikke satt"} · Sted:{" "}
            {session.location || "Ikke satt"} · Trenernavn:{" "}
            {session.coach_name || "Ikke satt"} · Lag:{" "}
            {session.team_name || "Ikke satt"}
          </p>

          <p className="print-subtitle">
            Alder: {session.age_group || "Ikke satt"} · Tema:{" "}
            {session.theme || "Ikke satt"} · Antall øvelser: {exerciseCount} ·
            Total øvelsestid: {totalExerciseDuration} min
          </p>

          <p className="print-subtitle">
            Øktmål: {session.session_goal || "Ikke satt"}
          </p>
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-black/70">Laster øktvisning...</p>
      ) : errorMessage ? (
        <p className="error-message mt-8">{errorMessage}</p>
      ) : session ? (
        <div className="mt-8 space-y-6">
          <div className="print-section-gap grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card-soft">
              <p className="meta-label">Dato</p>
              <p className="mt-2 text-lg font-semibold">
                {session.session_date || "Ikke satt"}
              </p>
            </div>

            <div className="card-soft">
              <p className="meta-label">Sted</p>
              <p className="mt-2 text-lg font-semibold">
                {session.location || "Ikke satt"}
              </p>
            </div>

            <div className="card-soft">
              <p className="meta-label">Trenernavn</p>
              <p className="mt-2 text-lg font-semibold">
                {session.coach_name || "Ikke satt"}
              </p>
            </div>

            <div className="card-soft">
              <p className="meta-label">Lag / årskull</p>
              <p className="mt-2 text-lg font-semibold">
                {session.team_name || "Ikke satt"}
              </p>
            </div>

            <div className="card-soft">
              <p className="meta-label">Alder</p>
              <p className="mt-2 text-lg font-semibold">
                {session.age_group || "Ikke satt"}
              </p>
            </div>

            <div className="card-soft">
              <p className="meta-label">Tema</p>
              <p className="mt-2 text-lg font-semibold">
                {session.theme || "Ikke satt"}
              </p>
            </div>

            <div className="card-soft">
              <p className="meta-label">Antall øvelser</p>
              <p className="mt-2 text-lg font-semibold">{exerciseCount}</p>
            </div>

            <div className="card-soft">
              <p className="meta-label">Total øvelsestid</p>
              <p className="mt-2 text-lg font-semibold">
                {totalExerciseDuration} min
              </p>
            </div>

            <div className="card-soft">
              <p className="meta-label">Øktmål</p>
              <p className="mt-2 whitespace-pre-line text-sm text-black/70">
                {session.session_goal || "Ikke satt"}
              </p>
            </div>
          </div>

          {session.notes && (
            <div className="card card-padding">
              <h2 className="section-title">Notater</h2>
              <p className="mt-3 whitespace-pre-line text-black/70">
                {session.notes}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {sessionExercises.length === 0 ? (
              <div className="card card-padding">
                <h2 className="section-title">Ingen øvelser i økten ennå</h2>
                <p className="mt-3 text-black/70">
                  Gå tilbake til økten og legg til noen øvelser før du bruker
                  trener-visningen.
                </p>

                <div className="mt-4 print-hide">
                  <Link
                    href={`/dashboard/sessions/${params.id}`}
                    className="primary-button"
                  >
                    Tilbake til økten
                  </Link>
                </div>
              </div>
            ) : (
              sessionExercises.map((item) => (
                <div key={item.id} className="card print-card card-padding">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 h-6 w-6 shrink-0 rounded border-2 border-black/30 bg-white" />

                      <div>
                        <p className="meta-label">
                          Øvelse {item.sort_order || "-"}
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold">
                          {item.exercise?.title || "Ukjent øvelse"}
                        </h2>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-black/70">
                        {item.exercise?.focus_area || "Ikke satt"}
                      </span>
                      <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-black/70">
                        {item.exercise?.duration
                          ? `${item.exercise.duration} min`
                          : "Ikke satt"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="card-soft">
                      <h3 className="text-base font-semibold">Forklaring</h3>
                      <p className="mt-2 whitespace-pre-line text-sm text-black/70">
                        {item.exercise?.explanation || "Ingen forklaring"}
                      </p>
                    </div>

                    <div className="card-soft">
                      <h3 className="text-base font-semibold">
                        Coachingpunkter
                      </h3>
                      <p className="mt-2 whitespace-pre-line text-sm text-black/70">
                        {item.exercise?.coaching_points ||
                          "Ingen coachingpunkter"}
                      </p>
                    </div>

                    <div className="card-soft">
                      <h3 className="text-base font-semibold">Organisering</h3>
                      <p className="mt-2 whitespace-pre-line text-sm text-black/70">
                        {item.exercise?.organization || "Ingen organisering"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-black/10 bg-white px-4 py-4">
                    <p className="text-sm font-semibold text-black/70">
                      Egne notater
                    </p>

                    <div className="mt-3 space-y-3">
                      <div className="h-4 border-b border-dashed border-black/20" />
                      <div className="h-4 border-b border-dashed border-black/20" />
                      <div className="h-4 border-b border-dashed border-black/20" />
                      <div className="h-4 border-b border-dashed border-black/20" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}