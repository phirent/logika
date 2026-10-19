import { chargerModule } from "../data.js";
import { estTermine, marquerTermine, identifiantsDuModule } from "../progress.js";
import { afficherAvertissement } from "../avertissement.js";
import { el, texteAvecCode } from "../outils.js";

function blocCode(lignes) {
  const pre = el("pre");
  pre.append(el("code", null, lignes.join("\n")));
  return pre;
}

function aDuCode(exo) {
  return Boolean(exo.correction.pseudocode || exo.correction.c);
}

// L'exercice qui vient juste après dans l'ordre (null si c'est le dernier)
function exerciceSuivant(id, modules) {
  const tous = modules.flatMap((module) => identifiantsDuModule(module));
  const position = tous.indexOf(id);
  return position !== -1 && position < tous.length - 1 ? tous[position + 1] : null;
}

function boutonFormat(nom, description, action) {
  const bouton = el("button", "bouton bouton-secondaire bouton-choix");
  bouton.type = "button";
  bouton.append(el("strong", null, nom), el("span", null, description));
  bouton.addEventListener("click", action);
  return bouton;
}

export async function afficherExercice(zone, id, modules) {
  const numeroModule = Number(id.slice(1, 3));
  const module = await chargerModule(numeroModule);
  const exo = module.exercices.find((e) => e.id === id);

  if (!exo) {
    zone.replaceChildren(el("p", "bloc", "Cet exercice est introuvable."));
    return;
  }

  function montrer(...elements) {
    zone.replaceChildren(...elements);
    window.scrollTo(0, 0);
  }

  /* ---------- Les indices, un par un ---------- */

  function blocIndices() {
    const conteneur = el("div", "indices");
    const liste = el("ol", "liste-indices");
    const bouton = el("button", "bouton bouton-secondaire", "Un p'tit coup de pouce ?");
    bouton.type = "button";

    let affiches = 0;
    bouton.addEventListener("click", () => {
      const ligne = el("li", "bloc");
      texteAvecCode(ligne, exo.indices[affiches]);
      liste.append(ligne);
      affiches += 1;

      if (affiches === exo.indices.length) {
        bouton.remove();
      } else {
        bouton.textContent = "Un autre coup de pouce ?";
      }
    });

    conteneur.append(bouton, liste);
    return conteneur;
  }

  /* ---------- Écran 1 : l'énoncé ---------- */

  function ecranEnonce() {
    const enonce = el("p", "enonce");
    texteAvecCode(enonce, exo.enonce);

    const elements = [el("h1", null, `Exercice ${exo.ordre}`), enonce];
    if (exo.code) elements.push(blocCode(exo.code));
    if (exo.indices.length > 0) elements.push(blocIndices());
    elements.push(el("p", "discret", "Prends une feuille et écris ta réponse avant de consulter la correction."));

    const bouton = el("button", "bouton");
    bouton.type = "button";

    if (estTermine(id)) {
      bouton.textContent = "Revoir la correction";
      bouton.classList.add("bouton-secondaire");
      bouton.addEventListener("click", apresEnonce);
    } else {
      bouton.textContent = "J'ai terminé sur";
      bouton.addEventListener("click", () => {
        marquerTermine(id);
        apresEnonce();
        afficherAvertissement(zone);
      });
    }

    const actions = el("div", "actions");
    actions.append(bouton);
    elements.push(actions);

    montrer(...elements);
  }

  function apresEnonce() {
    if (aDuCode(exo)) {
      ecranChoix();
    } else {
      ecranCorrection(null);
    }
  }

  /* ---------- Écran 2 : le choix du format ---------- */

  function ecranChoix() {
    const formats = [];
    if (exo.correction.pseudocode) formats.push("pseudocode");
    if (exo.correction.c) formats.push("c");

    if (formats.length === 1) {
      ecranCorrection(formats[0]);
      return;
    }

    const choix = el("div", "choix");
    choix.append(
      boutonFormat("Pseudo-code", "Comprendre les étapes de l'algorithme.", () => ecranCorrection("pseudocode")),
      boutonFormat("Langage C", "Voir comment traduire l'algorithme en code.", () => ecranCorrection("c"))
    );

    montrer(
      el("h1", null, "Bien, tu as essayé."),
      el("p", null, "Compare maintenant ton raisonnement avec une correction."),
      el("h2", null, "Quel format veux-tu consulter ?"),
      choix
    );
  }

  /* ---------- Écran 3 : la correction ---------- */

  function ecranCorrection(format) {
    const correction = exo.correction;
    const noms = { pseudocode: "Pseudo-code", c: "Langage C" };

    const elements = [
      el("p", "etiquette", format ? `Correction · ${noms[format]}` : "Correction"),
      el("h1", null, "Comment résoudre le problème"),
    ];

    const vide = !correction.explication && !correction.pseudocode && !correction.c;
    if (vide) {
      elements.push(el("p", null, "La correction de cet exercice n'est pas encore disponible."));
    }

    // L'explication d'abord
    if (correction.explication) {
      elements.push(el("h2", null, "Explication"));
      for (const paragraphe of correction.explication) {
        const p = el("p");
        texteAvecCode(p, paragraphe);
        elements.push(p);
      }
    }

    // Puis le code
    if (format) {
      elements.push(el("h2", null, format === "pseudocode" ? "Algorithme de référence" : "Programme en C"));
      elements.push(blocCode(correction[format]));
    }

    const retenir = el("p", "bloc");
    retenir.append(el("strong", null, "À retenir"));
    retenir.append(" — D'autres formulations peuvent être correctes si elles produisent le résultat demandé à partir des bonnes informations.");
    elements.push(retenir);

    // Les boutons du bas
    const actions = el("div", "actions");

    const suivant = exerciceSuivant(id, modules);
    const lien = el("a", "bouton", suivant ? "Passer à l'exercice suivant" : "Retour à la liste");
    lien.href = suivant ? `#/exercice/${suivant}` : "#/exercices";
    actions.append(lien);

    if (correction.pseudocode && correction.c) {
      const autre = el("button", "bouton bouton-secondaire", "Changer de format");
      autre.type = "button";
      autre.addEventListener("click", ecranChoix);
      actions.append(autre);
    }

    const retour = el("button", "bouton bouton-secondaire", "Revoir l'énoncé");
    retour.type = "button";
    retour.addEventListener("click", ecranEnonce);
    actions.append(retour);

    elements.push(actions);
    montrer(...elements);
  }

  ecranEnonce();
}