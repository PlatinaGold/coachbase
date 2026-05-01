"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type UserInfo = {
  email: string;
  fullName: string;
};

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserInfo({
        email: user.email ?? "",
        fullName: (user.user_metadata?.full_name as string) ?? "",
      });
    }

    getUser();
  }, []);

  return (
    <section className="page-section">
      <div className="max-w-3xl">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Her får du oversikt over økter, øvelser og brukeren din i CoachBase.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="card card-padding">
          <h2 className="text-xl font-semibold">Bruker</h2>
          <p className="mt-4 text-black/70">
            {userInfo?.fullName || "Ingen navn registrert"}
          </p>
          <p className="mt-2 text-sm text-black/50">{userInfo?.email}</p>
        </div>

        <Link
          href="/dashboard/sessions"
          className="card card-padding block transition hover:shadow-md"
        >
          <h2 className="text-xl font-semibold">Mine økter</h2>
          <p className="mt-4 text-black/70">
            Opprett, planlegg og lagre treningsøkter.
          </p>
        </Link>

        <Link
          href="/dashboard/exercises"
          className="card card-padding block transition hover:shadow-md"
        >
          <h2 className="text-xl font-semibold">Øvelsesbank</h2>
          <p className="mt-4 text-black/70">
            Finn felles øvelser eller lag dine egne.
          </p>
        </Link>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="card card-padding-lg">
          <p className="meta-label">Kom i gang</p>
          <h2 className="mt-2 text-2xl font-semibold">
            Start med en enkel økt
          </h2>
          <p className="mt-3 text-black/70">
            Opprett en økt, finn noen passende øvelser og legg dem inn i riktig
            rekkefølge.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard/sessions" className="primary-button">
              Gå til mine økter
            </Link>
            <Link href="/dashboard/exercises" className="secondary-button">
              Se øvelsesbank
            </Link>
          </div>
        </div>

        <div className="card card-padding-lg">
          <p className="meta-label">CoachBase v1</p>
          <h2 className="mt-2 text-2xl font-semibold">Dette har du på plass</h2>
          <ul className="mt-4 space-y-2 text-black/70">
            <li>• Beskyttet innlogging</li>
            <li>• Mine økter med lagring</li>
            <li>• Øvelsesbank med søk og filter</li>
            <li>• Egne øvelser med redigering</li>
            <li>• Legg øvelser til økt og sorter dem</li>
          </ul>
        </div>
      </div>
    </section>
  );
}