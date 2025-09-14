import admin from "firebase-admin";

// Firebase Admin SDK 초기화 (Serverless 안전하게)
let adminApp;
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  );

  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  adminApp = admin.app();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { token, title, body, step } = req.body;

  if (!token || !title || !body) {
    res.status(400).send('Bad Request: "token", "title", "body" 필요');
    return;
  }

  try {
    // 메시지 객체
    const message = {
      notification: { title, body },
      data: { title, body, step: step || "0" },
      token,
    };

    // 메시지 전송
    const response = await adminApp.messaging().send(message);

    console.log("Successfully sent message:", response);
    res.status(200).json({ success: true, messageId: response });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
