const CLE = "logika-progression";
const VERSION = 1;

// Les exercices terminés, gardés en mémoire pendant que l'application tourne
let termines = new Set();

// Un message à montrer à l'étudiant si la sauvegarde pose problème
let avertissement = null;

/* ---------- Lecture et écriture ---------- */

function lire() {
  let texte;
  try {
    texte = localStorage.getItem(CLE);
  } catch (erreur) {
    avertissement = "Ton appareil ne permet pas d'enregistrer ta progression. Elle sera perdue quand tu fermeras l'application.";
    return new Set();
  }

  if (texte === null) {
    return new Set(); // première visite : rien d'enregistré
  }

  try {
    const donnees = JSON.parse(texte);
    if (donnees.version !== VERSION || !Array.isArray(donnees.termines)) {
      throw new Error("Format inconnu");
    }
    return new Set(donnees.termines);
  } catch (erreur) {
    avertissement = "Ta progression enregistrée est illisible. Elle a été remise à zéro.";
    return new Set();
  }
}

function sauvegarder() {
  try {
    const donnees = { version: VERSION, termines: [...termines] };
    localStorage.setItem(CLE, JSON.stringify(donnees));
  } catch (erreur) {
    avertissement = "Ta progression n'a pas pu être enregistrée. Elle sera perdue quand tu fermeras l'application.";
  }
}

// S'exécute une seule fois, au chargement du fichier
termines = lire();

/* ---------- Ce que les autres fichiers peuvent utiliser ---------- */

export function obtenirAvertissement() {
  return avertissement;
}

export function estTermine(id) {
  return termines.has(id);
}

export function marquerTermine(id) {
  termines.add(id);
  sauvegarder();
}

export function nombreTermines() {
  return termines.size;
}

/* ---------- Calculs à partir de modules.json ---------- */

// Reconstruit les identifiants d'un module : "m00-e01", "m00-e02"...
export function identifiantsDuModule(module) {
  const numero = String(module.module).padStart(2, "0");
  const identifiants = [];
  for (let ordre = 1; ordre <= module.nombreExercices; ordre++) {
    identifiants.push(`m${numero}-e${String(ordre).padStart(2, "0")}`);
  }
  return identifiants;
}

export function nombreTerminesDuModule(module) {
  return identifiantsDuModule(module).filter((id) => termines.has(id)).length;
}

export function moduleTermine(module) {
  return nombreTerminesDuModule(module) === module.nombreExercices;
}

// Un module est ouvert si c'est le premier, ou si le précédent est terminé
export function moduleDebloque(numero, modules) {
  const position = modules.findIndex((m) => m.module === numero);
  if (position === -1) return false;
  if (position === 0) return true;
  return moduleTermine(modules[position - 1]);
}

// Le premier exercice, dans l'ordre, qui n'est pas terminé (null si tout est fini)
export function prochainExercice(modules) {
  for (const module of modules) {
    for (const id of identifiantsDuModule(module)) {
      if (!termines.has(id)) {
        return id;
      }
    }
  }
  return null;
}

// Un exercice est ouvert si son module est ouvert
// et que tous les exercices avant lui dans ce module sont terminés
export function exerciceDebloque(id, modules) {
  for (const module of modules) {
    const identifiants = identifiantsDuModule(module);
    const position = identifiants.indexOf(id);
    if (position === -1) continue; // pas dans ce module, on regarde le suivant

    if (!moduleDebloque(module.module, modules)) return false;
    return identifiants.slice(0, position).every((precedent) => termines.has(precedent));
  }
  return false; // identifiant inconnu
}