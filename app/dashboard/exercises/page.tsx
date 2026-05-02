"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Exercise = {
  id: number;
  title: string;
  age_group: string | null;
  focus_area: string | null;
  difficulty: string | null;
  players: string | null;
  duration: number | null;
  user_id: string | null;
  is_public: boolean | null;
};

const AGE_OPTIONS = [
  "Alle",
  "5–6 år",
  "6–7 år",
  "7–8 år",
  "8–9 år",
  "9–10 år",
  "10–12 år",
  "12+ år",
];

const FOCUS_AREA_OPTIONS = [
  "Alle",
  "Føring",
  "Pasning",
  "Mottak",
  "Avslutning",
  "Småspill",
  "1 mot 1",
  "2 mot 1",
  "Bevegelse",
  "Koordinasjon",
  "Lek",
  "Oppvarming",
  "Forsvar",
  "Angrep",
];

const DIFFICULTY_OPTIONS = ["Alle", "Enkel", "Middels", "Avansert"];

const DURATION_OPTIONS = [
  "Alle",
  "Under 10 min",
  "10–15 min",
  "15–20 min",
  "20+ min",
];

const OWNERSHIP_OPTIONS = ["Alle", "Felles øvelse", "Min øvelse"];

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  const [selectedAge, setSelectedAge] = useState("Alle");
  const [selectedFocus, setSelectedFocus] = useState("Alle");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Alle");
  const [selectedOwnership, setSelectedOwnership] = useState("Alle");
  const [selectedDuration, setSelectedDuration] = useState("Alle");
  const [searchTerm, setSearchTerm] = useState("");

  async function fetchExercises() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUserId(user?.id || "");

    const { data, error } = await supabase
      .from("exercises")
      .select(
        "id, title, age_group, focus_area, difficulty, players, duration, user_id, is_public"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setExercises((data ?? []) as Exercise[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchExercises();
  }, []);

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesAge =
        selectedAge === "Alle" || exercise.age_group === selectedAge;

      const matchesFocus =
        selectedFocus === "Alle" || exercise.focus_area === selectedFocus;

      const matchesDifficulty =
        selectedDifficulty === "Alle" ||
        exercise.difficulty === selectedDifficulty;

      const normalizedSearch = searchTerm.trim().toLowerCase();

      const matchesSearch =
        normalizedSearch === "" ||
        exercise.title.toLowerCase().includes(normalizedSearch) ||
        (exercise.focus_area || "").toLowerCase().includes(normalizedSearch);

      const matchesOwnership =
        selectedOwnership === "Alle" ||
        (selectedOwnership === "Felles øvelse" && exercise.is_public === true) ||
        (selectedOwnership === "Min øvelse" &&
          exercise.is_public === false &&
          exercise.user_id === currentUserId);

      const matchesDuration =
        selectedDuration === "Alle" ||
        (selectedDuration === "Under 10 min" &&
          (exercise.duration ?? 0) < 10) ||
        (selectedDuration === "10–15 min" &&
          (exercise.duration ?? 0) >= 10 &&
          (exercise.duration ?? 0) <= 15) ||
        (selectedDuration === "15–20 min" &&
          (exercise.duration ?? 0) > 15 &&
          (exercise.duration ?? 0) <= 20) ||
        (selectedDuration === "20+ min" && (exercise.duration ?? 0) > 20);

      return (
        matchesAge &&
        matchesFocus &&
        matchesDifficulty &&
        matchesSearch &&
        matchesOwnership &&
        matchesDuration
      );
    });
  }, [
    exercises,
    selectedAge,
    selectedFocus,
    selectedDifficulty,
    selectedOwnership,
    selectedDuration,
    searchTerm,
    currentUserId,
  ]);

  function resetFilters() {
    setSelectedAge("Alle");
    setSelectedFocus("Alle");
    setSelectedDifficulty("Alle");
    setSelectedOwnership("Alle");
    setSelectedDuration("Alle");
    setSearchTerm("");
  }

  return (
    <section className="page-section">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <h1 className="page-title">Øvelsesbank</h1>
          <p className="page-subtitle">
            Ferdige og egne øvelser for barnefotball.
          </p>
        </div>

        <Link
          href="/dashboard/exercises/new"
          className="primary-button text-center"
        >
          Ny øvelse
        </Link>
      </div>

      <div className="card card-padding mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="section-title">Filtrer øvelser</h2>
          <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-black/70">
            {filteredExercises.length} treff
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <div>
            <label htmlFor="searchFilter" className="field-label">
              Søk
            </label>
            <input
              id="searchFilter"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Søk etter øvelse eller fokusområde"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="ageFilter" className="field-label">
              Alder
            </label>
            <select
              id="ageFilter"
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              className="select-field"
            >
              {AGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="focusFilter" className="field-label">
              Fokusområde
            </label>
            <select
              id="focusFilter"
              value={selectedFocus}
              onChange={(e) => setSelectedFocus(e.target.value)}
              className="select-field"
            >
              {FOCUS_AREA_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="difficultyFilter" className="field-label">
              Nivå
            </label>
            <select
              id="difficultyFilter"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="select-field"
            >
              {DIFFICULTY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="durationFilter" className="field-label">
              Varighet
            </label>
            <select
              id="durationFilter"
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="select-field"
            >
              {DURATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ownershipFilter" className="field-label">
              Type øvelse
            </label>
            <select
              id="ownershipFilter"
              value={selectedOwnership}
              onChange={(e) => setSelectedOwnership(e.target.value)}
              className="select-field"
            >
              {OWNERSHIP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={resetFilters} className="secondary-button mt-5">
          Nullstill filter
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-black/70">Laster øvelser...</p>
      ) : errorMessage ? (
        <p className="error-message mt-8">{errorMessage}</p>
      ) : filteredExercises.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-black/15 bg-white p-6">
          <h3 className="text-lg font-semibold">Ingen øvelser matcher filtrene</h3>
          <p className="mt-2 text-black/70">
            Prøv å justere søket eller nullstille ett eller flere filtre.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={resetFilters} className="secondary-button">
              Nullstill filtre
            </button>

            <Link href="/dashboard/exercises/new" className="primary-button">
              Lag ny øvelse
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredExercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/dashboard/exercises/${exercise.id}`}
              className="card card-padding block transition hover:shadow-md"
            >
              <h2 className="text-xl font-semibold">{exercise.title}</h2>

              <div className="mt-3">
                {exercise.is_public ? (
                  <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-black/70">
                    Felles øvelse
                  </span>
                ) : exercise.user_id === currentUserId ? (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                    Min øvelse
                  </span>
                ) : null}
              </div>

              <div className="mt-4 space-y-2 text-sm text-black/70">
                <p>Alder: {exercise.age_group || "Ikke satt"}</p>
                <p>Fokusområde: {exercise.focus_area || "Ikke satt"}</p>
                <p>Nivå: {exercise.difficulty || "Ikke satt"}</p>
                <p>Spillere: {exercise.players || "Ikke satt"}</p>
                <p>
                  Varighet:{" "}
                  {exercise.duration ? `${exercise.duration} min` : "Ikke satt"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}