"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Produit = {
  id: string;
  nom: string;
  prix: number;
  description: string | null;
  disponible: boolean;
  image_url: string | null;
};

export default function Produits({ boutiqueId }: { boutiqueId: string }) {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);

  // Pour la modification
  const [enEdition, setEnEdition] = useState<string | null>(null);
  const [editNom, setEditNom] = useState("");
  const [editPrix, setEditPrix] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Charger les produits de la boutique
  useEffect(() => {
    async function chargerProduits() {
      const { data } = await supabase
        .from("produits")
        .select("id, nom, prix, description, disponible, image_url")
        .eq("boutique_id", boutiqueId)
        .order("created_at", { ascending: false });

      setProduits(data ?? []);
    }
    chargerProduits();
  }, [boutiqueId]);

  // Envoyer une photo dans le Storage et récupérer son lien
  async function envoyerPhoto(fichier: File) {
    const { data: utilisateur } = await supabase.auth.getUser();
    if (!utilisateur.user) return null;

    const extension = fichier.name.split(".").pop();
    const chemin = utilisateur.user.id + "/" + Date.now() + "." + extension;

    const { error } = await supabase.storage
      .from("images")
      .upload(chemin, fichier);

    if (error) {
      setMessage("❌ Photo : " + error.message);
      return null;
    }

    const { data } = supabase.storage.from("images").getPublicUrl(chemin);
    return data.publicUrl;
  }

  // Ajouter un produit
  async function ajouterProduit(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setMessage("");

    let imageUrl: string | null = null;
    if (photo) {
      imageUrl = await envoyerPhoto(photo);
      if (!imageUrl) {
        setEnvoi(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from("produits")
      .insert({
        boutique_id: boutiqueId,
        nom: nom,
        prix: Number(prix),
        description: description || null,
        image_url: imageUrl,
      })
      .select("id, nom, prix, description, disponible, image_url")
      .single();

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setProduits([data, ...produits]);
      setNom("");
      setPrix("");
      setDescription("");
      setPhoto(null);
      (e.target as HTMLFormElement).reset();
      setMessage("✅ Produit ajouté !");
    }

    setEnvoi(false);
  }

  // Disponible <-> Épuisé
  async function changerDisponibilite(produit: Produit) {
    const { error } = await supabase
      .from("produits")
      .update({ disponible: !produit.disponible })
      .eq("id", produit.id);

    if (!error) {
      setProduits(
        produits.map((p) =>
          p.id === produit.id ? { ...p, disponible: !p.disponible } : p
        )
      );
    }
  }

  // Supprimer un produit
  async function supprimerProduit(produit: Produit) {
    if (!confirm("Supprimer « " + produit.nom + " » ?")) return;

    const { error } = await supabase
      .from("produits")
      .delete()
      .eq("id", produit.id);

    if (!error) {
      setProduits(produits.filter((p) => p.id !== produit.id));
    }
  }

  // Ouvrir le mode modification
  function commencerModification(produit: Produit) {
    setEnEdition(produit.id);
    setEditNom(produit.nom);
    setEditPrix(String(produit.prix));
    setEditDescription(produit.description ?? "");
  }

  // Enregistrer la modification
  async function enregistrerModification(produit: Produit) {
    const nouvellesValeurs = {
      nom: editNom,
      prix: Number(editPrix),
      description: editDescription || null,
    };

    const { error } = await supabase
      .from("produits")
      .update(nouvellesValeurs)
      .eq("id", produit.id);

    if (!error) {
      setProduits(
        produits.map((p) =>
          p.id === produit.id ? { ...p, ...nouvellesValeurs } : p
        )
      );
      setEnEdition(null);
    } else {
      alert("❌ " + error.message);
    }
  }

  return (
    <div className="border-t pt-6 mt-2 flex flex-col gap-6">
      {/* Formulaire d'ajout */}
      <form onSubmit={ajouterProduit} className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-green-700">Ajouter un produit ➕</h2>

        <input
          type="text"
          required
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="border rounded-lg p-3 text-gray-900"
          placeholder="Nom du produit (ex : Robe en wax)"
        />

        <input
          type="number"
          required
          min="0"
          value={prix}
          onChange={(e) => setPrix(e.target.value)}
          className="border rounded-lg p-3 text-gray-900"
          placeholder="Prix en FCFA (ex : 15000)"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded-lg p-3 text-gray-900"
          placeholder="Description (facultatif)"
          rows={2}
        />

        <label className="flex flex-col gap-1 text-gray-700">
          📷 Photo du produit (facultatif)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            className="border rounded-lg p-2 text-gray-900"
          />
        </label>

        <button
          type="submit"
          disabled={envoi}
          className="bg-green-600 text-white py-3 rounded-full font-semibold disabled:opacity-50"
        >
          {envoi ? "Ajout en cours..." : "Ajouter le produit"}
        </button>

        {message && <p className="text-center text-gray-800">{message}</p>}
      </form>

      {/* Liste des produits */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-green-700">
          Mes produits ({produits.length})
        </h2>

        {produits.length === 0 && (
          <p className="text-gray-500">Aucun produit pour l'instant.</p>
        )}

        {produits.map((produit) =>
          enEdition === produit.id ? (
            /* Carte en mode modification */
            <div key={produit.id} className="border-2 border-green-400 rounded-xl p-4 flex flex-col gap-2">
              <input
                type="text"
                value={editNom}
                onChange={(e) => setEditNom(e.target.value)}
                className="border rounded-lg p-2 text-gray-900"
              />
              <input
                type="number"
                min="0"
                value={editPrix}
                onChange={(e) => setEditPrix(e.target.value)}
                className="border rounded-lg p-2 text-gray-900"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="border rounded-lg p-2 text-gray-900"
                rows={2}
                placeholder="Description (facultatif)"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => enregistrerModification(produit)}
                  className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold"
                >
                  💾 Enregistrer
                </button>
                <button
                  onClick={() => setEnEdition(null)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            /* Carte normale */
            <div
              key={produit.id}
              className="border rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                {produit.image_url ? (
                  <img
                    src={produit.image_url}
                    alt={produit.nom}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    📦
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{produit.nom}</p>
                  <p className="text-green-700 font-bold">
                    {produit.prix.toLocaleString("fr-FR")} FCFA
                  </p>
                  {produit.description && (
                    <p className="text-sm text-gray-500">{produit.description}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 items-end">
                <button
                  onClick={() => changerDisponibilite(produit)}
                  className={
                    produit.disponible
                      ? "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                      : "bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                  }
                >
                  {produit.disponible ? "✅ Disponible" : "⛔ Épuisé"}
                </button>
                <button
                  onClick={() => commencerModification(produit)}
                  className="text-sm text-green-700 underline"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => supprimerProduit(produit)}
                  className="text-sm text-gray-500 underline"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}