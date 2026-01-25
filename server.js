const express = require("express");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const multer = require("multer");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// ===========================
//! Session Configuration
// ===========================

app.use(
  session({
    secret: "mySuperSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  }),
);

// ===========================
//! Multer Configuration for File Uploads
// ===========================

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// ===========================
//! File Paths
// ===========================

const DATA_DIR = path.join(__dirname, "Data");
const IMAGES_DIR = path.join(__dirname, "Frontend", "Images");

const FILES = {
  items: path.join(DATA_DIR, "_item-information.json"),
  users: path.join(DATA_DIR, "user-information.json"),
  pending: path.join(DATA_DIR, "pending-base.json"),
  contactWaiting: path.join(DATA_DIR, "waiting-contact.json"),
  contactAnswered: path.join(DATA_DIR, "answered-contact.json"),
  itemClaims: path.join(DATA_DIR, "item-claims.json"),
  lostItems: path.join(DATA_DIR, "lost-items.json"),
  claimedItems: path.join(DATA_DIR, "claimed-items.json"),
};

// ===========================
//! Helper Functions
// ===========================

function readJSON(filePath, defaultValue = {}) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
    return defaultValue;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return defaultValue;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function ensureFile(filePath, key) {
  if (!fs.existsSync(filePath)) {
    writeJSON(filePath, { [key]: [] });
  }
}

function awardCredits(userID, amount) {
  const usersData = readJSON(FILES.users, { users: [] });

  const user = usersData.users.find(
    (u) => String(u.id) === String(userID) && u.userType === "Student",
  );

  if (!user) return;

  user.credits = (user.credits || 0) + amount;
  writeJSON(FILES.users, usersData);
}

// ===========================
//! Items Routes
// ===========================

app.get("/api/items", (req, res) => {
  const data = readJSON(FILES.items, { items: [] });
  res.json(data);
});

app.delete("/api/items/:id", (req, res) => {
  const id = String(req.params.id);
  const data = readJSON(FILES.items, { items: [] });
  const filtered = data.items.filter((item) => String(item.id) !== id);
  writeJSON(FILES.items, { items: filtered });
  res.json({ success: true });
});

// ===========================
//! Login Routes
// ===========================

app.post("/api/login", (req, res) => {
  const { email, id } = req.body;
  const data = readJSON(FILES.users, { users: [] });

  const user = data.users.find(
    (u) => u.email === email && String(u.id) === String(id),
  );
  if (!user) return res.json({ success: false });

  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    userType: user.userType,
    credits: user.userType === "Student" ? user.credits : 0,
  };

  res.json({
    success: true,
    redirect:
      user.userType === "Admin"
        ? "/Frontend/HTML/admin.html"
        : "/Frontend/HTML/user-homepage.html",
  });
});

app.get("/api/current-user", (req, res) => {
  res.json(req.session.user || null);
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

// ===========================
//! Claims Routes (Updated with Image Upload)
// ===========================

app.post("/api/claims", upload.single("image"), (req, res) => {
  const newClaim = {
    typeOfSubmission: req.body.typeOfSubmission,
    studentEmail: req.body.studentEmail,
    studentID: req.body.studentID,
    itemName: req.body.itemName,
    category: req.body.category,
    color: req.body.color,
    description: req.body.description,
  };

  // Add type-specific fields
  if (req.body.typeOfSubmission === "found-report") {
    newClaim.locationFound = req.body.locationFound;
    newClaim.dateFound = req.body.dateFound;
  } else if (req.body.typeOfSubmission === "lost-report") {
    newClaim.lastSeen = req.body.lastSeen;
  }

  // Store the temporary upload path if image was uploaded
  if (req.file) {
    newClaim.tempImagePath = req.file.path;
    newClaim.originalImageName = req.file.filename;
  }

  const data = readJSON(FILES.pending, { pending: [] });
  data.pending.push(newClaim);
  writeJSON(FILES.pending, data);
  res.json({ success: true });
});

app.post("/api/item-claims", (req, res) => {
  const {
    studentEmail,
    studentID,
    itemName,
    itemID,
    dateLost,
    uniqueFeatures,
    notes,
  } = req.body;

  if (!studentEmail || !studentID || !itemID || !dateLost) {
    return res
      .status(400)
      .json({ success: false, error: "Required fields are missing." });
  }

  const data = readJSON(FILES.pending, { pending: [] });
  data.pending.push({
    typeOfSubmission: "item-claim",
    studentEmail,
    studentID,
    itemName,
    itemID,
    dateLost,
    uniqueFeatures,
    notes,
  });

  writeJSON(FILES.pending, data);
  res.json({ success: true, message: "Claim submitted and pending approval." });
});

// ===========================
//! Contact Routes
// ===========================

app.post("/api/contact", (req, res) => {
  const { email, studentId, subject, category, message } = req.body;
  if (!email || !studentId || !subject || !category || !message) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required." });
  }

  const data = readJSON(FILES.contactWaiting, { messages: [] });
  data.messages.push({ email, studentId, subject, category, message });
  writeJSON(FILES.contactWaiting, data);

  res.json({ success: true, message: "Your message has been submitted." });
});

app.post("/api/contact/respond", (req, res) => {
  const { message, response, answeredAt } = req.body;
  if (!message || !response) return res.status(400).json({ success: false });

  const waitingData = readJSON(FILES.contactWaiting, { messages: [] });
  const answeredData = readJSON(FILES.contactAnswered, { messages: [] });

  const index = waitingData.messages.findIndex(
    (m) =>
      m.email === message.email &&
      m.studentId === message.studentId &&
      m.subject === message.subject &&
      m.message === message.message,
  );

  if (index === -1) {
    return res.status(404).json({ success: false, error: "Message not found" });
  }

  const [removedMessage] = waitingData.messages.splice(index, 1);
  answeredData.messages.push({ ...removedMessage, response, answeredAt });

  writeJSON(FILES.contactWaiting, waitingData);
  writeJSON(FILES.contactAnswered, answeredData);

  res.json({ success: true });
});

// ===========================
//! Claim Decision Route (Updated with Image Handling)
// ===========================
app.post("/api/claims/decision", (req, res) => {
  try {
    const { submission, decision } = req.body;

    ensureFile(FILES.pending, "pending");
    ensureFile(FILES.itemClaims, "claims");
    ensureFile(FILES.lostItems, "lost");
    ensureFile(FILES.items, "items");
    ensureFile(FILES.claimedItems, "claimedItems");

    const pendingData = readJSON(FILES.pending, { pending: [] });
    
    // Find the exact submission to get image path
    const submissionIndex = pendingData.pending.findIndex(
      (p) =>
        p.typeOfSubmission === submission.typeOfSubmission &&
        p.studentEmail === submission.studentEmail &&
        (p.itemID === submission.itemID || p.itemName === submission.itemName)
    );

    let imagePath = "";
    
    if (submissionIndex !== -1) {
      const foundSubmission = pendingData.pending[submissionIndex];
      
      // Move image from uploads to Images folder if it exists and decision is approve
      if (decision === "approve" && foundSubmission.tempImagePath) {
        const finalImageName = foundSubmission.originalImageName;
        const finalImagePath = path.join(IMAGES_DIR, finalImageName);
        
        try {
          // Copy file from uploads to Images
          fs.copyFileSync(foundSubmission.tempImagePath, finalImagePath);
          
          // Store relative path from HTML files (Frontend/HTML/)
          imagePath = `../Images/${finalImageName}`;
          
          // Delete temp file
          fs.unlinkSync(foundSubmission.tempImagePath);
          
          console.log(`✓ Image moved successfully: ${finalImageName}`);
          console.log(`✓ Saved to: Frontend/Images/${finalImageName}`);
          console.log(`✓ Path stored in DB: ${imagePath}`);
        } catch (err) {
          console.error("Error moving image:", err);
        }
      } else if (foundSubmission.tempImagePath) {
        // If denied, just delete the temp file
        try {
          fs.unlinkSync(foundSubmission.tempImagePath);
          console.log(`✓ Temp image deleted (report was denied)`);
        } catch (err) {
          console.error("Error deleting temp image:", err);
        }
      }
    }

    // Remove from pending
    pendingData.pending = pendingData.pending.filter(
      (p) =>
        !(
          p.typeOfSubmission === submission.typeOfSubmission &&
          p.studentEmail === submission.studentEmail &&
          (p.itemID === submission.itemID || p.itemName === submission.itemName)
        ),
    );

    if (decision === "approve") {
      if (submission.typeOfSubmission === "item-claim") {
        const claims = readJSON(FILES.itemClaims, { claims: [] });
        claims.claims.push({
          ...submission,
          status: "Approved",
        });
        writeJSON(FILES.itemClaims, claims);

        const itemsData = readJSON(FILES.items, { items: [] });
        const claimedData = readJSON(FILES.claimedItems, { claimedItems: [] });

        const claimedItem = itemsData.items.find(
          (item) => String(item.id) === String(submission.itemID),
        );

        if (!claimedItem) {
          throw new Error("Item not found in _item-information.json");
        }

        claimedData.claimedItems.push({
          ...claimedItem,
          submitterEmail: claimedItem.submitterEmail,
          submitterID: claimedItem.submitterID,
          claimedByEmail: submission.studentEmail,
          claimedByID: submission.studentID,
          claimedAt: new Date().toISOString(),
        });

        writeJSON(FILES.claimedItems, claimedData);
        awardCredits(claimedItem.submitterID, 10);

        itemsData.items = itemsData.items.filter(
          (item) => String(item.id) !== String(submission.itemID),
        );

        writeJSON(FILES.items, itemsData);
      }

      if (submission.typeOfSubmission === "lost-report") {
        const lost = readJSON(FILES.lostItems, { lost: [] });
        lost.lost.push({
          ...submission,
          image: imagePath,
        });
        writeJSON(FILES.lostItems, lost);
      }

      if (submission.typeOfSubmission === "found-report") {
        const items = readJSON(FILES.items, { items: [] });
        items.items.push({
          id: Date.now().toString(),
          name: submission.itemName,
          category: submission.category,
          color: submission.color,
          description: submission.description,
          locationFound: submission.locationFound,
          dateFound: submission.dateFound,
          image: imagePath,
          status: "Pending",
          submitterEmail: submission.studentEmail,
          submitterID: submission.studentID,
        });
        writeJSON(FILES.items, items);
      }
    }

    writeJSON(FILES.pending, pendingData);
    res.json({ success: true });
  } catch (err) {
    console.error("CLAIM DECISION ERROR:", err);
    res.status(500).json({ success: false });
  }
});

app.get("/api/user/item-claims", (req, res) => {
  if (!req.session.user || !req.session.user.email) {
    return res.status(401).json({ success: false, error: "Not logged in" });
  }

  const userEmail = req.session.user.email.toLowerCase();
  const userID = String(req.session.user.id);

  const pendingData = readJSON(FILES.pending, { pending: [] });
  const approvedData = readJSON(FILES.itemClaims, { claims: [] });

  const pendingClaims = pendingData.pending
    .filter(
      (c) =>
        c.typeOfSubmission === "item-claim" &&
        (c.studentEmail.toLowerCase() === userEmail ||
          String(c.studentID) === userID),
    )
    .map((c) => ({ ...c, status: "Pending" }));

  const approvedClaims = approvedData.claims
    .filter(
      (c) =>
        c.typeOfSubmission === "item-claim" &&
        (c.studentEmail.toLowerCase() === userEmail ||
          String(c.studentID) === userID),
    )
    .map((c) => ({ ...c, status: "Approved" }));

  res.json({
    success: true,
    claims: [...pendingClaims, ...approvedClaims],
  });
});

app.delete("/api/item-claims/:itemID/:email", (req, res) => {
  const { itemID, email } = req.params;
  const decodedEmail = decodeURIComponent(email);

  const data = readJSON(FILES.itemClaims, { claims: [] });
  const originalLength = data.claims.length;

  data.claims = data.claims.filter(
    (c) =>
      !(
        String(c.itemID) === String(itemID) &&
        c.studentEmail === decodedEmail &&
        c.status === "Approved"
      ),
  );

  if (data.claims.length === originalLength) {
    return res.status(404).json({ success: false, error: "Claim not found." });
  }

  writeJSON(FILES.itemClaims, data);
  res.json({ success: true });
});

app.get("/api/user/turned-in-items", (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false });

  const userEmail = req.session.user.email.toLowerCase();
  const userID = String(req.session.user.id);

  const pendingData = readJSON(FILES.pending, { pending: [] });
  const pendingReports = pendingData.pending
    .filter(
      (r) =>
        r.typeOfSubmission === "found-report" &&
        (r.studentEmail.toLowerCase() === userEmail ||
          String(r.studentID) === userID),
    )
    .map((r) => ({ ...r, status: "Pending" }));

  const itemsData = readJSON(FILES.items, { items: [] });
  const waitingReports = itemsData.items
    .filter(
      (item) =>
        item.submitterEmail?.toLowerCase() === userEmail ||
        String(item.submitterID) === userID,
    )
    .map((item) => ({ ...item, status: "Waiting" }));

  const claimedData = readJSON(FILES.claimedItems, { claimedItems: [] });
  const claimedReports = claimedData.claimedItems
    .filter(
      (item) =>
        item.submitterEmail?.toLowerCase() === userEmail ||
        String(item.submitterID) === userID,
    )
    .map((item) => ({ ...item, status: "Claimed" }));

  res.json({
    success: true,
    reports: [...pendingReports, ...waitingReports, ...claimedReports],
  });
});

