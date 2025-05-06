// admin.js
import { supabase } from '/SephyLeaks/js/supabaseClient.js';

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("propositions-container");

	const { data: propositions, error } = await supabase
	.from("propositions")
	.select("id, titre, resume, image, contenu, date, author_id")
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
    `;

    container.appendChild(card);
  });

	  // Gestion de la validation
	  container.addEventListener("click", async (e) => {
		if (e.target.classList.contains("validate-btn")) {
		  const id = e.target.dataset.id;
	const prop = propositions.find((p) => p.id == id);

	if (!prop.author_id) {
	  alert("❌ Cette proposition n'a pas d'auteur valide.");
	  return;
	}

	// 1. Copier dans la table articles
	const { error: insertError } = await supabase.from("articles").insert({
	  titre: prop.titre,
	  resume: prop.resume,
	  contenu: prop.contenu,
	  image: prop.image,
	  date: prop.date,
	  author_id: prop.author_id
	});

if (insertError) {
  console.error("Erreur Supabase :", insertError);
  alert("❌ Erreur lors de la validation.");
  return;
}



      // 2. Supprimer de propositions
      const { error: deleteError } = await supabase
        .from("propositions")
        .delete()
        .eq("id", id);

      if (!deleteError) {
        e.target.closest(".proposition-card").remove();
      }
    }
  });
});
