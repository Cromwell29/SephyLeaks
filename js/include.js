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

        // Réactivation sticky si nav détectée
        if (html.includes("main-nav")) {
          requestAnimationFrame(() => {
            const nav = document.querySelector(".main-nav");
            if (nav) {
              nav.style.position = "sticky";
              nav.style.top = "0";
              nav.style.zIndex = "1000";
            }
          });
        }
      })
      .catch(err => console.error("Erreur d'inclusion:", file, err));
  });
});