app.delete("/api/claimed-items/:id", (req, res) => {
  const id = String(req.params.id);

  const data = readJSON(FILES.claimedItems, { claimedItems: [] });
  const originalLength = data.claimedItems.length;

  data.claimedItems = data.claimedItems.filter(
    (item) => String(item.id) !== id,
  );

  if (data.claimedItems.length === originalLength) {
    return res.status(404).json({ success: false });
  }

  writeJSON(FILES.claimedItems, data);
  res.json({ success: true });
});

app.get("/api/user/contact-responses", (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false });

  const userEmail = req.session.user.email.toLowerCase();
  const userID = String(req.session.user.id);

  const answeredData = readJSON(FILES.contactAnswered, { messages: [] });

  const userResponses = answeredData.messages.filter(
    (msg) =>
      msg.email.toLowerCase() === userEmail || String(msg.studentId) === userID,
  );

  res.json({ success: true, responses: userResponses });
});

app.delete("/api/contact-responses/:email/:subject", (req, res) => {
  const { email, subject } = req.params;
  const decodedEmail = decodeURIComponent(email);
  const decodedSubject = decodeURIComponent(subject);

  const data = readJSON(FILES.contactAnswered, { messages: [] });
  const originalLength = data.messages.length;

  data.messages = data.messages.filter(
    (msg) => !(msg.email === decodedEmail && msg.subject === decodedSubject),
  );

  if (data.messages.length === originalLength) {
    return res
      .status(404)
      .json({ success: false, error: "Response not found" });
  }

  writeJSON(FILES.contactAnswered, data);
  res.json({ success: true });
});

