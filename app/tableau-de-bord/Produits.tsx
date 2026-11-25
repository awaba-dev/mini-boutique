"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Produit = {
  id: string;
  nom: string;
  prix: number;
  description: string | null;
  disponible: boolean;
};

export default function Produits({ boutiqueId }: { boutiqueId: string }) {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);

  // Charger les produits de la boutique
  useEffect(() => {
    async function chargerProduits() {
      const { data } = await supabase
        .from("produits")
        .select("id, nom, prix, description, disponible")
        .eq("boutique_id", boutiqueId)
        .order("created_at", { ascending: false });

      setProduits(data ?? []);
    }
    chargerProduits();
  }, [boutiqueId]);

  // Ajouter un produit
  async function ajouterProduit(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setMessage("");

    const { data, error } = await supabase
      .from("produits")
      .insert({
        boutique_id: boutiqueId,
        nom: nom,
        prix: Number(prix),
        description: description || null,
      })
      .select("id, nom, prix, description, disponible")
      .single();

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setProduits([data, ...produits]);
      setNom("");
      setPrix("");
      setDescription("");
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

        <button
          type="submit"
          disabled={envoi}
          className="bg-green-600 text-white py-3 rounded-full font-semibold disabled:opacity-50"
        >
          {envoi ? "Ajout..." : "Ajouter le produit"}
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

        {produits.map((produit) => (
          <div
            key={produit.id}
            className="border rounded-xl p-4 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-semibold text-gray-900">{produit.nom}</p>
              <p className="text-green-700 font-bold">
                {produit.prix.toLocaleString("fr-FR")} FCFA
              </p>
              {produit.description && (
                <p className="text-sm text-gray-500">{produit.description}</p>
              )}
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
                onClick={() => supprimerProduit(produit)}
                className="text-sm text-gray-500 underline"
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}