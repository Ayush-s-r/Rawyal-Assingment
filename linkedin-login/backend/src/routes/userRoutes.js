import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  console.log("User:", req.body);

  res.json({
    success: true,
    message: "User stored",
  });
});

export default router;