document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query) {
          // Redirige vers listing.html en passant la recherche en paramètre "q"
          window.location.href = `listing.html?q=${encodeURIComponent(query)}`;
        }
      }
    });
  }
});
