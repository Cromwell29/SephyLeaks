import { supabase } from "../supabaseClient.js";

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
    .select("email, pseudo, role")
    .eq("id", userId)
    .single();

  if (userError || !users) {
    info.innerHTML = "<p>❌ Impossible de récupérer les infos utilisateur.</p>";
    logoutBtn.style.display = "none";
    return;
  }

  const { email, pseudo, role } = users;

  // ✅ Affichage infos
  info.innerHTML = `
    <p><strong>Pseudo :</strong> ${pseudo}</p>
    <p><strong>Email :</strong> ${email}</p>
    <p><strong>Rôle :</strong> ${role}</p>
    ${role === "admin" ? `<a href="/SephyLeaks/admin.html" class="admin-link">🛠️ Accéder au panneau admin</a>` : ""}
  `;

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