app.get("/api/user/credits", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false });
  }

  const data = readJSON(FILES.users, { users: [] });

  const user = data.users.find(
    (u) =>
      String(u.id) === String(req.session.user.id) &&
      u.email === req.session.user.email &&
      u.userType === "Student",
  );

  if (!user) {
    return res.json({ success: false });
  }

  res.json({
    success: true,
    credits: user.credits,
  });
});

app.get("/api/items/latest", (req, res) => {
  const data = readJSON(FILES.items, { items: [] });

  const latestItems = data.items
    .filter((item) => item.image && item.image !== "")
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5)
    .map((item) => ({
      image: item.image,
      name: item.name,
    }));

  res.json({ success: true, items: latestItems });
});

app.post("/api/user/purchase", (req, res) => {
  const { itemKey, cost, email, id } = req.body;

  try {
    const usersData = readJSON(FILES.users, { users: [] });

    const user = usersData.users.find(
      (u) =>
        u.email === email &&
        String(u.id) === String(id) &&
        u.userType === "Student",
    );

    if (!user) {
      return res.json({ success: false, error: "User not found" });
    }

    const currentCredits = user.credits || 0;

    if (currentCredits < cost) {
      return res.json({ success: false, error: "Insufficient credits" });
    }

    user.credits = currentCredits - cost;
    writeJSON(FILES.users, usersData);

    const purchasedPath = path.join(DATA_DIR, "purchased.json");
    let purchasedData;

    if (!fs.existsSync(purchasedPath)) {
      purchasedData = {
        candy: [],
        tickets: [],
        cards: [],
      };
    } else {
      purchasedData = readJSON(purchasedPath, {
        candy: [],
        tickets: [],
        cards: [],
      });
    }

    purchasedData[itemKey].push({
      email: email,
      ID: id,
      purchasedAt: new Date().toISOString(),
    });

    writeJSON(purchasedPath, purchasedData);

    if (req.session.user) {
      req.session.user.credits = user.credits;
    }

    res.json({ success: true, newCredits: user.credits });
  } catch (error) {
    console.error("Purchase error:", error);
    res.json({ success: false, error: error.message });
  }
});

