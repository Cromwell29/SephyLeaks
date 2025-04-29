import { supabase } from '/SephyLeaks/js/supabaseClient.js';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const messageBox = document.getElementById("login-message");
  const errorDisplay = document.getElementById("login-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorDisplay.textContent = "";
    messageBox.textContent = "";

    const email = form.elements["email"].value.trim().toLowerCase();
    const password = form.elements["password"].value;

    if (!email || !password) {
      errorDisplay.textContent = "Veuillez remplir tous les champs.";
      return;
    }

    // 🔐 Authentification Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      errorDisplay.textContent = `❌ ${error.message}`;
      return;
    }

    // 🎉 Succès
    messageBox.textContent = "✅ Connexion réussie ! Redirection...";
    messageBox.className = "login-success";

    setTimeout(() => {
      window.location.href = "/SephyLeaks/account/account.html";
    }, 1000);
  });
});
