document.addEventListener("DOMContentLoaded", () => {
  console.log("User dashboard loaded");

  loadTurnedInItems();

  fetch("/api/current-user")
    .then((res) => res.json())
    .then((user) => {
      if (!user) {
        window.location.href = "/Frontend/HTML/login.html";
        return;
      }

      document.getElementById("name").textContent = user.name;
      const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
      document.getElementById("avatar").textContent = initials;
      document.getElementById("homepage-dashboard").textContent =
        `${user.name}'s User Homepage`;

      const typeDisplay = document.getElementById("type");
      if (typeDisplay) typeDisplay.textContent = user.userType;

      // Load claims
      loadUserClaims(user.email, user.id);
    })
    .catch((err) => console.error("Error fetching current user:", err));

  function loadUserClaims(email, id) {
    const container = document.getElementById("claimsList");
    if (!container) return;

    const header = container.querySelector("h2");
    container.innerHTML = "";
    if (header) container.appendChild(header);

    fetch("/api/user/item-claims")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || data.claims.length === 0) {
          const emptyMsg = document.createElement("p");
          emptyMsg.textContent = "No claims submitted.";
          container.appendChild(emptyMsg);
          return;
        }

        const userClaims = data.claims.filter(
          (c) => c.studentEmail === email || String(c.studentID) === String(id),
        );

        userClaims.forEach((claim) => {
          const row = document.createElement("div");
          row.className = `sect ${
            claim.status ? claim.status.toLowerCase() : "pending"
          }`;

          row.innerHTML = `
    <span>${claim.itemName}</span>
    <span>${claim.status === "Approved" ? "Claimed" : claim.status}</span>
  `;

          // Add "×" button for approved claims
          if (claim.status === "Approved") {
            const closeBtn = document.createElement("button");
            closeBtn.textContent = "×";
            closeBtn.className = "close-btn";
            closeBtn.style.marginLeft = "10px";
            closeBtn.style.background = "transparent";
            closeBtn.style.border = "none";
            closeBtn.style.cursor = "pointer";
            closeBtn.style.fontWeight = "bold";
            closeBtn.style.fontSize = "1.2rem";

            closeBtn.addEventListener("click", async () => {
              try {
                const res = await fetch(
                  `/api/item-claims/${claim.itemID}/${encodeURIComponent(
                    claim.studentEmail,
                  )}`,
                  { method: "DELETE" },
                );
                const result = await res.json();
                if (result.success) {
                  row.remove();
                } else {
                  alert("Failed to remove claim: " + result.error);
                }
              } catch (err) {
                console.error(err);
                alert("Error removing claim.");
              }
            });

            row.appendChild(closeBtn);
          }

          container.appendChild(row);
        });
      })
      .catch((err) => console.error("Failed to load claims:", err));
  }
});

function loadTurnedInItems() {
  const container = document.getElementById("turnedInList");
  if (!container) return;

  const header = container.querySelector("h2");
  container.innerHTML = "";
  if (header) container.appendChild(header);

  fetch("/api/user/turned-in-items")
    .then((res) => res.json())
    .then((data) => {
      if (!data.success || data.reports.length === 0) {
        container.appendChild(document.createElement("p")).textContent =
          "No turned-in items yet.";
        return;
      }

      data.reports.forEach((report) => {
        const row = document.createElement("div");
        row.className = `sect ${report.status.toLowerCase()}`;
        row.innerHTML = `
          <span>${report.itemName || report.name}</span>
          <span>${report.status}</span>
        `;

        // Add "×" only for Claimed reports
        if (report.status === "Claimed") {
          const closeBtn = document.createElement("button");
          closeBtn.textContent = "×";
          closeBtn.className = "close-btn";
          closeBtn.style.marginLeft = "10px";
          closeBtn.style.background = "transparent";
          closeBtn.style.border = "none";
          closeBtn.style.cursor = "pointer";
          closeBtn.style.fontWeight = "bold";
          closeBtn.style.fontSize = "1.2rem";

          closeBtn.addEventListener("click", async () => {
            try {
              const res = await fetch(`/api/claimed-items/${report.id}`, {
                method: "DELETE",
              });
              const result = await res.json();
              if (result.success) row.remove();
              else alert("Failed to remove turned-in item");
            } catch (err) {
              console.error(err);
              alert("Error removing item");
            }
          });

          row.appendChild(closeBtn);
        }

        container.appendChild(row);
      });
    })
    .catch((err) => console.error("Failed to load turned-in items:", err));
}

function loadContactResponses() {
  const container = document.getElementById("responsesList");
  if (!container) return;

  const header = container.querySelector("h2");
  container.innerHTML = "";
  if (header) container.appendChild(header);

  fetch("/api/user/contact-responses")
    .then((res) => res.json())
    .then((data) => {
      if (!data.success || data.responses.length === 0) {
        container.appendChild(document.createElement("p")).textContent =
          "No responses yet.";
        return;
      }

      data.responses.forEach((resp) => {
        const row = document.createElement("div");
        row.className = "sect response";

        row.innerHTML = `
          <span>
            Question: ${resp.message}<br /><br />
            Answer: ${resp.response || "(No answer yet)"}
          </span>
        `;

        // Add delete button
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "×";
        closeBtn.className = "close-btn";
        closeBtn.style.marginLeft = "10px";
        closeBtn.style.background = "transparent";
        closeBtn.style.border = "none";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.fontWeight = "bold";
        closeBtn.style.fontSize = "1.2rem";

        closeBtn.addEventListener("click", async () => {
          try {
            const res = await fetch(
              `/api/contact-responses/${encodeURIComponent(
                resp.email,
              )}/${encodeURIComponent(resp.subject)}`,
              { method: "DELETE" },
            );
            const result = await res.json();
            if (result.success) row.remove();
            else alert("Failed to remove response");
          } catch (err) {
            console.error(err);
            alert("Error removing response");
          }
        });

        row.appendChild(closeBtn);
        container.appendChild(row);
      });
    })
    .catch((err) => console.error("Failed to load contact responses:", err));
}

