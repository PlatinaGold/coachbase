"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ExerciseCanvas from "@/components/ExerciseCanvas";

const AGE_OPTIONS = [
  "5–6 år",
  "6–7 år",
  "7–8 år",
  "8–9 år",
  "9–10 år",
  "10–12 år",
  "12+ år",
];

const FOCUS_AREA_OPTIONS = [
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

const DIFFICULTY_OPTIONS = ["Enkel", "Middels", "Avansert"];

type CanvasItem = {
  id: number;
  type: "player" | "cone" | "ball";
  x: number;
  y: number;
  label?: string;
};

const DEFAULT_CANVAS_ITEMS: CanvasItem[] = [
  { id: 1, type: "player", x: 22, y: 35, label: "A" },
  { id: 2, type: "player", x: 38, y: 55, label: "B" },
  { id: 3, type: "player", x: 68, y: 42, label: "C" },
  { id: 4, type: "cone", x: 30, y: 28 },
  { id: 5, type: "cone", x: 48, y: 42 },
  { id: 6, type: "cone", x: 62, y: 60 },
  { id: 7, type: "ball", x: 22, y: 44 },
];

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

  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>(DEFAULT_CANVAS_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

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

      if (error || !data) {
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

      if (Array.isArray(data.canvas_data) && data.canvas_data.length > 0) {
        setCanvasItems(data.canvas_data as CanvasItem[]);
      } else {
        setCanvasItems(DEFAULT_CANVAS_ITEMS);
      }

      setLoading(false);
    }

    if (params?.id) {
      fetchExercise();
    }
  }, [params]);

  function getNextPlayerLabel(items: CanvasItem[]) {
    const playerCount = items.filter((item) => item.type === "player").length;
    return String.fromCharCode(65 + playerCount);
  }

  function addPlayer() {
    setCanvasItems((prev) => {
      const nextItem = {
        id: prev.length ? Math.max(...prev.map((item) => item.id)) + 1 : 1,
        type: "player" as const,
        x: 50,
        y: 50,
        label: getNextPlayerLabel(prev),
      };
      setSelectedItemId(nextItem.id);
      return [...prev, nextItem];
    });
  }

  function addCone() {
    setCanvasItems((prev) => {
      const nextItem = {
        id: prev.length ? Math.max(...prev.map((item) => item.id)) + 1 : 1,
        type: "cone" as const,
        x: 50,
        y: 50,
      };
      setSelectedItemId(nextItem.id);
      return [...prev, nextItem];
    });
  }

  function addBall() {
    setCanvasItems((prev) => {
      const nextItem = {
        id: prev.length ? Math.max(...prev.map((item) => item.id)) + 1 : 1,
        type: "ball" as const,
        x: 50,
        y: 50,
      };
      setSelectedItemId(nextItem.id);
      return [...prev, nextItem];
    });
  }

  function moveSelectedItem(direction: "up" | "down" | "left" | "right") {
    if (selectedItemId === null) return;

    const step = 4;

    setCanvasItems((prev) =>
      prev.map((item) => {
        if (item.id !== selectedItemId) return item;

        let nextX = item.x;
        let nextY = item.y;

        if (direction === "up") nextY -= step;
        if (direction === "down") nextY += step;
        if (direction === "left") nextX -= step;
        if (direction === "right") nextX += step;

        nextX = Math.max(8, Math.min(92, nextX));
        nextY = Math.max(10, Math.min(90, nextY));

        return {
          ...item,
          x: nextX,
          y: nextY,
        };
      })
    );
  }

  function deleteSelectedItem() {
    if (selectedItemId === null) return;
    setCanvasItems((prev) => prev.filter((item) => item.id !== selectedItemId));
    setSelectedItemId(null);
  }

  function clearCanvas() {
    setCanvasItems([]);
    setSelectedItemId(null);
  }

  function resetCanvasExample() {
    setCanvasItems(DEFAULT_CANVAS_ITEMS);
    setSelectedItemId(null);
  }

  const selectedItem = canvasItems.find((item) => item.id === selectedItemId) || null;

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
        canvas_data: canvasItems,
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
        <div className="mt-10 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="card card-padding-lg">
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
                  <select
                    id="ageGroup"
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="select-field"
                  >
                    <option value="">Velg alder</option>
                    {AGE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="focusArea" className="field-label">
                    Fokusområde
                  </label>
                  <select
                    id="focusArea"
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    className="select-field"
                  >
                    <option value="">Velg fokusområde</option>
                    {FOCUS_AREA_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label htmlFor="difficulty" className="field-label">
                    Nivå
                  </label>
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="select-field"
                  >
                    <option value="">Velg nivå</option>
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
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
            {errorMessage && <p className="error-message mt-4">{errorMessage}</p>}
          </div>

          <div className="space-y-4">
          <ExerciseCanvas
  items={canvasItems}
  title="Visuell skisse"
  selectedItemId={selectedItemId}
  onSelectItem={setSelectedItemId}
  interactive={true}
/>

            <div className="card card-padding">
              <h3 className="text-lg font-semibold">Legg til elementer</h3>
              <p className="mt-2 text-black/70">
                Klikk på et element på banen for å velge det.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={addPlayer} className="secondary-button">
                  Legg til spiller
                </button>

                <button type="button" onClick={addCone} className="secondary-button">
                  Legg til kjegle
                </button>

                <button type="button" onClick={addBall} className="secondary-button">
                  Legg til ball
                </button>
              </div>
            </div>

            <div className="card card-padding">
              <h3 className="text-lg font-semibold">Valgt element</h3>

              {selectedItem ? (
                <>
                  <p className="mt-2 text-black/70">
                    Type:{" "}
                    <span className="font-medium text-black">
                      {selectedItem.type === "player"
                        ? "Spiller"
                        : selectedItem.type === "cone"
                        ? "Kjegle"
                        : "Ball"}
                    </span>
                  </p>

                  <p className="mt-1 text-black/70">
                    Posisjon: {selectedItem.x}% / {selectedItem.y}%
                  </p>

                  <div className="mt-4 grid max-w-[220px] grid-cols-3 gap-2">
                    <div />
                    <button
                      type="button"
                      onClick={() => moveSelectedItem("up")}
                      className="secondary-button"
                    >
                      ↑
                    </button>
                    <div />

                    <button
                      type="button"
                      onClick={() => moveSelectedItem("left")}
                      className="secondary-button"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSelectedItem("down")}
                      className="secondary-button"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSelectedItem("right")}
                      className="secondary-button"
                    >
                      →
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={deleteSelectedItem}
                      className="danger-button"
                    >
                      Slett valgt element
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-black/70">
                  Ingen element valgt ennå. Klikk på et element på banen.
                </p>
              )}
            </div>

            <div className="card card-padding">
              <h3 className="text-lg font-semibold">Skissekontroll</h3>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={resetCanvasExample}
                  className="secondary-button"
                >
                  Tilbakestill eksempel
                </button>

                <button
                  type="button"
                  onClick={clearCanvas}
                  className="danger-button"
                >
                  Tøm skisse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}