document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("listing-container");
  if (!container) return console.error("❌ Conteneur #listing-container introuvable.");

  fetch("data/articles.json")
    .then(res => res.json())
    .then(articles => {
      articles.sort((a, b) => new Date(b.date) - new Date(a.date));
      const tags = new Set(articles.map(a => a.tag.trim().toLowerCase()));
      const tagFiltersContainer = document.getElementById("tag-filters");

      const formatLabel = tag => tag === "make a gils" ? "Make a Gil$" : tag.charAt(0).toUpperCase() + tag.slice(1);

      // Tous
      const allBtn = document.createElement("button");
      allBtn.textContent = "Tous";
      allBtn.className = "filter-btn active";
      allBtn.dataset.filter = "tous";
      tagFiltersContainer.appendChild(allBtn);

      allBtn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        allBtn.classList.add("active");
        document.querySelectorAll(".article-card").forEach(a => a.style.display = "block");
      });

      tags.forEach(tag => {
        const btn = document.createElement("button");
        btn.textContent = formatLabel(tag);
        btn.className = "filter-btn";
        btn.dataset.filter = tag;
        tagFiltersContainer.appendChild(btn);

        btn.addEventListener("click", () => {
          document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          document.querySelectorAll(".article-card").forEach(card => {
            const cardTag = card.dataset.tag;
            card.style.display = cardTag === tag ? "block" : "none";
          });
        });
      });

      // Injection articles
      articles.forEach(article => {
        const tag = article.tag.trim().toLowerCase();
        const section = document.createElement("section");
        section.classList.add("article-card");
        section.setAttribute("data-tag", tag);
        section.innerHTML = `
          <div class="card-image" style="background-image: url('${article.image}')"></div>
          <div class="card-content">
            <div class="tag">${article.tag}</div>
            <h2>${article.title}</h2>
            <p>${article.resume}</p>
            <div class="date">${article.date}</div>
            <a href="article.html?id=${article.id}" class="read-more">→ Lire l’article</a>
          </div>
        `;
        container.appendChild(section);
      });

      // 🔍 Recherche dynamique
      const searchInput = document.getElementById("search-input");
      if (searchInput) {
        searchInput.addEventListener("input", () => {
          const query = searchInput.value.trim().toLowerCase();
          document.querySelectorAll(".article-card").forEach(card => {
            const title = card.querySelector("h2").textContent.toLowerCase();
            const resume = card.querySelector("p").textContent.toLowerCase();
            const matches = title.includes(query) || resume.includes(query);
            card.style.display = matches ? "block" : "none";
          });
        });
      }
    })
    .catch(err => {
      console.error("❌ Erreur de chargement des articles :", err);
    });
});
