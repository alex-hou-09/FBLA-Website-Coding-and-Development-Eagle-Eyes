const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

let particles = [];
const colors = [
  "#415a77", // medium
  "#778da9", // light
  "#e0e1dd", // base
];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", () => {
  resizeCanvas();
  initParticles();
});

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = Math.random() * 2.5 + 1;
    this.vx = Math.random() * 0.6 - 0.3;
    this.vy = Math.random() * 0.6 - 0.3;
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < 120; i++) {
    particles.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    p.move();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}

resizeCanvas();
initParticles();
animateParticles();

const btn = document.getElementById("log-in-button");

btn.addEventListener("click", (e) => {
  e.preventDefault();

  const emailInput = document.getElementById("email").value;
  const idInput = document.getElementById("ID").value;

  fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: emailInput,
      id: idInput,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        window.location.href = data.redirect;
      } else {
        const errorEl = document.getElementById("errorMessage");
        errorEl.style.display = "block";
        setTimeout(() => (errorEl.style.display = "none"), 5000);
      }
    });
});
