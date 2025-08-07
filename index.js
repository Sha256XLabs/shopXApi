const express = require("express");
const cors = require("cors"); // Add cors
const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

const app = express();
app.use(express.json());

// Enable CORS for http://localhost:8081
app.use(
  cors({
    origin: "http://localhost:8081",
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-api-key"],
  })
);

// Initialize Firebase Admin SDK with service account
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf-8")
);
initializeApp({ credential: cert(serviceAccount) });

// Endpoint to send notification
app.post("/send-notification", async (req, res) => {
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

// Vercel serverless function export
module.exports = app;
