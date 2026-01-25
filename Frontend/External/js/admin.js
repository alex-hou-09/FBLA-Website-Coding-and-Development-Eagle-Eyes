let contactMessagesData = [];

document.addEventListener("DOMContentLoaded", () => {
  loadCurrentUser();
  loadItems();
  loadItemCount();
  loadPendingCounts();
  loadContactMessages();
  setupSidebarNavigation();
});

/* ============================
   UTILITY
============================ */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/* ============================
   CURRENT USER
============================ */
function loadCurrentUser() {
  fetch("/api/current-user")
    .then(res => res.json())
    .then(user => {
      if (!user) return;

      const avatar = document.querySelector(".profile .avatar");
      const nameEl = document.querySelector(".profile h3");

      if (avatar) {
        // Show initials (first letters of first and last name)
        const initials = user.name
          .split(" ")
          .map(n => n[0])
          .join("")
          .toUpperCase();
        avatar.textContent = initials;
      }

      if (nameEl) nameEl.textContent = user.name;
    })
    .catch(err => console.error("Failed to load current user:", err));
}

/* ============================
   ITEMS
============================ */
function loadItems() {
  const container = document.getElementById("itemsList");
  if (!container) return;

  fetch("/api/items")
    .then((res) => res.json())
    .then((data) => {
      container.innerHTML = "";
      data.items.forEach((item) => {
        const row = document.createElement("div");
        row.className = "row";
        row.innerHTML = `<span>${item.name} --- Found: ${item.dateFound} </span><button class="delete-btn">Delete</button>`;
        row.querySelector(".delete-btn").addEventListener("click", () => {
          fetch(`/api/items/${item.id}`, { method: "DELETE" })
            .then(loadItems)
            .catch((err) => console.error("Failed to delete item:", err));
        });
        container.appendChild(row);
      });
    })
    .catch((err) => console.error("Error loading items:", err));
}

function loadItemCount() {
  fetch("../../../Data/_item-information.json")
    .then((res) => res.json())
    .then((data) => setText("itemCount", data.items.length))
    .catch((err) => console.error("Error loading item count:", err));
}

function loadPendingCounts() {
  fetch("../../../Data/pending-base.json")
    .then((res) => res.json())
    .then((data) => {
      const pending = data.pending || [];
      setText(
        "pendingClaims",
        pending.filter((p) => p.typeOfSubmission === "item-claim").length
      );
      setText(
        "pendingFound",
        pending.filter((p) => p.typeOfSubmission === "found-report").length
      );
      setText(
        "pendingLost",
        pending.filter((p) => p.typeOfSubmission === "lost-report").length
      );
    })
    .catch((err) => console.error("Error loading pending submissions:", err));
}

/* ============================
   CONTACT MESSAGES
============================ */
function loadContactMessages() {
  fetch("../../../Data/waiting-contact.json")
    .then((res) => res.json())
    .then((data) => {
      contactMessagesData = Array.isArray(data.messages) ? data.messages : [];
      setText("contact-count", contactMessagesData.length);
      renderContactMessages();
    })
    .catch((err) => console.error("Failed to load contact messages:", err));
}

function renderContactMessages() {
  const container = document.getElementById("contactMessages");
  if (!container) return;
  container.innerHTML = "";

  if (!contactMessagesData.length) {
    container.innerHTML = `<p class="waiting">No messages waiting.</p>`;
    return; 
  }

  contactMessagesData.forEach((msg, index) => {
    const row = document.createElement("div");
    row.className = "row waiting";
    row.innerHTML = `
      <div class="message-text"><strong>${msg.subject}</strong><br>${msg.message}</div>
      <button class="reply-btn">Reply</button>
      <div class="reply-box hidden">
        <textarea placeholder="Type your response..."></textarea>
        <button class="send-btn">Send</button>
      </div>
    `;

    const replyBtn = row.querySelector(".reply-btn");
    const replyBox = row.querySelector(".reply-box");
    const sendBtn = row.querySelector(".send-btn");
    const textarea = row.querySelector("textarea");

    replyBtn.addEventListener("click", () => replyBox.classList.toggle("hidden"));

    sendBtn.addEventListener("click", () => {
      const responseText = textarea.value.trim();
      if (!responseText) return;

      fetch("/api/contact/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          response: responseText,
          answeredAt: new Date().toISOString(),
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Server error");
          return res.json();
        })
        .then(() => {
          contactMessagesData.splice(index, 1);
          setText("contact-count", contactMessagesData.length);
          renderContactMessages();
        })
        .catch((err) => {
          console.error(err);
          alert("Failed to send response.");
        });
    });

    container.appendChild(row);
  });
}

/* ============================
   CLAIMS
============================ */
function loadClaims() {
  fetch("../../../Data/pending-base.json")
    .then((res) => res.json())
    .then((data) => {
      const pending = Array.isArray(data.pending) ? data.pending : [];
      renderClaims("itemClaimsList", pending.filter((p) => p.typeOfSubmission === "item-claim"), "item-claim");
      renderClaims("foundReportsList", pending.filter((p) => p.typeOfSubmission === "found-report"), "found-report");
      renderClaims("lostReportsList", pending.filter((p) => p.typeOfSubmission === "lost-report"), "lost-report");
    })
    .catch((err) => console.error("Failed to load claims:", err));
}

