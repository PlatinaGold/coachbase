"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type UserInfo = {
  email: string;
  fullName: string;
};

type Session = {
  id: number;
  title: string;
  age_group: string | null;
  theme: string | null;
  duration: number | null;
  created_at: string;
};

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [ownExerciseCount, setOwnExerciseCount] = useState(0);
  const [latestSessions, setLatestSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserInfo({
        email: user.email ?? "",
        fullName: (user.user_metadata?.full_name as string) ?? "",
      });

      const { count: sessionsTotal } = await supabase
        .from("sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { count: ownExercisesTotal } = await supabase
        .from("exercises")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_public", false);

      const { data: latestSessionsData } = await supabase
        .from("sessions")
        .select("id, title, age_group, theme, duration, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      setSessionCount(sessionsTotal || 0);
      setOwnExerciseCount(ownExercisesTotal || 0);
      setLatestSessions(latestSessionsData || []);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  return (
    <section className="page-section">
      <div className="max-w-3xl">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Her får du oversikt over arbeidet ditt i CoachBase og raske veier videre.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="card card-padding">
          <p className="meta-label">Bruker</p>
          <h2 className="mt-2 text-xl font-semibold">
            {userInfo?.fullName || "Ingen navn registrert"}
          </h2>
          <p className="mt-3 break-words text-sm text-black/60">
            {userInfo?.email}
          </p>
        </div>

        <div className="card card-padding">
          <p className="meta-label">Mine økter</p>
          <p className="mt-2 text-4xl font-bold">
            {loading ? "..." : sessionCount}
          </p>
          <p className="mt-3 text-black/70">
            Lagrede økter du kan bygge videre på.
          </p>
        </div>

        <div className="card card-padding">
          <p className="meta-label">Egne øvelser</p>
          <p className="mt-2 text-4xl font-bold">
            {loading ? "..." : ownExerciseCount}
          </p>
          <p className="mt-3 text-black/70">
            Private øvelser du har laget selv.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card card-padding-lg">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Siste økter</h2>
            <Link href="/dashboard/sessions" className="secondary-button">
              Se alle
            </Link>
          </div>

          {loading ? (
            <p className="mt-6 text-black/70">Laster økter...</p>
          ) : latestSessions.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-black/15 bg-[#fafafa] p-6">
              <h3 className="text-lg font-semibold">Ingen økter ennå</h3>
              <p className="mt-2 text-black/70">
                Start med å opprette din første økt, og bygg den opp med øvelser fra banken.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/dashboard/sessions" className="primary-button">
                  Opprett første økt
                </Link>
                <Link href="/dashboard/exercises" className="secondary-button">
                  Se øvelsesbank
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              {latestSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/dashboard/sessions/${session.id}`}
                  className="card-soft block transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{session.title}</h3>
                      <p className="mt-2 text-sm text-black/70">
                        Alder: {session.age_group || "Ikke satt"}
                      </p>
                      <p className="mt-1 text-sm text-black/70">
                        Tema: {session.theme || "Ikke satt"}
                      </p>
                    </div>

                    <div className="text-sm text-black/60">
                      {session.duration ? `${session.duration} min` : "Uten tid"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card card-padding-lg">
          <p className="meta-label">Raske handlinger</p>
          <h2 className="mt-2 text-2xl font-semibold">Kom raskt videre</h2>
          <p className="mt-3 text-black/70">
            Gå direkte til det du mest sannsynlig skal gjøre videre.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link href="/dashboard/sessions" className="primary-button text-center">
              Opprett eller åpne økt
            </Link>

            <Link
              href="/dashboard/exercises/new"
              className="secondary-button text-center"
            >
              Lag ny øvelse
            </Link>

            <Link
              href="/dashboard/exercises"
              className="secondary-button text-center"
            >
              Gå til øvelsesbank
            </Link>
          </div>

          <div className="mt-8 card-soft">
            <p className="meta-label">Tips</p>
            <p className="mt-2 text-black/70">
              Den enkleste flyten er ofte:
              finn øvelser → bygg økt → åpne trener-visning → skriv ut.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}