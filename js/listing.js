import { supabase } from '/SephyLeaks/js/supabaseClient.js';
document.addEventListener("DOMContentLoaded", async () => {

  const container = document.getElementById("listing-container");
  const tagFiltersContainer = document.getElementById("tag-filters");
  const searchInput = document.getElementById("search-input");
  const countDisplay = document.getElementById("article-count");
  const paginationContainer = document.getElementById("pagination-controls");

  if (!container) return console.error("❌ Conteneur #listing-container introuvable.");

  let articles = [];
  let currentTag = "tous";
  let currentPage = 1;
  const articlesPerPage = 9;

  const formatLabel = tag =>
    tag === "make a gils" ? "Make a Gil$" : tag.charAt(0).toUpperCase() + tag.slice(1);

  const renderPagination = totalArticles => {
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(totalArticles / articlesPerPage);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.className = "page-btn";
      btn.textContent = i;
      if (i === currentPage) btn.classList.add("active");
      btn.addEventListener("click", () => {
        currentPage = i;
        renderArticles();
      });
      paginationContainer.appendChild(btn);
    }
  };

  const renderArticles = () => {
    const query = searchInput.value.trim().toLowerCase();
    container.innerHTML = "";

    const filtered = articles.filter(a => {
      const tag = a.tag.trim().toLowerCase();
      const title = a.title.toLowerCase();
      const resume = a.resume.toLowerCase();
      const matchTag = currentTag === "tous" || tag === currentTag;
      const matchSearch = title.includes(query) || resume.includes(query);
      return matchTag && matchSearch;
    });

    const total = filtered.length;
    const start = (currentPage - 1) * articlesPerPage;
    const pageArticles = filtered.slice(start, start + articlesPerPage);

    pageArticles.forEach(article => {
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

    countDisplay.textContent = total === 0
      ? "Aucun article trouvé."
      : `${total} article${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}`;

    renderPagination(total);
  };

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
      currentPage = 1;
      renderArticles();
    });
  };

// 🔁 Chargement depuis Supabase
  const { data, error } = await supabase
    .from("articles")
    .select("id, titre, resume, image, publication_date, tag")
    .order("publication_date", { ascending: false });

  if (error) {
    console.error("❌ Erreur Supabase :", error);
    return;
  }

  articles = data;
  const tags = new Set(articles.map(a => (a.tag || "").trim().toLowerCase()));

  createFilterButton("tous", "Tous", true);
  [...tags].forEach(tag => createFilterButton(tag, formatLabel(tag)));

  searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderArticles();
  });

  renderArticles();
    })
});
