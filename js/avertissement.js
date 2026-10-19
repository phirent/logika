import { obtenirAvertissement } from "./progress.js";

// Affiche en haut de la page le message d'erreur de sauvegarde, s'il y en a un
export function afficherAvertissement(zone) {
  const ancien = document.getElementById("avertissement");
  if (ancien) ancien.remove();

  const message = obtenirAvertissement();
  if (!message) return;

  const bloc = document.createElement("p");
  bloc.id = "avertissement";
  bloc.className = "bloc";
  bloc.setAttribute("role", "alert");
  bloc.textContent = message;
  zone.prepend(bloc);
}