function renderClaims(containerId, claims, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (!claims.length) {
    const textMap = {
      "item-claim": "No pending item claims.",
      "found-report": "No pending found reports.",
      "lost-report": "No pending lost reports."
    };
    container.innerHTML = `<p>${textMap[type]}</p>`;
    return;
  }

  claims.forEach((claim) => {
    const row = document.createElement("div");
    row.className = "row-new";

    let contentHtml = "";

    if (type === "item-claim") {
      contentHtml = `
        <strong>Item ID:</strong> ${claim.itemID}<br>
        <strong>Student:</strong> ${claim.studentEmail} (${claim.studentID})<br>
        <strong>Date Lost:</strong> ${claim.dateLost}<br>
        <strong>Unique Features:</strong> ${claim.uniqueFeatures || "None"}<br>
        <strong>Notes:</strong> ${claim.notes || "None"}
      `;
    } else if (type === "found-report") {
      contentHtml = `
        <strong>Item:</strong> ${claim.itemName}<br>
        <strong>Category:</strong> ${claim.category}<br>
        <strong>Color:</strong> ${claim.color}<br>
        <strong>Found At:</strong> ${claim.locationFound}<br>
        <strong>Date Found:</strong> ${claim.dateFound}<br>
        <strong>Description:</strong> ${claim.description}<br>
        <strong>Student:</strong> ${claim.studentEmail} (${claim.studentID})
      `;
    } else if (type === "lost-report") {
      contentHtml = `
        <strong>Item:</strong> ${claim.itemName}<br>
        <strong>Category:</strong> ${claim.category}<br>
        <strong>Color:</strong> ${claim.color}<br>
        <strong>Last Seen:</strong> ${claim.lastSeen}<br>
        <strong>Description:</strong> ${claim.description}<br>
        <strong>Student:</strong> ${claim.studentEmail} (${claim.studentID})
      `;
    }

    row.innerHTML = `
      <div class="claim-content">${contentHtml}</div>
      <div class="claim-buttons">
        <button class="approve-btn">Approve</button>
        <button class="deny-btn">Deny</button>
      </div>
    `;

    row.querySelector(".approve-btn").onclick = () => submitDecision({ ...claim, typeOfSubmission: type }, "approve");
    row.querySelector(".deny-btn").onclick = () => submitDecision({ ...claim, typeOfSubmission: type }, "deny");

    container.appendChild(row);
  });
}

function submitDecision(submission, decision) {
  fetch("/api/claims/decision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ submission, decision }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Decision failed");
      return res.json();
    })
    .then(() => loadClaims())
    .catch((err) => {
      console.error(err);
      alert("Failed to process decision");
    });
}

/* ============================
   PURCHASES
============================ */
function loadPurchases() {
  fetch("/api/purchases")
    .then((res) => res.json())
    .then((data) => {
      renderPurchases("candyPurchasesList", data.candy || [], "candy");
      renderPurchases("ticketsPurchasesList", data.tickets || [], "tickets");
      renderPurchases("cardsPurchasesList", data.cards || [], "cards");
    })
    .catch((err) => console.error("Failed to load purchases:", err));
}

function renderPurchases(containerId, purchases, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (!purchases.length) {
    const textMap = {
      "candy": "No candy purchases yet.",
      "tickets": "No raffle ticket purchases yet.",
      "cards": "No gift card purchases yet."
    };
    container.innerHTML = `<p>${textMap[type]}</p>`;
    return;
  }

  purchases.forEach((purchase) => {
    const row = document.createElement("div");
    row.className = "row-new purchase-row";
    
    const purchaseDate = new Date(purchase.purchasedAt);
    const formattedDate = purchaseDate.toLocaleDateString() + " " + purchaseDate.toLocaleTimeString();

    row.innerHTML = `
      <div class="purchase-content">
        <strong>Student:</strong> ${purchase.email} (ID: ${purchase.ID})<br>
        <strong>Purchased:</strong> ${formattedDate}
        <div class="purchase-buttons">
          <button class="fulfilled-btn">Mark Fulfilled</button>
        </div>
      </div>
    `;

    row.querySelector(".fulfilled-btn").onclick = () => {
      fulfillPurchase(type, purchase.email, purchase.ID, purchase.purchasedAt);
    };

    container.appendChild(row);
  });
}

function fulfillPurchase(itemKey, email, id, purchasedAt) {
  fetch("/api/purchases/fulfill", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemKey, email, id, purchasedAt }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fulfill purchase");
      return res.json();
    })
    .then(() => loadPurchases())
    .catch((err) => {
      console.error(err);
      alert("Failed to fulfill purchase");
    });
}

/* ============================
   SIDEBAR NAVIGATION
============================ */
function setupSidebarNavigation() {
  const buttons = document.querySelectorAll(".dash-nav button");
  const sections = document.querySelectorAll(".main-panel .grid");

  buttons.forEach((btn, index) => {
    if (btn.id === "logoutButton") return;

    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      sections.forEach((sec) => sec.classList.add("hidden"));
      if (sections[index]) sections[index].classList.remove("hidden");

      const label = btn.textContent.trim();
      if (label === "Contact Messages") renderContactMessages();
      if (label === "Claims") loadClaims();
      if (label === "Purchases") loadPurchases();
    });
  });
}