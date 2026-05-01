"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditExercisePage() {
  const params = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [players, setPlayers] = useState("");
  const [duration, setDuration] = useState("");
  const [equipment, setEquipment] = useState("");
  const [explanation, setExplanation] = useState("");
  const [coachingPoints, setCoachingPoints] = useState("");
  const [organization, setOrganization] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchExercise() {
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
        .from("exercises")
        .select("*")
        .eq("id", Number(params.id))
        .eq("user_id", user.id)
        .single();

      if (error) {
        setErrorMessage("Fant ikke din øvelse.");
        setLoading(false);
        return;
      }

      setTitle(data.title || "");
      setAgeGroup(data.age_group || "");
      setFocusArea(data.focus_area || "");
      setDifficulty(data.difficulty || "");
      setPlayers(data.players || "");
      setDuration(data.duration ? String(data.duration) : "");
      setEquipment(data.equipment || "");
      setExplanation(data.explanation || "");
      setCoachingPoints(data.coaching_points || "");
      setOrganization(data.organization || "");

      setLoading(false);
    }

    if (params?.id) {
      fetchExercise();
    }
  }, [params]);

  async function handleUpdateExercise(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("Du må være logget inn.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("exercises")
      .update({
        title,
        age_group: ageGroup || null,
        focus_area: focusArea || null,
        difficulty: difficulty || null,
        players: players || null,
        duration: duration ? Number(duration) : null,
        equipment: equipment || null,
        explanation: explanation || null,
        coaching_points: coachingPoints || null,
        organization: organization || null,
      })
      .eq("id", Number(params.id))
      .eq("user_id", user.id);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage("Øvelsen ble oppdatert.");
    setSaving(false);

    setTimeout(() => {
      router.push(`/dashboard/exercises/${params.id}`);
    }, 800);
  }

  return (
    <section className="page-section-narrow">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="page-title">Rediger øvelse</h1>
          <p className="page-subtitle">Oppdater din egen øvelse.</p>
        </div>

        <Link
          href={`/dashboard/exercises/${params.id}`}
          className="secondary-button"
        >
          Tilbake
        </Link>
      </div>

      {loading ? (
        <p className="mt-8 text-black/70">Laster øvelse...</p>
      ) : errorMessage ? (
        <p className="error-message mt-8">{errorMessage}</p>
      ) : (
        <div className="card card-padding-lg mt-10">
          <form onSubmit={handleUpdateExercise} className="grid gap-4">
            <div>
              <label htmlFor="title" className="field-label">
                Tittel
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

            <div className="grid gap-4 md:grid-cols-2">
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
                <label htmlFor="focusArea" className="field-label">
                  Fokusområde
                </label>
                <input
                  id="focusArea"
                  type="text"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="difficulty" className="field-label">
                  Nivå
                </label>
                <input
                  id="difficulty"
                  type="text"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="players" className="field-label">
                  Spillere
                </label>
                <input
                  id="players"
                  type="text"
                  value={players}
                  onChange={(e) => setPlayers(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="duration" className="field-label">
                  Varighet
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
              <label htmlFor="equipment" className="field-label">
                Utstyr
              </label>
              <input
                id="equipment"
                type="text"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="explanation" className="field-label">
                Forklaring
              </label>
              <textarea
                id="explanation"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="textarea-field"
              />
            </div>

            <div>
              <label htmlFor="coachingPoints" className="field-label">
                Coachingpunkter
              </label>
              <textarea
                id="coachingPoints"
                value={coachingPoints}
                onChange={(e) => setCoachingPoints(e.target.value)}
                className="textarea-field"
              />
            </div>

            <div>
              <label htmlFor="organization" className="field-label">
                Organisering
              </label>
              <textarea
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="textarea-field"
              />
            </div>

            <button type="submit" disabled={saving} className="primary-button">
              {saving ? "Lagrer..." : "Lagre endringer"}
            </button>
          </form>

          {message && <p className="success-message mt-4">{message}</p>}
        </div>
      )}
    </section>
  );
}