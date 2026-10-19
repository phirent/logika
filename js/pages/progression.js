import { nombreTermines, nombreTerminesDuModule } from "../progress.js";
import { el } from "../outils.js";

export function afficherProgression(zone, modules) {
  const total = modules.reduce((somme, module) => somme + module.nombreExercices, 0);

  const nombre = el("p", "grand-nombre", String(nombreTermines()));
  nombre.append(el("span", null, ` / ${total} exercices`));

  const liste = el("ul", "liste-modules");
  for (const module of modules) {
    const numero = String(module.module).padStart(2, "0");
    const ligne = el("li");
    ligne.append(
      el("span", null, `${numero} — ${module.titre}`),
      el("span", null, `${nombreTerminesDuModule(module)} / ${module.nombreExercices}`)
    );
    liste.append(ligne);
  }

  zone.replaceChildren(
    el("h1", null, "Ta progression"),
    el("p", null, "Les exercices que tu as déclarés terminés."),
    nombre,
    el("h2", null, "Par module"),
    liste,
    el(
      "p",
      "bloc",
      "Terminer un exercice signifie que tu as déclaré avoir fini ton travail. Cela ne garantit pas que tu maîtrises déjà la notion."
    )
  );
}