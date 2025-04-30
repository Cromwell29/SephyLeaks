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
    .select("email,pseudo,role,bio")
    .eq("id", userId)
    .single();

  if (userError || !users) {
    document.body.innerHTML = "<p>❌ Impossible de récupérer les infos utilisateur.</p>";
    return;
  }

  const { email, pseudo, role, bio } = users;

  // ✅ Remplir les champs
  document.getElementById("user-pseudo").textContent = pseudo;
  document.getElementById("user-email").textContent = email;
  document.getElementById("user-role").textContent = role;
  displayBio.textContent = bio || "Aucune bio pour le moment.";
  bioField.value = bio || "";

  if (role === "admin") {
    conditionalLinks.innerHTML = `<a href="/SephyLeaks/admin.html" class="admin-link">🛠️ Panneau admin</a>`;
  }

  // 📝 Édition de la bio
  editBtn.addEventListener("click", () => {
    editSection.classList.toggle("hidden");
  });

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newBio = bioField.value.trim();

    const { error: updateError } = await supabase
      .from("users")
      .update({ bio: newBio })
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
