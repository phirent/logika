// À changer à chaque publication, pour que les appareils récupèrent les nouveaux fichiers
const VERSION = "logika-v1";

const MODULES = Array.from({ length: 16 }, (_, i) => `data/module-${String(i).padStart(2, "0")}.json`);

const FICHIERS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/style.css",
  "icons/favicon.svg",
  "js/app.js",
  "js/routeur.js",
  "js/data.js",
  "js/progress.js",
  "js/outils.js",
  "js/avertissement.js",
  "js/pages/accueil.js",
  "js/pages/exercices.js",
  "js/pages/exercice.js",
  "js/pages/progression.js",
  "data/modules.json",
  "data/citations.json",
  "data/anecdotes.json",
  ...MODULES,
];

// Installation : on met tous les fichiers en cache
self.addEventListener("install", (evenement) => {
  evenement.waitUntil(
    caches.open(VERSION).then((cache) =>
      cache.addAll(FICHIERS.map((fichier) => new Request(fichier, { cache: "reload" })))
    )
  );
});

// Activation : on supprime les anciens caches
self.addEventListener("activate", (evenement) => {
  evenement.waitUntil(
    caches.keys().then((noms) =>
      Promise.all(noms.filter((nom) => nom !== VERSION).map((nom) => caches.delete(nom)))
    )
  );
});

// Chaque demande : d'abord le cache, sinon le réseau
self.addEventListener("fetch", (evenement) => {
  if (evenement.request.method !== "GET") return;

  evenement.respondWith(
    caches.match(evenement.request).then((reponse) => reponse || fetch(evenement.request))
  );
});