export default function Home() {
  return (
    <main className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-green-700">
        Mini Boutique 🛍️
      </h1>
      <p className="mt-4 text-lg text-gray-700 text-center">
        Crée ta boutique en ligne en 2 minutes
        et reçois tes commandes sur WhatsApp.
      </p>
      <button className="mt-8 bg-green-600 text-white px-6 py-3 rounded-full font-semibold">
        Créer ma boutique
      </button>
    </main>
  );
}