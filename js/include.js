// Une fois l'en-tête chargé, activer le sticky + shadow dynamique
function activateStickyEffect() {
  const nav = document.querySelector('.main-nav');
  if (!nav) return;

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

        // ⬇️ ATTENTION : appel différé à sticky après injection réussie
        if (file.includes("header")) {
          activateStickyEffect();
        }
      })
      .catch(err => console.error("Erreur d'inclusion:", file, err));
  });
});
