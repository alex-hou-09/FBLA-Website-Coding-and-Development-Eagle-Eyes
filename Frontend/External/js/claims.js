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
      dateLost: document.getElementById("color").value.trim(), // field for date lost
      uniqueFeatures: document.getElementById("uniqueMarks").value.trim(),
      notes: document.getElementById("locationLost").value.trim(),
    };

    try {
      const res = await fetch("/api/item-claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claimData),
      });

      const result = await res.json();

      if (result.success) {
        message.textContent = "Claim Pending. An administrator will review your submission.";
        message.style.color = "green";
        message.style.display = "block";

        // Clear the form after 3 seconds
        setTimeout(() => {
          form.reset();
          message.style.display = "none";
        }, 3000);
      } else {
        message.textContent = result.error || "Failed to submit claim.";
        message.style.color = "red";
        message.style.display = "block";
      }
    } catch (err) {
      console.error(err);
      message.textContent = "An error occurred while submitting the claim.";
      message.style.color = "red";
      message.style.display = "block";
    }
  });
});
