"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TableauDeBordPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function verifierConnexion() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/connexion");
      } else {
        setEmail(data.user.email ?? "");
      }
    }
    verifierConnexion();
  }, [router]);

  async function seDeconnecter() {
    await supabase.auth.signOut();
    router.push("/connexion");
  }

  if (email === null) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-green-700">
          Bonjour 👋
        </h1>
        <p className="text-gray-700">
          Tu es connectée avec : <strong>{email}</strong>
        </p>
        <p className="text-gray-600">
          Bientôt ici : ta boutique et tes produits 🛍️
        </p>
        <button
          onClick={seDeconnecter}
          className="self-start bg-gray-200 text-gray-800 px-5 py-2 rounded-full font-semibold"
        >
          Se déconnecter
        </button>
      </div>
    </main>
  );
}