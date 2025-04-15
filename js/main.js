// === SephyLeaks - JS de base ===

document.addEventListener("DOMContentLoaded", () => {
  console.log("SephyLeaks ready.");

  const container = document.getElementById("articles-container");
  const filtersContainer = document.getElementById("filters");
  const uniqueTags = new Set(); // Pour stocker les tags uniques

  fetch("data/articles.json")
    .then(res => res.json())
    .then(articles => {
      // Générer les articles + récupérer les tags uniques
      articles.forEach(article => {
        const section = document.createElement("section");
        section.classList.add("article");
        section.setAttribute("data-tag", article.tag);

        section.innerHTML = `
          <div class="tag">${article.tag}</div>
          <h2>« ${article.title} »</h2>
          <p>${article.content}</p>
        `;
        container.appendChild(section);

        // Ajouter tag à l'ensemble
        uniqueTags.add(article.tag);
      });

// Créer les boutons
const createButton = (label, isActive = false) => {
  const btn = document.createElement("button");
  btn.textContent = label.charAt(0).toUpperCase() + label.slice(1); // Capitaliser pour affichage
  btn.dataset.filter = label.toLowerCase().trim(); // Filtrage basé sur version standardisée
  btn.className = "filter-btn";
  if (isActive) btn.classList.add("active");
  filtersContainer.appendChild(btn);
};

// Bouton "Tous"
createButton("tous", true);

// Boutons dynamiques depuis les tags
[...uniqueTags].forEach(tag => createButton(tag));


      // Gérer le clic sur les boutons
      const buttons = document.querySelectorAll(".filter-btn");
      buttons.forEach(btn => {
        btn.addEventListener("click", () => {
          document.querySelector(".filter-btn.active")?.classList.remove("active");
          btn.classList.add("active");

          const filter = btn.dataset.filter.toLowerCase().trim();
          const articles = document.querySelectorAll(".article");

          articles.forEach(article => {
            const tag = article.dataset.tag.toLowerCase().trim();
            article.style.display = (filter === "tous" || tag === filter) ? "block" : "none";
          });
        });
      });
    });
});

