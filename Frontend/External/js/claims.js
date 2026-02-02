document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("claim-form");
  const message = document.getElementById("claim-message");

  // Get the selected item ID and name from localStorage
  const selectedItemId = localStorage.getItem("selectedItemId");
  const selectedItemName = localStorage.getItem("selectedItemName");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!selectedItemId) {
      message.textContent = "No item selected for claim.";
      message.style.color = "red";
      message.style.display = "block";
      return;
    }

    const claimData = {
      studentEmail: document.getElementById("name").value.trim(),
      studentID: document.getElementById("studentID").value.trim(),
      itemName: selectedItemName,
      itemID: selectedItemId,
      dateLost: document.getElementById("color").value.trim(),
      uniqueFeatures: document.getElementById("uniqueMarks").value.trim(),
      notes: document.getElementById("locationLost").value.trim(),
    };

    try {
      const res = await fetch("/api/item-claims", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(claimData),
      });

      const result = await res.json();

      if (result.success) {
        message.textContent = "Claim submitted! Redirecting...";
        message.className = "success";
        message.style.display = "block";

        setTimeout(() => {
          window.location.href = "browse.html";
        }, 1500);
      } else {
        message.textContent = result.error || "Failed to submit claim.";
        message.className = "error";
        message.style.display = "block";
      }
    } catch (err) {
      console.error(err);
      message.textContent = "An error occurred while submitting the claim.";
      message.className = "error";
      message.style.display = "block";
    }
  });
});
