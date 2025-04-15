    const inputs = ['title', 'tag', 'date', 'image', 'content'];

    inputs.forEach(id => {
      document.getElementById(id).addEventListener('input', updatePreview);
    });

    function updatePreview() {
      const title = document.getElementById('title').value;
      const tag = document.getElementById('tag').value;
      const date = document.getElementById('date').value;
      const image = document.getElementById('image').value;
      const content = document.getElementById('content').value;

      document.getElementById('preview-content').innerHTML = `
        <h1>${title || 'Titre de l\'article'}</h1>
        <div>
          <span class="tag-badge">${tag || 'TAG'}</span>
          <span class="date">${date || 'Date'}</span>
        </div>
        <div class="cover-image" style="background-image: url('${image || 'https://via.placeholder.com/800x200'}');"></div>
        ${content || '<p>Contenu de l\'article...</p>'}
      `;
    }
