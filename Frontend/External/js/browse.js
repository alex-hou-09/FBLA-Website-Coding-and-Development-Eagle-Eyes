document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".grid-container");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortFilter = document.getElementById("sortFilter");
  let allItems = [];
  try {
    const res = await fetch("/api/items");
    const data = await res.json();
    if (!data.items || !container) return;
    allItems = data.items;
    const renderItems = (items) => {
      container.innerHTML = "";
      if (items.length === 0) {
        container.innerHTML = `
      <div class="no-items">
        <p>No items found.</p>
        <p>Try a different search or category.</p>
      </div>
  `;
        return;
      }
      items.forEach((item) => {
        const card = document.createElement("a");
        card.href = "details.html";
        card.className = "item-card";
        card.dataset.id = item.id;
        card.innerHTML = `
          <div class="image-wrapper">
            <img class="browse-image" src="${item.image}" alt="${item.name}" />
          </div>
          <h3>${item.name}</h3>
          <p>Found: ${item.dateFound}</p>
        `;
        card.addEventListener("click", (e) => {
          e.preventDefault();
          localStorage.setItem("selectedItemId", item.id);
          localStorage.setItem("selectedItemImage", item.image);
          window.location.href = "details.html";
        });
        container.appendChild(card);
      });
    };
    renderItems(allItems);
    const filterItems = () => {
      const query = searchInput.value.toLowerCase();
      const selectedCategory = categoryFilter.value;
      const selectedSort = sortFilter.value;
      let filtered = allItems.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(query);
        const matchesCategory =
          selectedCategory === "all" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });
      filtered.sort((a, b) => {
        const dateA = new Date(a.dateFound);
        const dateB = new Date(b.dateFound);
        return selectedSort === "newest" ? dateB - dateA : dateA - dateB;
      });
      renderItems(filtered);
    };
    searchInput.addEventListener("input", filterItems);
    categoryFilter.addEventListener("change", filterItems);
    sortFilter.addEventListener("change", filterItems);
    filterItems();
  } catch (err) {
    console.error("Failed to load items:", err);
    container.innerHTML = "<p>Failed to load items.</p>";
  }
});
