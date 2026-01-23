document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".grid-container");

  try {
    const res = await fetch("/Data/lost-items.json"); // adjust path if needed
    if (!res.ok) throw new Error("Failed to load lost items");

    const data = await res.json();
    const items = data.lost;

    container.innerHTML = ""; // clear placeholder cards

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "item-card";

      // Check if image exists, otherwise show placeholder
      const imageHTML = item.image && item.image.trim() !== ""
        ? `<img class="browse-image" src="${item.image}" alt="${item.itemName}" />`
        : `<div class="no-image">No Image</div>`;

      card.innerHTML = `
        ${imageHTML}
        <h3>${item.itemName}</h3>
        <p>Last Seen: ${item.lastSeen}</p>
        <p>Color: ${item.color}</p>
        <p>Description: ${item.description}</p>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Failed to load lost items.</p>";
  }
});
