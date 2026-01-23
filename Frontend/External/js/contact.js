const form = document.querySelector(".contact-form");

// Create a message element for feedback
const feedback = document.createElement("div");
feedback.style.marginTop = "1rem";
feedback.style.fontWeight = "600";
form.appendChild(feedback);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const payload = {
    email: formData.get("email"),
    studentId: formData.get("studentId"),
    subject: formData.get("subject"),
    category: formData.get("category"),
    message: formData.get("message"),
  };

  const { email, studentId, subject, category, message } = payload;

  if (!email || !studentId || !subject || !category || !message) {
    feedback.textContent = "Please fill in all required fields.";
    feedback.style.color = "red";
    return;
  }

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      feedback.textContent = result.message;
      feedback.style.color = "green";
      feedback.style.fontFamily = "Quicksand, sans-serif";
      feedback.style.fontWeight = "400";

      setTimeout(() => {
        form.reset();
        feedback.textContent = "";
      }, 3000);
    } else {
      feedback.textContent = result.error || "Failed to submit message.";
      feedback.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    feedback.textContent = "An error occurred while submitting the message.";
    feedback.style.color = "red";
  }
});
