// admin.js
import { supabase } from '/SephyLeaks/js/supabaseClient.js';

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("propositions-container");

const { data: propositions, error } = await supabase
  .from("propositions")
  .select("id, titre, resume, image, contenu, date, author_id, tag")
  .eq("status", "en attente") // 🆕 On filtre
  .order("date", { ascending: false });


  if (error || !propositions || propositions.length === 0) {
    container.innerHTML = "<p>Aucune proposition en attente.</p>";
    return;
  }

  container.innerHTML = "";
  propositions.forEach((prop) => {
    const card = document.createElement("div");
    card.className = "proposition-card";
    card.innerHTML = `
      <h3>${prop.titre || "Sans titre"}</h3>
      <p><strong>Résumé :</strong> ${prop.resume || "Non fourni."}</p>
      ${prop.image ? `<img src="${prop.image}" style="max-width:100%; border-radius:6px; margin:0.5rem 0">` : ""}
      <button data-id="${prop.id}" class="validate-btn">✅ Valider</button>
	  <button class="reject-btn" data-id="${prop.id}" data-author="${prop.author_id}">❌ Refuser</button>

    `;

    container.appendChild(card);
  });

	  // Gestion de la validation
container.addEventListener("click", async (e) => {
  // ✅ Validation
  if (e.target.classList.contains("validate-btn")) {
    const id = e.target.dataset.id;
    const prop = propositions.find((p) => p.id == id);

    if (!prop.author_id) {
      alert("❌ Cette proposition n'a pas d'auteur valide.");
      return;
    }

    const { error: insertError } = await supabase.from("articles").insert({
      titre: prop.titre,
      resume: prop.resume,
      contenu: prop.contenu,
      image: prop.image,
      date: prop.date,
      author_id: prop.author_id,
      tag: prop.tag
    });

    if (insertError) {
      console.error("Erreur Supabase :", insertError);
      alert("❌ Erreur lors de la validation.");
      return;
    }

    const { error: deleteError } = await supabase
      .from("propositions")
      .delete()
      .eq("id", id);

    if (!deleteError) {
      e.target.closest(".proposition-card").remove();
    }
  }

  // ❌ Refus
  if (e.target.classList.contains("reject-btn")) {
    currentRejectId = e.target.dataset.id;
    currentRejectAuthor = e.target.dataset.author;
    document.getElementById("reject-modal").classList.remove("hidden");
  }
});

let currentRejectId = null;
let currentRejectAuthor = null;

document.getElementById("cancel-reject").addEventListener("click", () => {
  document.getElementById("reject-modal").classList.add("hidden");
  currentRejectId = null;
  currentRejectAuthor = null;
});

document.getElementById("confirm-reject").addEventListener("click", async () => {
  const reason = document.getElementById("reject-reason").value.trim();
  if (!reason || !currentRejectId || !currentRejectAuthor) return;

  // 1. Créer une notification
  const { error: notifError } = await supabase.from("notifications").insert({
    user_id: currentRejectAuthor,
    type: "refus",
    contenu: reason,
    article_id: currentRejectId
  });

  // 2. Marquer la proposition comme refusée
  const { error: updateError } = await supabase
    .from("propositions")
    .update({ status: "refusee" })
    .eq("id", currentRejectId);

  if (!notifError && !updateError) {
    document.querySelector(`[data-id='${currentRejectId}']`)?.closest(".proposition-card")?.remove();
    document.getElementById("reject-modal").classList.add("hidden");
    document.getElementById("reject-reason").value = "";
    currentRejectId = null;
    currentRejectAuthor = null;
  } else {
    alert("❌ Erreur lors du refus.");
  }
});


});
