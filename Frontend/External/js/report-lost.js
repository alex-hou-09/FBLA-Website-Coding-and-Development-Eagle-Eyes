const form = document.getElementById("reportForm");
const successMessage = document.getElementById("successMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("typeOfSubmission", "lost-report");
  formData.append(
    "studentEmail",
    document.getElementById("studentEmail").value,
  );
  formData.append("studentID", document.getElementById("studentID").value);
  formData.append("itemName", document.getElementById("itemName").value);
  formData.append("category", document.getElementById("category").value);
  formData.append("color", document.getElementById("color").value);
  formData.append("lastSeen", document.getElementById("lastSeen").value);
  formData.append("description", document.getElementById("description").value);

  const imageFile = document.getElementById("UPLOADIMAGE").files[0];
  if (imageFile) {
    formData.append("image", imageFile);
  }

  try {
    const response = await fetch("http://localhost:3000/api/claims", {
      method: "POST",
      body: formData,
    });

    const resp = await response.json();

    if (resp.success) {
      successMessage.style.display = "block";
      setTimeout(() => {
        form.reset();
        successMessage.style.display = "none";
      }, 5000);
    } else {
      alert("Failed to submit. Try again.");
    }
  } catch (err) {
    console.error(err);
    alert("Error submitting report");
  }
});
