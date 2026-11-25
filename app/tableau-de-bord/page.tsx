"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Produits from "./Produits";

type Boutique = {
  id: string;
  nom: string;
  slug: string;
  whatsapp: string;
  logo_url: string | null;
};

// Transforme "Chez Fatou Élégance" en "chez-fatou-elegance"
function creerSlug(texte: string) {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Transforme "77 123 45 67" en "221771234567"
function nettoyerNumero(numero: string) {
  let chiffres = numero.replace(/\D/g, "");
  if (chiffres.length === 9) {
    chiffres = "221" + chiffres;
  }
  return chiffres;
}

export default function TableauDeBordPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [chargement, setChargement] = useState(true);

  const [nom, setNom] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [envoiLogo, setEnvoiLogo] = useState(false);

  useEffect(() => {
    async function chargerDonnees() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/connexion");
        return;
      }

      setUserId(data.user.id);
      setEmail(data.user.email ?? "");

      const { data: maBoutique } = await supabase
        .from("boutiques")
        .select("id, nom, slug, whatsapp, logo_url")
        .eq("user_id", data.user.id)
        .maybeSingle();

      setBoutique(maBoutique);
      setChargement(false);
    }
    chargerDonnees();
  }, [router]);

  async function creerBoutique(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setEnvoi(true);
    setMessage("");

    const { data, error } = await supabase
      .from("boutiques")
      .insert({
        user_id: userId,
        nom: nom,
        slug: creerSlug(nom),
        whatsapp: nettoyerNumero(whatsapp),
      })
      .select("id, nom, slug, whatsapp, logo_url")
      .single();

    if (error) {
      if (error.code === "23505") {
        setMessage("❌ Ce nom de boutique est déjà pris. Essaie un autre nom.");
      } else {
        setMessage("❌ " + error.message);
      }
    } else {
      setBoutique(data);
    }

    setEnvoi(false);
  }

  // Envoyer le logo et l'enregistrer dans la boutique
  async function changerLogo(fichier: File) {
    if (!userId || !boutique) return;
    setEnvoiLogo(true);

    const extension = fichier.name.split(".").pop();
    const chemin = userId + "/logo-" + Date.now() + "." + extension;

    const { error: erreurEnvoi } = await supabase.storage
      .from("images")
      .upload(chemin, fichier);

    if (erreurEnvoi) {
      alert("❌ Logo : " + erreurEnvoi.message);
      setEnvoiLogo(false);
      return;
    }

    const { data } = supabase.storage.from("images").getPublicUrl(chemin);
    const logoUrl = data.publicUrl;

    const { error } = await supabase
      .from("boutiques")
      .update({ logo_url: logoUrl })
      .eq("id", boutique.id);

    if (error) {
      alert("❌ " + error.message);
    } else {
      setBoutique({ ...boutique, logo_url: logoUrl });
    }

    setEnvoiLogo(false);
  }

  async function seDeconnecter() {
    await supabase.auth.signOut();
    router.push("/connexion");
  }

  if (chargement) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green-50 p-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <p className="text-gray-700">
            Connectée : <strong>{email}</strong>
          </p>
          <button
            onClick={seDeconnecter}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold"
          >
            Se déconnecter
          </button>
        </div>

        {boutique ? (
          /* La vendeuse a une boutique */
          <div className="bg-white p-8 rounded-2xl shadow-md flex flex-col gap-3">
            <div className="flex items-center gap-4">
              {boutique.logo_url ? (
                <img
                  src={boutique.logo_url}
                  alt={"Logo de " + boutique.nom}
                  className="w-20 h-20 rounded-full object-cover border"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-3xl">
                  🛍️
                </div>
              )}
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-green-700">{boutique.nom}</h1>
                <label className="text-sm text-green-700 underline cursor-pointer">
                  {envoiLogo
                    ? "Envoi du logo..."
                    : boutique.logo_url
                    ? "📷 Changer le logo"
                    : "📷 Ajouter un logo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={envoiLogo}
                    onChange={(e) => {
                      const fichier = e.target.files?.[0];
                      if (fichier) changerLogo(fichier);
                    }}
                  />
                </label>
              </div>
            </div>

            <p className="text-gray-700">
              📱 WhatsApp : <strong>+{boutique.whatsapp}</strong>
            </p>
            <p className="text-gray-700">
              🔗 Ton futur lien : <strong>/boutique/{boutique.slug}</strong>
            </p>

            <Produits boutiqueId={boutique.id} />
          </div>
        ) : (
          /* La vendeuse n'a pas encore de boutique */
          <form
            onSubmit={creerBoutique}
            className="bg-white p-8 rounded-2xl shadow-md flex flex-col gap-4"
          >
            <h1 className="text-2xl font-bold text-green-700">
              Créer ma boutique 🛍️
            </h1>

            <label className="flex flex-col gap-1 text-gray-700">
              Nom de la boutique
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="border rounded-lg p-3 text-gray-900"
                placeholder="Chez Fatou"
              />
            </label>
            {nom && (
              <p className="text-sm text-gray-500 -mt-2">
                Ton lien sera : /boutique/{creerSlug(nom)}
              </p>
            )}

            <label className="flex flex-col gap-1 text-gray-700">
              Numéro WhatsApp
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="border rounded-lg p-3 text-gray-900"
                placeholder="77 123 45 67"
              />
            </label>

            <button
              type="submit"
              disabled={envoi}
              className="bg-green-600 text-white py-3 rounded-full font-semibold disabled:opacity-50"
            >
              {envoi ? "Création..." : "Créer ma boutique"}
            </button>

            {message && <p className="text-center text-gray-800">{message}</p>}
          </form>
        )}
      </div>
    </main>
  );
}