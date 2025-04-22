document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("article-container");

  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");

  if (!articleId) {
    container.innerHTML = "<p>❌ Aucun identifiant d’article fourni.</p>";
    return;
  }

  let article = null; // 👈 Accessible partout

  fetch("data/articles.json")
    .then(res => res.json())
    .then(articles => {
      article = articles.find(a => a.id === articleId);

      if (!article) {
        container.innerHTML = "<p>❌ Article introuvable.</p>";
        return;
      }

	// ✅ Injecter l'article
const bannerUrl = article.banner || article.image;
const banner = bannerUrl
  ? `<div class="article-banner">
       <div class="banner-label">🖼️ Illustration principale</div>
       <img src="${bannerUrl}" alt="Bannière de l'article">
     </div>`
  : "";



	container.innerHTML = `
	  <article class="article-page-wrapper">
		<div class="article-cover" style="background-image: url('${bannerUrl}');"></div>
		<div class="article-meta">
		  <span class="tag-badge">${article.tag}</span>
		  <span class="date">${article.date}</span>
		</div>
		<h1 class="article-title">${article.title}</h1>
		${banner}
		<div class="article-content"></div>
	  </article>
	`;


      document.querySelector(".article-content").innerHTML = article.content;

      // === Charger l'auteur une fois qu'on a l'article ===
      return fetch("data/authors.json");
    })
    .then(res => res.json())
    .then(authors => {
      if (!article) return; // sécurité au cas où

      const authorData = authors.find(a => a.id === article.author);
      if (!authorData) return;

      const authorBlock = document.createElement("div");
      authorBlock.className = "article-author";
      authorBlock.innerHTML = `
        <img src="${authorData.avatar}" alt="${authorData.name}" class="author-avatar">
        <div class="author-info">
          <h3>${authorData.name}</h3>
          <p>${authorData.bio}</p>
          ${authorData.website ? `<a href="${authorData.website}" target="_blank">🌐 Voir le profil</a>` : ""}
        </div>
      `;

      container.appendChild(authorBlock);
    })
    .catch(err => {
      container.innerHTML = "<p>❌ Erreur de chargement de l’article ou de l’auteur.</p>";
      console.error(err);
    });
window.nextSlide = function(button) {
  const container = button.closest(".carousel-buttons").previousElementSibling;
  if (!container || !container.classList.contains("carousel")) return;

  const track = container.querySelector(".carousel-track");
  track.appendChild(track.firstElementChild);
};

window.prevSlide = function(button) {
  const container = button.closest(".carousel-buttons").previousElementSibling;
  if (!container || !container.classList.contains("carousel")) return;

  const track = container.querySelector(".carousel-track");
  track.insertBefore(track.lastElementChild, track.firstElementChild);
};


  // === Articles récents dans la sidebar ===
  fetch("data/articles.json")
    .then(res => res.json())
    .then(articles => {
      const recentContainer = document.getElementById("recent-articles-list");
      if (!recentContainer) return;

      const sorted = [...articles].sort((a, b) => new Date(b.date) - new Date(a.date));
      sorted.slice(0, 3).forEach(article => {
        const li = document.createElement("li");
        li.innerHTML = `
          <a href="article.html?id=${article.id}" title="${article.title}">
            <img src="${article.image}" alt="${article.title}" style="width:60px; height:60px; object-fit:cover; border-radius:4px; margin-right:0.5rem;">
            ${article.title}
          </a>
        `;
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.marginBottom = "0.5rem";
        recentContainer.appendChild(li);
      });
    })
    .catch(err => console.error("❌ Erreur lors du chargement des articles récents :", err));
});
