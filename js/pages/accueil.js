import { chargerCitations, chargerAnecdotes } from "../data.js";
import { prochainExercice, nombreTermines } from "../progress.js";
import { el } from "../outils.js";

// Un nombre qui change chaque jour (heure locale)
function jourDuJour() {
  const maintenant = new Date();
  const decalage = maintenant.getTimezoneOffset() * 60000;
  return Math.floor((maintenant.getTime() - decalage) / 86400000);
}

export async function afficherAccueil(zone, modules) {
  const citations = await chargerCitations();
  const anecdotes = await chargerAnecdotes();

  const prochain = prochainExercice(modules);
  const jour = jourDuJour();
  const elements = [];

  elements.push(el("p", "etiquette", "On reprend ?"));
  elements.push(el("h1", null, "À toi de jouer."));
  elements.push(el("p", null, "Continue à avancer, un exercice à la fois."));

  // ----- Prochain exercice -----
  let numeroModule = null;
  const carte = el("div", "bloc");

  if (prochain) {
    const [, module, ordre] = /^m(\d+)-e(\d+)$/.exec(prochain);
    numeroModule = Number(module);
    const infos = modules.find((m) => m.module === numeroModule);

    carte.append(el("p", "etiquette", "Prochain exercice"));
    carte.append(el("h2", null, `Exercice ${Number(ordre)}`));
    carte.append(el("p", "discret", `${module} — ${infos.titre}`));

    const lien = el("a", "bouton", nombreTermines() === 0 ? "Commencer l'exercice" : "Continuer l'exercice");
    lien.href = `#/exercice/${prochain}`;
    carte.append(lien);
  } else {
    carte.append(el("h2", null, "Bravo !"));
    carte.append(el("p", null, "Tu as terminé tous les exercices disponibles."));
  }
  elements.push(carte);

  // ----- Citation du jour -----
  if (citations.length > 0) {
    const citation = citations[jour % citations.length];
    const bloc = el("div", "bloc");
    bloc.append(el("p", "etiquette", "Un petit rappel"));
    bloc.append(el("p", null, `« ${citation.texte} »`));
    elements.push(bloc);
  }

  // ----- Anecdote : celles du module en cours, sinon les générales -----
  let pool = anecdotes.filter((a) => a.module === numeroModule);
  if (pool.length === 0) pool = anecdotes.filter((a) => a.module === null);
  if (pool.length === 0) pool = anecdotes;

  if (pool.length > 0) {
    const anecdote = pool[jour % pool.length];
    const bloc = el("div", "bloc");
    bloc.append(el("p", "etiquette", "Le savais-tu ?"));
    bloc.append(el("p", null, anecdote.texte));
    elements.push(bloc);
  }

  zone.replaceChildren(...elements);
}