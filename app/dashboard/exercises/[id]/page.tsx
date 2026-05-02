"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import ExerciseCanvas from "@/components/ExerciseCanvas";

type CanvasItem = {
  id: number;
  type: "player" | "cone" | "ball";
  x: number;
  y: number;
  label?: string;
};

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
  canvas_data: CanvasItem[] | null;
};

export default function ExerciseDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadExercise() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUserId(user?.id || "");

    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("id", Number(params.id))
      .single();

    if (error || !data) {
      setErrorMessage("Fant ikke øvelsen.");
      setLoading(false);
      return;
    }

    setExercise(data as Exercise);
    setLoading(false);
  }

  useEffect(() => {
    if (params?.id) {
      loadExercise();
    }
  }, [params]);

  async function handleDeleteExercise() {
    if (!exercise) return;

    const confirmed = window.confirm(
      "Er du sikker på at du vil slette denne øvelsen?"
    );

    if (!confirmed) return;

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

  async function handleDuplicateExercise() {
    if (!exercise) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("Du må være logget inn.");
      return;
    }

    const { data: newExercise, error } = await supabase
      .from("exercises")
      .insert({
        user_id: user.id,
        is_public: false,
        title: `${exercise.title} (kopi)`,
        age_group: exercise.age_group,
        focus_area: exercise.focus_area,
        difficulty: exercise.difficulty,
        players: exercise.players,
        duration: exercise.duration,
        equipment: exercise.equipment,
        explanation: exercise.explanation,
        coaching_points: exercise.coaching_points,
        organization: exercise.organization,
        canvas_data: exercise.canvas_data,
      })
      .select()
      .single();

    if (error || !newExercise) {
      setErrorMessage(error?.message || "Kunne ikke duplisere øvelsen.");
      return;
    }

    router.push(`/dashboard/exercises/${newExercise.id}`);
  }

  const isOwnExercise =
    exercise?.is_public === false && exercise?.user_id === currentUserId;

  const canvasItems =
    Array.isArray(exercise?.canvas_data) && exercise.canvas_data.length > 0
      ? exercise.canvas_data
      : [];

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
              <p className="page-subtitle">
                {exercise.is_public ? "Felles øvelse" : "Egen øvelse"}
              </p>
            </>
          )}
        </div>

        {!loading && exercise && isOwnExercise && (
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/dashboard/exercises/${params.id}/edit`}
              className="primary-button"
            >
              Rediger øvelse
            </Link>

            <button
              onClick={handleDuplicateExercise}
              className="secondary-button"
            >
              Dupliser øvelse
            </button>

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
        <div className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
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

          <div className="space-y-4">
            {canvasItems.length > 0 ? (
              <ExerciseCanvas
                items={canvasItems}
                title="Visuell skisse"
                interactive={false}
              />
            ) : (
              <div className="card card-padding">
                <h2 className="section-title">Ingen skisse lagt til</h2>
                <p className="mt-3 text-black/70">
                  Denne øvelsen har foreløpig ingen visuell skisse.
                </p>

                {isOwnExercise && (
                  <div className="mt-4">
                    <Link
                      href={`/dashboard/exercises/${params.id}/edit`}
                      className="primary-button"
                    >
                      Legg til skisse
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="card card-padding">
              <h3 className="text-lg font-semibold">Skisseinfo</h3>
              <p className="mt-3 text-black/70">
                Skissen viser en enkel oppstilling av spillere, kjegler og ball
                for denne øvelsen.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}