const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { tokens, title, body, step } = req.body;

  if (!tokens || !Array.isArray(tokens) || tokens.length === 0 || !title || !body) {
    return res.status(400).send('Bad Request: "tokens"(배열), "title", "body" 필요');
  }

  try {
    const messages = tokens.map(token => ({
      notification: { title: title, body: body },
      data: { title: title, body: body, step: step || "0" },
      token,
    }));

    // sendAll 호출
    const response = await admin.messaging().sendAll(messages);

    console.log("Successfully sent messages:", response);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("Error sending messages:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}