import { chargerModules } from "./data.js";
import { exerciceDebloque } from "./progress.js";
import { afficherAvertissement } from "./avertissement.js";
import { afficherAccueil } from "./pages/accueil.js";
import { afficherExercices } from "./pages/exercices.js";
import { afficherExercice } from "./pages/exercice.js";
import { afficherProgression } from "./pages/progression.js";

const zone = document.getElementById("app");
const liens = document.querySelectorAll(".navigation a");

const MESSAGE_VERROUILLE =
  "Cet exercice n'est pas encore ouvert. Termine d'abord les exercices précédents.";

// Le message à montrer sur la liste après une redirection
let messageEnAttente = null;

function marquerPageActive(page) {
  for (const lien of liens) {
    if (lien.dataset.page === page) {
      lien.setAttribute("aria-current", "page");
    } else {
      lien.removeAttribute("aria-current");
    }
  }
}

export async function afficher() {
  // "#/exercice/m00-e01" devient ["exercice", "m00-e01"]
  const morceaux = location.hash.replace(/^#\/?/, "").split("/");
  const page = morceaux[0] || "accueil";
  const id = morceaux[1];

  try {
    const modules = await chargerModules();

    if (page === "accueil") {
      marquerPageActive("accueil");
      await afficherAccueil(zone, modules);
    } else if (page === "exercices") {
      marquerPageActive("exercices");
      const message = messageEnAttente;
      messageEnAttente = null; // le message ne s'affiche qu'une fois
      afficherExercices(zone, modules, message);
    } else if (page === "progression") {
      marquerPageActive("progression");
      afficherProgression(zone, modules);
    } else if (page === "exercice" && id) {
      if (!exerciceDebloque(id, modules)) {
        messageEnAttente = MESSAGE_VERROUILLE;
        location.hash = "#/exercices"; // relance afficher() tout seul
        return;
      }
      marquerPageActive("exercices");
      await afficherExercice(zone, id, modules);
    } else {
      location.hash = "#/accueil"; // adresse inconnue
      return;
    }

    afficherAvertissement(zone);
    window.scrollTo(0, 0);
  } catch (erreur) {
    zone.textContent = "Impossible de charger les exercices.";
    console.error(erreur);
  }
}