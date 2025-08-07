const express = require("express");
const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const cors = require("cors");

const app = express();

// Configure CORS to allow specific origins
app.use(
  cors({
    origin: [
      "http://localhost:8081", // Allow localhost for testing
      "https://theshopx.app", // Allow production domain
    ],
    methods: ["POST", "OPTIONS"], // Allow POST and preflight OPTIONS
    allowedHeaders: ["Content-Type", "x-api-key"], // Allow your headers
  })
);
app.use(express.json());

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf-8")
);
initializeApp({ credential: cert(serviceAccount) });

// Endpoint to send notification
app.post("/send-notification", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fcmToken, orderId, orderTotal } = req.body;
  if (!fcmToken || !orderId || !orderTotal) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await getMessaging().send({
      token: fcmToken,
      notification: {
        title: "New Order Received",
        body: `Order ID: ${orderId}, Total: ₹${orderTotal}`,
      },
      data: {
        orderId,
        orderTotal: orderTotal.toString(),
      },
    });
    res.status(200).json({ success: true, message: "Notification sent" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = app;
