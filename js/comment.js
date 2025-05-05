import { supabase } from '/SephyLeaks/js/supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const articleId = new URLSearchParams(window.location.search).get('id');
  const commentSection = document.querySelector('#comments');

  if (!articleId || !commentSection) return;

  // 🔄 Nettoyer les anciens commentaires fictifs
  commentSection.querySelectorAll('.comment').forEach(el => el.remove());

  // 🔎 Récupérer les commentaires avec jointure vers users
  const { data: commentaires, error } = await supabase
    .from('commentaires')
    .select('contenu, created_at, users ( pseudo, avatar_url )')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erreur chargement commentaires :', error.message);
    commentSection.innerHTML += `<p>❌ Impossible de charger les commentaires.</p>`;
    return;
  }
  
	function appendComment({ auteur, avatar, date, contenu }, insertBefore = null) {
	  const div = document.createElement('div');
	  div.className = 'comment';
	  div.innerHTML = `
		<img src="${avatar}" alt="avatar joueur" class="comment-avatar">
		<div class="comment-body">
		  <div class="comment-meta">
			<span class="comment-author">${auteur}</span>
			<span class="comment-date">${date}</span>
		  </div>
		  <p>${contenu}</p>
		</div>
	  `;

	  const parent = document.querySelector('#comments');
	  const target = insertBefore || document.querySelector('.comment-form');
	  parent.insertBefore(div, target);
	}

  if (commentaires.length === 0) {
    commentSection.innerHTML += `<p>Aucun commentaire pour le moment.</p>`;
  } else {
	commentaires.forEach(c => {
	  appendComment({
		auteur: c.users?.pseudo || 'Utilisateur inconnu',
		avatar: c.users?.avatar_url || '/SephyLeaks/assets/default-avatar.webp',
		date: new Date(c.created_at).toLocaleDateString('fr-FR', {
		  year: 'numeric', month: 'long', day: 'numeric'
		}),
		contenu: c.contenu
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

    submitBtn.addEventListener('click', async () => {
      const contenu = input.value.trim();
      if (!contenu) return;

      const { error: insertError } = await supabase.from('commentaires').insert({
        contenu,
        article_id: articleId,
        auteur_id: session.user.id
      });

	if (insertError) {
	  alert("❌ Échec de l'envoi du commentaire.");
	} else {
	  input.value = "";

	appendComment({
	  auteur: session.user.user_metadata?.pseudo || 'Vous',
	  avatar: session.user.user_metadata?.avatar_url || '/SephyLeaks/assets/default-avatar.webp',
	  date: new Date().toLocaleDateString('fr-FR', {
		year: 'numeric', month: 'long', day: 'numeric'
	  }),
	  contenu
	}, commentForm);

	input.value = "";
	}
    });
  }
});
