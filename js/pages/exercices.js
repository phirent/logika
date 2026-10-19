import {
  nombreTerminesDuModule,
  moduleDebloque,
  identifiantsDuModule,
  exerciceDebloque,
  estTermine,
  prochainExercice,
} from "../progress.js";

function ligneExercice(id, numero, modules) {
  const ligne = document.createElement("li");
  const nom = `Exercice ${numero}`;

  if (estTermine(id)) {
    ligne.className = "exercice termine";
    const lien = document.createElement("a");
    lien.href = `#/exercice/${id}`;
    lien.textContent = `${nom} — Terminé · Revoir la correction`;
    ligne.append(lien);
  } else if (exerciceDebloque(id, modules)) {
    ligne.className = "exercice a-faire";
    const lien = document.createElement("a");
    lien.href = `#/exercice/${id}`;
    lien.textContent = `${nom} — À faire maintenant`;
    ligne.append(lien);
  } else {
    ligne.className = "exercice ferme";
    ligne.textContent = `${nom} — Disponible après l'exercice précédent`;
  }
  return ligne;
}

function blocModule(module, modules, prochain) {
  const numero = String(module.module).padStart(2, "0");

  // Module verrouillé : une simple ligne, on ne peut pas l'ouvrir
  if (!moduleDebloque(module.module, modules)) {
    const bloc = document.createElement("p");
    bloc.className = "module module-ferme";
    bloc.textContent = `${numero} — ${module.titre} · Verrouillé`;
    return bloc;
  }

  const identifiants = identifiantsDuModule(module);

  const details = document.createElement("details");
  details.className = "module";
  details.open = identifiants.includes(prochain); // ouvert seulement s'il contient le prochain exercice

  const resume = document.createElement("summary");
  const compteur = `${nombreTerminesDuModule(module)} / ${module.nombreExercices}`;
  resume.textContent = `${numero} — ${module.titre} · ${compteur}`;
  details.append(resume);

  const liste = document.createElement("ul");
  identifiants.forEach((id, index) => {
    liste.append(ligneExercice(id, index + 1, modules));
  });
  details.append(liste);

  return details;
}

export function afficherExercices(zone, modules, message) {
  zone.replaceChildren();

  if (message) {
    const bloc = document.createElement("p");
    bloc.className = "bloc";
    bloc.setAttribute("role", "status");
    bloc.textContent = message;
    zone.append(bloc);
  }

  const titre = document.createElement("h1");
  titre.textContent = "Exercices";
  zone.append(titre);

  const prochain = prochainExercice(modules);
  for (const module of modules) {
    zone.append(blocModule(module, modules, prochain));
  }
}