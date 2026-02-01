document.addEventListener("DOMContentLoaded", async () => {
  const itemId = localStorage.getItem("selectedItemId");

  const imageElement = document.getElementById("displayed-image");
  const infoContainer = document.querySelector(".info-container");

  if (!itemId || !infoContainer) {
    infoContainer.innerHTML = "<p>No item selected.</p>";
    return;
  }

  try {
    const res = await fetch("/api/items");
    if (!res.ok) throw new Error("Failed to fetch items");

    const data = await res.json();
    const item = data.items.find((i) => i.id === itemId);

    if (!item) {
      infoContainer.innerHTML = "<p>Item not found.</p>";
      return;
    }

    if (imageElement) {
      imageElement.src = item.image || "";
      imageElement.alt = item.name || "Item image";
    }

    infoContainer.innerHTML = `
      <h1 class="item-header">${item.name}</h1>
      <p><strong>Category:</strong> ${item.category || "N/A"}</p>
      <p><strong>Color:</strong> ${item.color || "N/A"}</p>
      <p><strong>Description:</strong> ${item.description || "N/A"}</p>
      <p><strong>Location Found:</strong> ${item.locationFound || "N/A"}</p>
      <p><strong>Date Found:</strong> ${item.dateFound || "N/A"}</p>
      <button id="claimButton" class="claim-button">Claim Item</button>
    `;

    const claimBtn = document.getElementById("claimButton");

    claimBtn.addEventListener("click", () => {
      localStorage.setItem("selectedItemId", item.id);
      localStorage.setItem("selectedItemName", item.name);
      window.location.href = "claims.html";
    });
  } catch (err) {
    console.error("Failed to load item details:", err);
    infoContainer.innerHTML = "<p>Failed to load item details.</p>";
  }
});
