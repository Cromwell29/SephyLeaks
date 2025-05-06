import { supabase } from '/SephyLeaks/js/supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const articleId = new URLSearchParams(window.location.search).get('id');
  const commentSection = document.querySelector('#comments');

  if (!articleId || !commentSection) return;

  // 🔄 Nettoyer les anciens commentaires fictifs
  commentSection.querySelectorAll('.comment').forEach(el => el.remove());

  // 🔎 Récupérer les commentaires
  const { data: commentaires, error } = await supabase
    .from('commentaires')
    .select('id, contenu, created_at, auteur_id, users ( pseudo, avatar_url )')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erreur chargement commentaires :', error.message);
    commentSection.innerHTML += `<p>❌ Impossible de charger les commentaires.</p>`;
    return;
  }

function appendComment({ id, auteur, avatar, date, contenu, isOwner }, insertBefore = null) {
  const div = document.createElement('div');
  div.className = 'comment';
  div.dataset.id = id;

  div.innerHTML = `
    <img src="${avatar}" alt="avatar joueur" class="comment-avatar">
    <div class="comment-body">
      <div class="comment-meta">
        <span class="comment-author">${auteur}</span>
        <span class="comment-date">${date}</span>
      </div>
      <p class="comment-content">${contenu}</p>
      ${isOwner ? `
        <div class="comment-actions">
          <button class="edit-comment">✏️</button>
          <button class="delete-comment">🗑️</button>
        </div>` : ``}
    </div>
  `;

  const parent = document.querySelector('#comments');
  const target = insertBefore || document.querySelector('.comment-form');
  parent.insertBefore(div, target);

  // ✏️ Modifier
  if (isOwner) {
    const editBtn = div.querySelector('.edit-comment');
    const deleteBtn = div.querySelector('.delete-comment');
    const contentEl = div.querySelector('.comment-content');

    editBtn.addEventListener('click', () => {
      const current = contentEl.textContent;
      contentEl.outerHTML = `
        <textarea class="edit-area">${current}</textarea>
        <button class="save-edit">💾</button>
      `;
      const saveBtn = div.querySelector('.save-edit');
      const textarea = div.querySelector('.edit-area');

      saveBtn.addEventListener('click', async () => {
        const newContent = textarea.value.trim();
        if (!newContent) return;

        const { error } = await supabase
          .from('commentaires')
          .update({ contenu: newContent })
          .eq('id', id);

        if (!error) {
          textarea.outerHTML = `<p class="comment-content">${newContent}</p>`;
          saveBtn.remove();
        } else {
          alert("❌ Échec de la modification.");
        }
      });
    });

    // 🗑️ Supprimer
    deleteBtn.addEventListener('click', async () => {
      if (!confirm("Supprimer ce commentaire ?")) return;
      const { error } = await supabase.from('commentaires').delete().eq('id', id);
      if (!error) {
        div.remove();
      } else {
        alert("❌ Échec de la suppression.");
      }
    });
  }
}


  if (commentaires.length === 0) {
    commentSection.innerHTML += `<p>Aucun commentaire pour le moment.</p>`;
  } else {
commentaires.forEach(c => {
  appendComment({
    id: c.id,
    auteur: c.users?.pseudo || 'Utilisateur inconnu',
    avatar: c.users?.avatar_url || '/SephyLeaks/assets/default-avatar.webp',
    date: new Date(c.created_at).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    }),
    contenu: c.contenu,
    isOwner: session?.user?.id === c.auteur_id // ← comparaison sécurisée
  });
});

  }


  // 🧾 Formulaire si connecté
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  const commentForm = document.querySelector('.comment-form');

  if (session && session.user && commentForm) {
    commentForm.classList.remove('disabled');
    commentForm.innerHTML = `
      <textarea id="comment-input" placeholder="Votre commentaire..."></textarea>
      <button id="submit-comment">Envoyer</button>
    `;

    const input = document.getElementById('comment-input');
    const submitBtn = document.getElementById('submit-comment');

    input.addEventListener("input", () => {
      submitBtn.disabled = input.value.trim().length === 0;
    });
    submitBtn.disabled = true;

    submitBtn.addEventListener('click', async () => {
      const contenu = input.value.trim();
      if (!contenu) return;

      const { error: insertError } = await supabase.from('commentaires').insert({
        contenu,
        article_id: articleId,
        auteur_id: session.user.id
      });

      console.log("💬 Tentative d'insertion :", {
        contenu,
        article_id: articleId,
        auteur_id: session.user.id
      });

      if (insertError) {
        console.error("❌ Erreur d'insertion commentaire :", insertError);
        alert("❌ Échec de l'envoi du commentaire.");
      } else {
appendComment({
  id: data[0].id, // récupéré depuis supabase.insert
  auteur: session.user.user_metadata?.pseudo || 'Vous',
  avatar: session.user.user_metadata?.avatar_url || '/SephyLeaks/assets/default-avatar.webp',
  date: new Date().toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  }),
  contenu,
  isOwner: true
}, commentForm);


        input.value = "";
        submitBtn.disabled = true;
      }
    });
  }
}); // ✅ fermeture du addEventListener
