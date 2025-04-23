document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("listing-container");
  if (!container) return console.error("❌ Conteneur #listing-container introuvable.");

  let articles = [];
  let currentTag = "tous";

  const searchInput = document.getElementById("search-input");
  const tagFiltersContainer = document.getElementById("tag-filters");

  const formatLabel = tag => tag === "make a gils" ? "Make a Gil$" : tag.charAt(0).toUpperCase() + tag.slice(1);

  const renderArticles = () => {
    const query = searchInput.value.trim().toLowerCase();
    container.innerHTML = "";
    let count = 0;

    articles.forEach(article => {
      const tag = article.tag.trim().toLowerCase();
      const title = article.title.toLowerCase();
      const resume = article.resume.toLowerCase();

      const matchTag = currentTag === "tous" || tag === currentTag;
      const matchSearch = title.includes(query) || resume.includes(query);

      if (matchTag && matchSearch) {
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
        count++;
      }
    });

    const countDisplay = document.getElementById("article-count");
    if (countDisplay) {
      countDisplay.textContent = count === 0
        ? "Aucun article trouvé."
        : `${count} article${count > 1 ? "s" : ""} trouvé${count > 1 ? "s" : ""}`;
    }
  };

  fetch("data/articles.json")
    .then(res => res.json())
    .then(data => {
      articles = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      const tags = new Set(articles.map(a => a.tag.trim().toLowerCase()));

      const createFilterButton = (tag, label, isActive = false) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.className = "filter-btn";
        if (isActive) btn.classList.add("active");
        btn.dataset.filter = tag;
        tagFiltersContainer.appendChild(btn);

        btn.addEventListener("click", () => {
          document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          currentTag = tag;
          renderArticles();
        });
      };

      createFilterButton("tous", "Tous", true);
      [...tags].forEach(tag => createFilterButton(tag, formatLabel(tag)));

      if (searchInput) {
        searchInput.addEventListener("input", () => {
          renderArticles();
        });
      }

      // Premier affichage
      renderArticles();
    })
    .catch(err => console.error("❌ Erreur de chargement des articles :", err));
});
