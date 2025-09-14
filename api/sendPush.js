const admin = require("firebase-admin");

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { tokens, title, body, step } = req.body;

  if (!tokens || !Array.isArray(tokens) || tokens.length === 0 || !title || !body) {
    res.status(400).send('Bad Request: "tokens"(배열), "title", "body" 필요');
    return;
  }

  try {
    const messages = tokens.map(token => ({
      notification: { title, body },
      data: { title, body, step: step || "0" },
      token,
    }));

    // 최신 SDK에서는 admin.messaging() 호출 후 sendAll
    const response = await admin.messaging().sendAll(messages);

    console.log("Successfully sent messages:", response);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("Error sending messages:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