// ===========================
//! Purchases Routes
// ===========================

app.get("/api/purchases", (req, res) => {
  const purchasedPath = path.join(DATA_DIR, "purchased.json");
  
  let purchasedData;
  if (!fs.existsSync(purchasedPath)) {
    purchasedData = {
      candy: [],
      tickets: [],
      cards: [],
    };
  } else {
    purchasedData = readJSON(purchasedPath, {
      candy: [],
      tickets: [],
      cards: [],
    });
  }

  res.json(purchasedData);
});

app.post("/api/purchases/fulfill", (req, res) => {
  const { itemKey, email, id, purchasedAt } = req.body;
  
  if (!itemKey || !email || !id || !purchasedAt) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  const purchasedPath = path.join(DATA_DIR, "purchased.json");
  const purchasedData = readJSON(purchasedPath, {
    candy: [],
    tickets: [],
    cards: [],
  });

  if (!purchasedData[itemKey]) {
    return res.status(400).json({ success: false, error: "Invalid item key" });
  }

  purchasedData[itemKey] = purchasedData[itemKey].filter(
    (p) => !(p.email === email && String(p.ID) === String(id) && p.purchasedAt === purchasedAt)
  );

  writeJSON(purchasedPath, purchasedData);
  res.json({ success: true });
});

// ===========================
//! Start Server
// ===========================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});