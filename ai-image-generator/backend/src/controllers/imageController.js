import { generateImage } from "../services/pollinationsService.js";


export const generateImageController = async (req, res) => {
  try {
    const { prompt, referenceLink } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await generateImage(prompt, referenceLink);

    console.log("Generated:", result);

    res.json(result);

  } catch (error) {
    console.error("CONTROLLER ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};