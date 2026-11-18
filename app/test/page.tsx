"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestPage() {
  const [message, setMessage] = useState("Connexion en cours...");

  useEffect(() => {
    async function tester() {
      const { data, error } = await supabase.from("boutiques").select("*");

      if (error) {
        setMessage("❌ Erreur : " + error.message);
      } else {
        setMessage("✅ Connexion réussie ! Nombre de boutiques : " + data.length);
      }
    }
    tester();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <p className="text-2xl font-semibold">{message}</p>
    </main>
  );
}