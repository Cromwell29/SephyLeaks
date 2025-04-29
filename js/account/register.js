import { supabase } from '../supabaseClient.js';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  const errorBox = document.getElementById("register-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";

    const email = form.elements["email"].value.trim().toLowerCase();
    const password = form.elements["password"].value;
    const confirm = form.elements["confirm-password"].value;
    const pseudo = form.elements["pseudo"]?.value?.trim();

    if (!email || !password || !confirm || !pseudo) {
      errorBox.textContent = "Veuillez remplir tous les champs.";
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      errorBox.textContent = "Adresse e-mail invalide.";
      return;
    }

    if (password.length < 6) {
      errorBox.textContent = "Le mot de passe doit contenir au moins 6 caractères.";
      return;
    }

    if (password !== confirm) {
      errorBox.textContent = "Les mots de passe ne correspondent pas.";
      return;
    }

    // Étape 1 : inscription via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      errorBox.textContent = `Erreur Supabase : ${error.message}`;
      return;
    }

    const user = data.user;
    if (!user) {
      errorBox.textContent = "Une erreur est survenue. Réessayez.";
      return;
    }

    // Étape 2 : enregistrement dans la table "users"
    const { error: dbError } = await supabase.from("users").insert([
      {
        id: user.id,
        email,
        pseudo,
        role: "membre",
        bio: ""
      }
    ]);

    if (dbError) {
      errorBox.textContent = `Erreur base de données : ${dbError.message}`;
      return;
    }

    // Redirection vers la page de compte
    window.location.href = "/SephyLeaks/account/account.html";
  });
});
