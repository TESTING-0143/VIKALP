import admin from "firebase-admin";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Try parsing as JSON first
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch {
      // Fallback: decode base64-encoded string
      serviceAccount = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf-8")
      );
    }
  } else {
    // Local development
    serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json", "utf-8"));
  }
} catch (err) {
  console.error("❌ Failed to load Firebase service account:", err);
  serviceAccount = null;
}

// Initialize Firebase Admin
if (serviceAccount) {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized");
  }
} else {
  console.warn("⚠️ Firebase Admin not initialized: missing service account");
}

// Middleware
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!admin.apps.length) {
    return res.status(500).json({ success: false, message: "Firebase Admin not initialized" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Invalid token:", err.code, err.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
