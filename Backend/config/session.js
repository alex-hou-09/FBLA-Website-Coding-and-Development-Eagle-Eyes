const session = require("express-session");

const sessionMiddleware = session({
  secret: "mySuperSecretKey",
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 24 * 60 * 60 * 1000}, // 1 day
});

module.exports = {sessionMiddleware};
