function activateStickyEffect() {
  const headerBlock = document.querySelector('.sticky-header');
  if (!headerBlock) return;

  // Appliquer directement au chargement si scrollé
  if (window.scrollY > 20) {
    headerBlock.classList.add('scrolled');
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      headerBlock.classList.add('scrolled');
    } else {
      headerBlock.classList.remove('scrolled');
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const targets = document.querySelectorAll('[data-include]');

  targets.forEach(el => {
    const file = el.getAttribute("data-include");

    fetch(file)
      .then(res => {
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        return res.text();
      })
      .then(html => {
        el.innerHTML = html;

        // ✅ Astuce : on force une "repaint" une fois l’élément injecté
        if (html.includes("main-nav")) {
          const nav = document.querySelector(".main-nav");
          if (nav) {
            nav.style.position = "sticky";
            nav.offsetHeight; // force repaint
          }
        }
      })
      .catch(err => console.error("Erreur d'inclusion:", file, err));
  });
});
