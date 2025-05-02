import { supabase } from '/SephyLeaks/js/supabaseClient.js';

document.addEventListener("DOMContentLoaded", async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  if (!session) return;
  const userId = session.user.id;

 document.getElementById("my-articles-toggle").addEventListener("click", () => {
  const articles = document.getElementById("my-articles");
  const proposals = document.getElementById("my-proposals");
  articles.classList.toggle("hidden");
  proposals.classList.add("hidden"); // ferme l'autre
});

document.getElementById("my-proposals-toggle").addEventListener("click", () => {
  const articles = document.getElementById("my-articles");
  const proposals = document.getElementById("my-proposals");
  proposals.classList.toggle("hidden");
  articles.classList.add("hidden"); // ferme l'autre
});


  // Chargement des articles publiés
  const { data: articles } = await supabase
    .from("articles")
    .select("id,titre,image")
    .eq("author_id", userId);

  const track = document.getElementById("article-track");
  articles?.forEach(article => {
    const card = document.createElement("div");
    card.className = "article-card";
    card.innerHTML = `
      <img src="${article.image}" alt="cover">
      <p>${article.titre}</p>
    `;
    card.addEventListener("click", () => {
      window.location.href = `/SephyLeaks/editor.html?id=${article.id}`;
    });
    track.appendChild(card);
  });

  // Chargement des propositions
  const { data: proposals } = await supabase
    .from("propositions")
    .select("id,titre,image")
    .eq("author_id", userId);

  const proposalTrack = document.getElementById("proposal-track");
  proposals?.forEach(p => {
    const card = document.createElement("div");
    card.className = "article-card";
    card.innerHTML = `
      <img src="${p.image || '/SephyLeaks/assets/placeholder.webp'}" alt="cover">
      <p>${p.titre}</p>
    `;
    card.addEventListener("click", () => {
      window.location.href = `/SephyLeaks/editor.html?id=${p.id}`;
    });
    proposalTrack.appendChild(card);
  });
});