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

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  const [selectedAge, setSelectedAge] = useState("Alle");
  const [selectedFocus, setSelectedFocus] = useState("Alle");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Alle");
  const [selectedOwnership, setSelectedOwnership] = useState("Alle");
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

  const ageOptions = useMemo(() => {
    const values = exercises
      .map((exercise) => exercise.age_group)
      .filter((value): value is string => Boolean(value));

    return ["Alle", ...Array.from(new Set(values))];
  }, [exercises]);

  const focusOptions = useMemo(() => {
    const values = exercises
      .map((exercise) => exercise.focus_area)
      .filter((value): value is string => Boolean(value));

    return ["Alle", ...Array.from(new Set(values))];
  }, [exercises]);

  const difficultyOptions = useMemo(() => {
    const values = exercises
      .map((exercise) => exercise.difficulty)
      .filter((value): value is string => Boolean(value));

    return ["Alle", ...Array.from(new Set(values))];
  }, [exercises]);

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

      return (
        matchesAge &&
        matchesFocus &&
        matchesDifficulty &&
        matchesSearch &&
        matchesOwnership
      );
    });
  }, [
    exercises,
    selectedAge,
    selectedFocus,
    selectedDifficulty,
    selectedOwnership,
    searchTerm,
    currentUserId,
  ]);

  return (
    <section className="page-section">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <h1 className="page-title">Øvelsesbank</h1>
          <p className="page-subtitle">
            Ferdige og egne øvelser for barnefotball.
          </p>
        </div>

        <Link href="/dashboard/exercises/new" className="primary-button">
          Ny øvelse
        </Link>
      </div>

      <div className="card card-padding mt-8">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Filtrer øvelser</h2>
          <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-black/70">
            {filteredExercises.length} treff
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
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
              {ageOptions.map((option) => (
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
              {focusOptions.map((option) => (
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
              {difficultyOptions.map((option) => (
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
              <option value="Alle">Alle</option>
              <option value="Felles øvelse">Felles øvelse</option>
              <option value="Min øvelse">Min øvelse</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedAge("Alle");
            setSelectedFocus("Alle");
            setSelectedDifficulty("Alle");
            setSelectedOwnership("Alle");
            setSearchTerm("");
          }}
          className="secondary-button mt-5"
        >
          Nullstill filter
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-black/70">Laster øvelser...</p>
      ) : errorMessage ? (
        <p className="error-message mt-8">{errorMessage}</p>
      ) : filteredExercises.length === 0 ? (
        <p className="mt-8 text-black/70">Ingen øvelser matcher filtrene.</p>
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