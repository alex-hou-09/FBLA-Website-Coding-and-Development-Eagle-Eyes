document.addEventListener("DOMContentLoaded", () => {
  const stuff = document.querySelectorAll(".animate-image");
  console.log("Images found:", stuff.length);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        console.log(
          "Observed:",
          entry.target,
          "Intersecting:",
          entry.isIntersecting
        );
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  const images = document.querySelectorAll(".animate-image");
  images.forEach((img) => observer.observe(img));
});

//Getting user for avatar, initials, and student name

document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/current-user")
    .then((res) => res.json())
    .then((user) => {
      if (!user) return;

      const navRight = document.querySelector(".nav-right");

      // Remove login link
      const loginLink = navRight.querySelector('a[href="login.html"]');
      if (loginLink) loginLink.remove();

      // Add user home link
      const userLink = document.createElement("a");
      userLink.href =
        user.userType === "Admin"
          ? "/Frontend/HTML/admin.html"
          : "/Frontend/HTML/user-homepage.html";

      userLink.textContent = `User Homepage`;

      navRight.appendChild(userLink);
    });
});

//Log out user

document.getElementById("logoutButton")?.addEventListener("click", () => {
  fetch("/api/logout", { method: "POST" })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        // Optionally redirect to login page
        window.location.href = "/Frontend/HTML/login.html";
      } else {
        alert(data.message || "No user logged in");
      }
    });
});
