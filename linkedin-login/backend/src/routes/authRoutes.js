import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/linkedin", async (req, res) => {
  const { code } = req.body;

  // 🔍 Debug logs (VERY IMPORTANT)
  console.log("==== LinkedIn OAuth Debug ====");
  console.log("CODE:", code);
  console.log("CLIENT_ID:", process.env.CLIENT_ID);
  console.log("CLIENT_SECRET:", process.env.CLIENT_SECRET ? "Loaded ✅" : "Missing ❌");
  console.log("REDIRECT_URI:", process.env.REDIRECT_URI);
  console.log("================================");

  try {
    const response = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // ✅ Success
    console.log("Access Token Response:", response.data);

    res.json(response.data);

  } catch (err) {
    // ❌ Detailed error logging
    console.error("❌ LinkedIn Token Error:");
    console.error(err.response?.data || err.message);

    res.status(500).json({
      error: "Token exchange failed",
      details: err.response?.data || err.message,
    });
  }
});




router.get("/linkedin/user", async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  try {
    const response = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("User Fetch Error:", err.response?.data || err.message);

    res.status(500).json({
      error: "Failed to fetch user",
      details: err.response?.data,
    });
  }
});
export default router;