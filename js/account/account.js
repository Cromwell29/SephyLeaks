import { supabase } from '/SephyLeaks/js/supabaseClient.js';

document.addEventListener("DOMContentLoaded", async () => {
  const info = document.getElementById("account-info");
  const logoutBtn = document.getElementById("logout-btn");
  const popup = document.getElementById("welcome-popup");
  const popupUser = document.getElementById("popup-user");

  // 🔐 Vérifier la session active
  const { data: sessionData, error } = await supabase.auth.getSession();
  const session = sessionData?.session;

  if (!session) {
    info.innerHTML = "<p>❌ Aucun utilisateur connecté.</p>";
    logoutBtn.style.display = "none";
    return;
  }

  const userId = session.user.id;

  // 🔎 Charger les infos utilisateur depuis la table "users"
  const { data: users, error: userError } = await supabase
    .from("users")
    .select("email,pseudo,role")
    .eq("id", userId)
    .single();

  if (userError || !users) {
    info.innerHTML = "<p>❌ Impossible de récupérer les infos utilisateur.</p>";
    logoutBtn.style.display = "none";
    return;
  }

  const { email, pseudo, role } = users;

  // ✅ Affichage infos
document.getElementById("user-pseudo").textContent = pseudo;
document.getElementById("user-email").textContent = email;
document.getElementById("user-role").textContent = role;
document.getElementById("user-bio").textContent = users.bio || "Aucune bio pour le moment.";

// lien admin (facultatif : dans une section conditionnelle)
const conditionalLinks = document.getElementById("conditional-links");
if (role === "admin") {
  conditionalLinks.innerHTML = `<a href="/SephyLeaks/admin.html" class="admin-link">🛠️ Panneau admin</a>`;
}


  // 🎉 Popup bienvenue
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
