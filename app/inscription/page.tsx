"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function InscriptionPage() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [message, setMessage] = useState("");
  const [chargement, setChargement] = useState(false);

  async function creerCompte(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email: email,
      password: motDePasse,
    });

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("✅ Compte créé avec succès ! Bienvenue 🎉");
    }

    setChargement(false);
  }

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <form
        onSubmit={creerCompte}
        className="bg-white w-full max-w-md p-8 rounded-2xl shadow-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-green-700 text-center">
          Créer mon compte vendeuse
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
            minLength={8}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="border rounded-lg p-3 text-gray-900"
            placeholder="8 caractères minimum"
          />
        </label>

        <button
          type="submit"
          disabled={chargement}
          className="bg-green-600 text-white py-3 rounded-full font-semibold disabled:opacity-50"
        >
          {chargement ? "Création en cours..." : "Créer mon compte"}
        </button>

        {message && <p className="text-center text-gray-800">{message}</p>}
      </form>
    </main>
  );
}