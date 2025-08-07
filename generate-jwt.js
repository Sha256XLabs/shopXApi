const jwt = require("jsonwebtoken");
const fs = require("fs");

const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json"));
const payload = {
  iss: serviceAccount.client_email,
  scope: "https://www.googleapis.com/auth/firebase.messaging",
  aud: "https://oauth2.googleapis.com/token",
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000),
};
const jwtToken = jwt.sign(payload, serviceAccount.private_key, {
  algorithm: "RS256",
});
console.log("JWT:", jwtToken);
