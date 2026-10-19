import { afficher } from "./routeur.js";

window.addEventListener("hashchange", afficher);
afficher();

// Le service worker n'est pas enregistré en local, pour que tes modifications s'affichent
const enLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";

if ("serviceWorker" in navigator && !enLocal) {
  navigator.serviceWorker.register("sw.js").catch((erreur) => {
    console.error("Service worker non enregistré :", erreur);
  });
}