fetch("/api/user/credits")
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      document.getElementById("creditCount").textContent = data.credits;
    }
  });

// Add this to your existing user-homepage.js

let currentUserCredits = 0;
let currentUserEmail = "";
let currentUserID = "";

// Update the existing fetch for current user
fetch("/api/current-user")
  .then((res) => res.json())
  .then((user) => {
    if (!user) {
      window.location.href = "/Frontend/HTML/login.html";
      return;
    }

    currentUserEmail = user.email;
    currentUserID = user.id;

    document.getElementById("name").textContent = user.name;
    const initials = user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    document.getElementById("avatar").textContent = initials;
    document.getElementById("homepage-dashboard").textContent =
      `${user.name}'s User Homepage`;

    const typeDisplay = document.getElementById("type");
    if (typeDisplay) typeDisplay.textContent = user.userType;

    loadUserClaims(user.email, user.id);
  })
  .catch((err) => console.error("Error fetching current user:", err));

// Update credits fetch
fetch("/api/user/credits")
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      currentUserCredits = data.credits;
      document.getElementById("creditCount").textContent = data.credits;
      updateShopAffordability();
    }
  });

// Shop functionality
const shopItems = [
  { name: "Candy", cost: 30, key: "candy" },
  { name: "Event Tickets", cost: 60, key: "tickets" },
  { name: "$15 Gift Card", cost: 100, key: "cards" },
];

function updateShopAffordability() {
  const pointValues = document.querySelectorAll(".point-values");
  pointValues.forEach((element, index) => {
    const cost = shopItems[index].cost;
    element.classList.remove("affordable", "unaffordable");
    if (currentUserCredits >= cost) {
      element.classList.add("affordable");
    } else {
      element.classList.add("unaffordable");
    }
  });
}

// Add click listeners to shop items
document.addEventListener("DOMContentLoaded", () => {
  const shopOptions = document.querySelectorAll(".shop-option");
  const modal = document.getElementById("purchaseModal");
  const confirmBtn = document.getElementById("confirmBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  let selectedItem = null;

  shopOptions.forEach((option, index) => {
    option.addEventListener("click", () => {
      selectedItem = shopItems[index];
      showPurchaseModal(selectedItem);
    });
  });

  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
    selectedItem = null;
  });

  confirmBtn.addEventListener("click", () => {
    if (selectedItem) {
      processPurchase(selectedItem);
    }
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      selectedItem = null;
    }
  });
});

function showPurchaseModal(item) {
  const modal = document.getElementById("purchaseModal");
  const itemNameSpan = document.getElementById("itemName");
  const itemCostSpan = document.getElementById("itemCost");
  const confirmBtn = document.getElementById("confirmBtn");

  itemNameSpan.textContent = item.name;
  itemCostSpan.textContent = item.cost;

  // Disable confirm button if not affordable
  if (currentUserCredits < item.cost) {
    confirmBtn.disabled = true;
    confirmBtn.style.opacity = "0.5";
    confirmBtn.style.cursor = "not-allowed";
  } else {
    confirmBtn.disabled = false;
    confirmBtn.style.opacity = "1";
    confirmBtn.style.cursor = "pointer";
  }

  modal.style.display = "block";
}

function processPurchase(item) {
  if (currentUserCredits < item.cost) {
    alert("Insufficient credits!");
    return;
  }

  // Deduct credits
  fetch("/api/user/purchase", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      itemKey: item.key,
      cost: item.cost,
      email: currentUserEmail,
      id: currentUserID,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        currentUserCredits = data.newCredits;
        document.getElementById("creditCount").textContent = currentUserCredits;
        updateShopAffordability();

        // Show success message
        const modal = document.getElementById("purchaseModal");
        const modalContent = modal.querySelector(".modal-content");
        const confirmBtn = document.getElementById("confirmBtn");
        const cancelBtn = document.getElementById("cancelBtn");

        // Hide buttons
        confirmBtn.style.display = "none";
        cancelBtn.style.display = "none";

        // Add success message
        const successMsg = document.createElement("p");
        successMsg.id = "successMessage";
        successMsg.textContent = "Item purchased! See room 2207 for item.";
        successMsg.style.color = "#4CAF50";
        successMsg.style.fontWeight = "bold";
        successMsg.style.marginTop = "20px";
        successMsg.style.fontSize = "1.1rem";
        modalContent.appendChild(successMsg);

        // Close modal after 4 seconds
        setTimeout(() => {
          modal.style.display = "none";

          // Reset modal for next use
          confirmBtn.style.display = "inline-block";
          cancelBtn.style.display = "inline-block";
          successMsg.remove();
        }, 4000);
      } else {
        alert("Purchase failed: " + data.error);
        document.getElementById("purchaseModal").style.display = "none";
      }
    })
    .catch((err) => {
      console.error("Purchase error:", err);
      alert("Error processing purchase");
      document.getElementById("purchaseModal").style.display = "none";
    });
}

// Call it on DOMContentLoaded
loadContactResponses();
