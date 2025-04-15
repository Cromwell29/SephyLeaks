document.addEventListener("DOMContentLoaded", () => {
  const targets = document.querySelectorAll('[data-include]');

  targets.forEach(el => {
    const file = el.getAttribute("data-include");
    fetch(file)
      .then(res => res.text())
      .then(html => {
        el.innerHTML = html;
      })
      .catch(err => console.error("Erreur d'inclusion:", file, err));
  });
});
