// Crée un élément HTML : el("p", "bloc", "Texte")
export function el(balise, classe, texte) {
  const element = document.createElement(balise);
  if (classe) element.className = classe;
  if (texte !== undefined) element.textContent = texte;
  return element;
}

// Écrit un texte dans un élément, en mettant en forme ce qui est entre accents graves
export function texteAvecCode(parent, texte) {
  texte.split("`").forEach((morceau, index) => {
    if (index % 2 === 1) {
      parent.append(el("code", "code-ligne", morceau));
    } else {
      parent.append(morceau);
    }
  });
}