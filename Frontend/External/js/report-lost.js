const form = document.getElementById("reportForm");
const successMessage = document.getElementById("successMessage");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    typeOfSubmission: "lost-report",
    studentEmail: document.getElementById("studentEmail").value,
    studentID: document.getElementById("studentID").value,
    itemName: document.getElementById("itemName").value,
    category: document.getElementById("category").value,
    color: document.getElementById("color").value,
    lastSeen: document.getElementById("lastSeen").value,
    description: document.getElementById("description").value,
    UPLOADIMAGE: document.getElementById("UPLOADIMAGE").files[0]?.name || "",
  };

  fetch("http://localhost:3000/api/claims", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((resp) => {
      if (resp.success) {
        successMessage.style.display = "block";
        setTimeout(() => {
          form.reset();
          successMessage.style.display = "none";
        }, 5000);
      } else {
        alert("Failed to submit. Try again.");
      }
    })
    .catch((err) => {
      console.error(err);
      alert("Error submitting report");
    });
});
