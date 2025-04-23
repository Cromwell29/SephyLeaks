// === Script pour listing.html ===
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const tagFilter = document.getElementById("tag-filter");
  const resultsContainer = document.getElementById("listing-container");

  // Fonction de tri par date descendante
  const sortByDate = (a, b) => new Date(b.date) - new Date(a.date);

  // Fonction d'injection des articles
  function renderArticles(articles) {
    resultsContainer.innerHTML = "";

    if (articles.length === 0) {
      resultsContainer.innerHTML = "<p>Aucun article trouvé.</p>";
      return;
    }

    articles.forEach(article => {
      const card = document.createElement("div");
      card.className = "article-card";
      card.innerHTML = `
        <div class="card-image" style="background-image: url('${article.image}');"></div>
        <div class="card-content">
          <div class="tag">${article.tag}</div>
          <h2>${article.title}</h2>
          <p>${article.resume}</p>
          <div class="date">${article.date}</div>
          <a href="article.html?id=${article.id}" class="read-more">Lire l'article</a>
        </div>
      `;
      resultsContainer.appendChild(card);
    });
  }

  // Chargement initial des articles
  fetch("data/articles.json")
    .then(res => res.json())
    .then(data => {
      const allTags = new Set(data.map(article => article.tag.toLowerCase()));
      const sorted = [...data].sort(sortByDate);

      // Injection des options de tag
      allTags.forEach(tag => {
        const opt = document.createElement("option");
        opt.value = tag;
        opt.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
        tagFilter.appendChild(opt);
      });

      renderArticles(sorted);

      // Événements de recherche/filtrage
      function applyFilters() {
        const keyword = searchInput.value.toLowerCase();
        const selectedTag = tagFilter.value;

        const filtered = sorted.filter(article => {
          const matchesTag = selectedTag === "" || article.tag.toLowerCase() === selectedTag;
          const matchesText = article.title.toLowerCase().includes(keyword);
          return matchesTag && matchesText;
        });

        renderArticles(filtered);
      }

      searchInput.addEventListener("input", applyFilters);
      tagFilter.addEventListener("change", applyFilters);
    })
    .catch(err => {
      resultsContainer.innerHTML = "<p>Erreur lors du chargement des articles.</p>";
      console.error(err);
    });
});
