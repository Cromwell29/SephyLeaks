import { supabase } from './supabaseClient.js'; // adapte le chemin si besoin

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("articles-container");
  const filtersContainer = document.getElementById("filters");
  const featured = document.getElementById("featured-article");
  const latestList = document.getElementById("latest-list");
  const uniqueTags = new Set();

  if (!container) {
    console.error("❌ Pas de conteneur #articles-container trouvé !");
    return;
  }

  // 📦 1. Charger les articles depuis Supabase
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, titre, date, image, tag, resume")
    .order("date", { ascending: false });

  if (error) {
    console.error("❌ Erreur Supabase :", error.message);
    return;
  }

  if (!articles.length) {
    container.innerHTML = "<p>Aucun article disponible pour le moment.</p>";
    return;
  }

  // 📰 2. À la une = premier article
  const featuredArticle = articles[0];

  if (featured && featuredArticle) {
    featured.innerHTML = `
      <a href="article.html?id=${featuredArticle.id}" class="featured-card">
        <img src="${featuredArticle.image}" alt="${featuredArticle.titre}" class="featured-image">
        <div class="featured-info">
          <div class="featured-meta">${formatDate(featuredArticle.date)} – ${featuredArticle.tag}</div>
          <h2>${featuredArticle.titre}</h2>
        </div>
      </a>
    `;
  }

  // 🗂️ 3. Articles restants = cartes
  const remainingArticles = articles.slice(1); // on saute le "à la une"
  remainingArticles.slice(0, 10).forEach(article => {
    const tag = article.tag.trim().toLowerCase();
    uniqueTags.add(tag);

    const section = document.createElement("section");
    section.classList.add("article", "article-card");
    section.setAttribute("data-tag", tag);

    section.innerHTML = `
      <div class="card-image">
        <img src="${article.image}" alt="${article.titre}" />
      </div>
      <div class="card-content">
        <div class="tag">${article.tag}</div>
        <h2>${article.titre}</h2>
        <p>${article.resume}</p>
        <div class="date">${formatDate(article.date)}</div>
        <a href="article.html?id=${article.id}" class="read-more" title="${article.titre}">→ Lire l’article</a>
      </div>
    `;

    container.appendChild(section);
  });

  // 📋 4. "Derniers articles" (titre + date, max 4)
  if (latestList) {
    articles.slice(1, 5).forEach(article => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="article.html?id=${article.id}">${article.titre}</a> <span style="font-size:0.85rem; color:#aaa;">(${formatDate(article.date)})</span>`;
      latestList.appendChild(li);
    });
  }

  // 🧩 5. Filtres par tag
  const formatLabel = tag => {
    if (tag.toLowerCase() === "make a gils") return "Make a Gil$";
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  };

  const createButton = (label, isActive = false) => {
    const btn = document.createElement("button");
    btn.textContent = formatLabel(label);
    btn.dataset.filter = label.toLowerCase();
    btn.className = "filter-btn";
    if (isActive) btn.classList.add("active");
    filtersContainer.appendChild(btn);
  };

  createButton("Tous", true);
  [...uniqueTags].forEach(tag => createButton(tag));

  document.querySelectorAll(".article").forEach(article => {
    article.style.display = "block";
  });

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelector(".filter-btn.active")?.classList.remove("active");
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      document.querySelectorAll(".article").forEach(article => {
        const tag = article.dataset.tag;
        article.style.display = (filter === "tous" || tag === filter) ? "block" : "none";
      });
    });
  });
});

// 🔧 Fonction utilitaire : formatage de date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
