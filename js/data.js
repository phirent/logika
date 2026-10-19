// Garde en mémoire ce qu'on a déjà chargé, pour ne pas le redemander
const memoire = {};

async function charger(chemin) {
  if (memoire[chemin]) {
    return memoire[chemin];
  }
  const reponse = await fetch(chemin);
  if (!reponse.ok) {
    throw new Error(`Impossible de charger ${chemin} (erreur ${reponse.status})`);
  }
  const donnees = await reponse.json();
  memoire[chemin] = donnees;
  return donnees;
}

export async function chargerModules() {
  const fichier = await charger("data/modules.json");
  return fichier.modules;
}

export function chargerModule(numero) {
  const nom = String(numero).padStart(2, "0"); // 0 devient "00"
  return charger(`data/module-${nom}.json`);
}

export async function chargerCitations() {
  const fichier = await charger("data/citations.json");
  return fichier.citations;
}

export async function chargerAnecdotes() {
  const fichier = await charger("data/anecdotes.json");
  return fichier.anecdotes;
}