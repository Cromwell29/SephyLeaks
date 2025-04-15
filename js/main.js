// === SephyLeaks - JS de base ===
document.addEventListener("DOMContentLoaded", () => {
  console.log("SephyLeaks ready.");

  const container = document.getElementById("articles-container");
  const filtersContainer = document.getElementById("filters");
  const uniqueTags = new Set();

  fetch("data/articles.json")
    .then(res => res.json())
    .then(articles => {
      // Créer les articles
      articles.forEach(article => {
        const tag = article.tag.trim().toLowerCase();

        const section = document.createElement("section");
        section.classList.add("article");
        section.setAttribute("data-tag", tag);

        section.innerHTML = `
          <div class="tag">${article.tag}</div>
          <h2>« ${article.title} »</h2>
          <p>${article.content}</p>
        `;
        container.appendChild(section);

        uniqueTags.add(tag);
      });

      // Générer les boutons
      const createButton = (label, isActive = false) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.dataset.filter = label.toLowerCase();
        btn.className = "filter-btn";
        if (isActive) btn.classList.add("active");
        filtersContainer.appendChild(btn);
      };

      // "Tous" en premier
      createButton("Tous", true);

      // Générer un bouton par tag (avec majuscules visibles)
      [...uniqueTags].forEach(tag => {
        const label = tag.split(" ")
                         .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                         .join(" ");
        createButton(label);
      });

      // Gestion du filtrage
      const buttons = document.querySelectorAll(".filter-btn");

      buttons.forEach(btn => {
        btn.addEventListener("click", () => {
          document.querySelector(".filter-btn.active")?.classList.remove("active");
          btn.classList.add("active");

          const filter = btn.dataset.filter;

          const articles = document.querySelectorAll(".article");
          articles.forEach(article => {
            const tag = article.dataset.tag;
            if (filter === "tous" || tag === filter) {
              article.style.display = "block";
            } else {
              article.style.display = "none";
            }
          });
        });
      });
    })
    .catch(err => {
      console.error("Erreur de chargement JSON :", err);
    });
});

