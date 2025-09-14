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

  const { tokens, title, body, step } = req.body;

  // tokens: 문자열 배열
  if (!tokens || !Array.isArray(tokens) || tokens.length === 0 || !title || !body) {
    res.status(400).send('Bad Request: "tokens"(배열), "title", "body" 모두 필요');
    return;
  }

  try {
    // sendAll용 메시지 배열 생성
    const messages = tokens.map(token => ({
      notification: { title, body },
      data: { title, body, step: step || "0" },
      token,
    }));

    // 여러 토큰에 메시지 전송
    const response = await adminApp.messaging().sendAll(messages);

    console.log("Successfully sent messages:", response);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("Error sending messages:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
