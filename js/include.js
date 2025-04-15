function activateStickyEffect() {
  const nav = document.querySelector('.main-nav');
  if (!nav) {
    console.warn("Pas de .main-nav trouvé pour sticky");
    return;
  }

  // Appliquer la classe immédiatement si déjà scrollé
  if (window.scrollY > 20) {
    nav.classList.add('scrolled');
  }

  // Ajouter le scroll listener
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
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

        // ✅ Important : attendre que le HTML soit bien injecté avant d’activer le sticky
        if (html.includes("main-nav")) {
          requestAnimationFrame(activateStickyEffect);
        }
      })
      .catch(err => console.error("Erreur d'inclusion:", file, err));
  });
});
