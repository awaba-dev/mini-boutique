"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [message, setMessage] = useState("");
  const [chargement, setChargement] = useState(false);

  async function seConnecter(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: motDePasse,
    });

    if (error) {
      setMessage("❌ E-mail ou mot de passe incorrect");
      setChargement(false);
    } else {
      router.push("/tableau-de-bord");
    }
  }

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <form
        onSubmit={seConnecter}
        className="bg-white w-full max-w-md p-8 rounded-2xl shadow-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-green-700 text-center">
          Se connecter
        </h1>

        <label className="flex flex-col gap-1 text-gray-700">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-lg p-3 text-gray-900"
            placeholder="fatou@exemple.com"
          />
        </label>

        <label className="flex flex-col gap-1 text-gray-700">
          Mot de passe
          <input
            type="password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="border rounded-lg p-3 text-gray-900"
          />
        </label>

        <button
          type="submit"
          disabled={chargement}
          className="bg-green-600 text-white py-3 rounded-full font-semibold disabled:opacity-50"
        >
          {chargement ? "Connexion..." : "Se connecter"}
        </button>

        {message && <p className="text-center text-gray-800">{message}</p>}

        <p className="text-center text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <a href="/inscription" className="text-green-700 font-semibold underline">
            Créer un compte
          </a>
        </p>
      </form>
    </main>
  );
}