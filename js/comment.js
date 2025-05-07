import { supabase } from '/SephyLeaks/js/supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const articleId = new URLSearchParams(window.location.search).get('id');
  const commentSection = document.querySelector('#comments');
  if (!articleId || !commentSection) return;

  // 🔐 Session utilisateur
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;

  // 🔄 Nettoyer les anciens commentaires
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

  // 💬 Fonction d'ajout visuel
  function appendComment({ id, auteur, avatar, date, contenu, isOwner }, insertBefore = null) {
    const div = document.createElement('div');
    div.className = 'comment';
    div.dataset.id = id;
	div.id = `comment-${id}`;

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

    if (isOwner) {
      const editBtn = div.querySelector('.edit-comment');
      const deleteBtn = div.querySelector('.delete-comment');
      const contentEl = div.querySelector('.comment-content');

      // ✏️ Modifier
      editBtn.addEventListener('click', () => {
        const current = contentEl.textContent;
        const editBox = document.createElement('div');
        editBox.className = 'edit-box';
        editBox.innerHTML = `
          <textarea class="edit-area">${current}</textarea>
          <button class="save-edit">💾 Enregistrer</button>
        `;
        contentEl.replaceWith(editBox);

        const saveBtn = editBox.querySelector('.save-edit');
        const textarea = editBox.querySelector('.edit-area');

        saveBtn.addEventListener('click', async () => {
          const newContent = textarea.value.trim();
          if (!newContent) return;

          const { error } = await supabase
            .from('commentaires')
            .update({ contenu: newContent })
            .eq('id', id);

          if (!error) {
            const newPara = document.createElement('p');
            newPara.className = 'comment-content';
            newPara.textContent = newContent;
            editBox.replaceWith(newPara);
          } else {
            alert("❌ Échec de la modification.");
          }
        });
      });

      // 🗑️ Supprimer avec popup custom
      deleteBtn.addEventListener('click', () => {
        showConfirmDialog("Supprimer ce commentaire ?", async () => {
          const { error } = await supabase.from('commentaires').delete().eq('id', id);
          if (!error) div.remove();
          else alert("❌ Échec de la suppression.");
        });
      });
    }
  } // <-- 🔴 FIN de appendComment !

  // 🖋️ Affichage des commentaires
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
        isOwner: session?.user?.id === c.auteur_id
      });
    });
  }

  // 💬 Boîte de dialogue personnalisée
  function showConfirmDialog(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'custom-dialog';
    overlay.innerHTML = `
      <div class="dialog-box">
        <p>${message}</p>
        <div class="dialog-buttons">
          <button class="cancel-btn">Annuler</button>
          <button class="confirm-btn">Supprimer</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.cancel-btn').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.confirm-btn').addEventListener('click', () => {
      overlay.remove();
      onConfirm();
    });
  }

  // 🧾 Formulaire si connecté
  const commentForm = document.querySelector('.comment-form');
  if (session?.user && commentForm) {
    commentForm.classList.remove('disabled');
    commentForm.innerHTML = `
      <textarea id="comment-input" placeholder="Votre commentaire..."></textarea>
      <button id="submit-comment" class="active-button" disabled>Envoyer</button>
    `;

    const input = document.getElementById('comment-input');
    const submitBtn = document.getElementById('submit-comment');

    input.addEventListener("input", () => {
      const isEmpty = input.value.trim().length === 0;
      submitBtn.disabled = isEmpty;

      if (isEmpty) {
        submitBtn.classList.remove("active-button");
      } else {
        submitBtn.classList.add("active-button");
      }
    });

    submitBtn.addEventListener('click', async () => {
      const contenu = input.value.trim();
      if (!contenu) return;

      const { data, error: insertError } = await supabase.from('commentaires').insert({
        contenu,
        article_id: articleId,
        auteur_id: session.user.id
      }).select();

      if (insertError) {
        console.error("❌ Erreur d'insertion commentaire :", insertError);
        alert("❌ Échec de l'envoi du commentaire.");
        return;
      }

      appendComment({
        id: data[0].id,
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
    });
  }
});
