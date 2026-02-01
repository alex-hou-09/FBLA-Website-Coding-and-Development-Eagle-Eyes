const express = require("express");
const path = require("path");

const {connectDB} = require("./config/database");
const {sessionMiddleware} = require("./config/session");

// Routes
const itemRoutes = require("./routes/items");
const authRoutes = require("./routes/auth");
const claimRoutes = require("./routes/claims"); // handles /claims/* AND /item-claims
const contactRoutes = require("./routes/contact");
const userRoutes = require("./routes/user"); // handles /user/* and /item-claims/:id/:email and /claimed-items/:id etc.
const purchaseRoutes = require("./routes/purchases");

const app = express();
const PORT = 3000;

// ===========================
// Middleware
// ===========================
app.use(express.json());
// Serve static files from project root (Backend/ is one level deep, so go up one)
app.use(express.static(path.join(__dirname, "..")));
app.use(sessionMiddleware);

// ===========================
// Routes
// Original URLs are preserved exactly as they were.
// ===========================
app.use("/api/items", itemRoutes); // GET /api/items, DELETE /api/items/:id, GET /api/items/latest
app.use("/api", authRoutes); // POST /api/login, GET /api/current-user, POST /api/logout
app.use("/api/claims", claimRoutes); // POST /api/claims, POST /api/claims/decision
app.use("/api", claimRoutes); // POST /api/item-claims  (same router, different mount)
app.use("/api/contact", contactRoutes); // POST /api/contact, POST /api/contact/respond
app.use("/api", userRoutes); // GET  /api/user/*, DELETE /api/item-claims/:id/:email, etc.
app.use("/api", purchaseRoutes); // POST /api/user/purchase, GET /api/purchases, POST /api/purchases/fulfill

// ===========================
// Start Server
// ===========================
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
