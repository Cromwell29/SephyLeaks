import { supabase } from '/SephyLeaks/js/supabaseClient.js';

document.addEventListener("DOMContentLoaded", async () => {
  const logoutBtn = document.getElementById("logout-btn");
  const popup = document.getElementById("welcome-popup");
  const popupUser = document.getElementById("popup-user");
  const editBtn = document.getElementById("edit-profile-btn");
  const editSection = document.getElementById("edit-form-section");
  const profileForm = document.getElementById("profile-form");
  const bioField = document.getElementById("edit-bio");
  const displayBio = document.getElementById("user-bio");
  const msg = document.getElementById("profile-msg");
  const conditionalLinks = document.getElementById("conditional-links");

  // 🔐 Vérifier la session active
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;

  if (!session) {
    document.body.innerHTML = "<p>❌ Aucun utilisateur connecté.</p>";
    return;
  }

  const userId = session.user.id;

  // 🔎 Charger les infos utilisateur
  const { data: users, error: userError } = await supabase
    .from("users")
    .select("email,pseudo,role,bio,avatar_url")
    .eq("id", userId)
    .single();

  if (userError || !users) {
    document.body.innerHTML = "<p>❌ Impossible de récupérer les infos utilisateur.</p>";
    return;
  }

  const { email, pseudo, role, bio, avatar_url } = users;


  // ✅ Remplir les champs
  document.getElementById("user-pseudo").textContent = pseudo;
  document.getElementById("user-email").textContent = email;
  document.getElementById("user-role").textContent = role;
  displayBio.textContent = bio || "Aucune bio pour le moment.";
  bioField.value = bio || "";

  if (role === "admin") {
    conditionalLinks.innerHTML = `<a href="/SephyLeaks/admin.html" class="admin-link">🛠️ Panneau admin</a>`;
  }
  
document.querySelectorAll('.tab-link').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-link').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

    const key = btn.dataset.tab;
    const targetTab = document.getElementById(`tab-${key}`);
    if (targetTab) targetTab.classList.remove('hidden');
  });
});
const avatar = document.getElementById("account-avatar");
avatar.src = users.avatar_url || "/SephyLeaks/assets/default-avatar.webp";


// et dans le formulaire :
document.getElementById("edit-avatar").value = users.avatar_url || "";

// 👉 Afficher le premier onglet (Profil) par défaut
document.getElementById("tab-profile").classList.remove("hidden");


const editOverlay = document.getElementById("edit-overlay");
const closeEdit = document.getElementById("close-edit");

// Quand on clique sur “Modifier mon profil”
editBtn.addEventListener("click", () => {
  editOverlay.classList.remove("hidden");
});

// Quand on clique sur ✖
closeEdit.addEventListener("click", () => {
  editOverlay.classList.add("hidden");
});


  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
	const newBio = bioField.value.trim();
	const newAvatarUrl = document.getElementById("edit-avatar").value.trim();

	const { error: updateError } = await supabase
	  .from("users")
	  .update({ 
		bio: newBio,
		avatar_url: newAvatarUrl
	  })
	  .eq("id", userId);

    if (updateError) {
      msg.textContent = "❌ Échec de la mise à jour.";
      msg.style.color = "crimson";
    } else {
      displayBio.textContent = newBio || "Aucune bio pour le moment.";
      msg.textContent = "✅ Bio mise à jour avec succès !";
      msg.style.color = "#7fffd4";
    }
  });
// 📄 Charger les propositions personnelles
const propList = document.getElementById("proposition-list");
if (propList) {
  const { data: propositions, error: propError } = await supabase
    .from("propositions")
    .select("id,titre,resume,date,image")
    .eq("author_id", userId)
    .order("date", { ascending: false });

  if (propError || !propositions || propositions.length === 0) {
    propList.innerHTML = "<p>Aucune proposition pour le moment.</p>";
  } else {
    propList.innerHTML = ""; // Clear
    propositions.forEach((prop) => {
      const card = document.createElement("div");
      card.className = "proposition-card";
      card.innerHTML = `
	    <img src="${prop.image || '/SephyLeaks/assets/placeholder.webp'}" alt="Image de l’article" style="width:100%; height:140px; object-fit:cover; border-radius:6px; margin-bottom:0.5rem;">
        <h4>${prop.titre || "Sans titre"}</h4>
        <p>${prop.resume || "Pas de résumé."}</p>
        <small>📅 ${prop.date || "Date inconnue"}</small>
        <button onclick="window.location.href='/SephyLeaks/editor.html?id=${prop.id}'">✏️ Modifier</button>
      `;
      propList.appendChild(card);
    });
  }
}

  // 🎉 Popup de bienvenue
  if (popup && popupUser) {
    popupUser.textContent = pseudo;
    popup.classList.remove("popup-hidden");
    popup.classList.add("popup-show");

    setTimeout(() => {
      popup.classList.remove("popup-show");
    }, 4000);
  }

  // 🔓 Déconnexion
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "/SephyLeaks/index.html";
  });
});
