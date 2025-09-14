import admin from "firebase-admin";

// Firebase Admin 초기화
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
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
    const message = {
      notification: { title, body },
      data: { step: step || "" },
      token,
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
    res.status(200).json({ success: true, messageId: response });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
