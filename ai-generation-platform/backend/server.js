import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { HfInference } from "@huggingface/inference";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Check if API key exists
if (!process.env.HUGGING_FACE_API_KEY && !process.env.HF_API_KEY) {
  console.error(" HUGGING_FACE_API_KEY is missing in .env file");
  process.exit(1);
}

const apiKey = process.env.HUGGING_FACE_API_KEY || process.env.HF_API_KEY;
const client = new HfInference(apiKey);

const WORKING_IMAGE_MODELS = [
  "black-forest-labs/FLUX.1-dev",
  "black-forest-labs/FLUX.1-schnell",
  "stabilityai/stable-diffusion-2-1",
  "stabilityai/stable-diffusion-2-1-base",
  "runwayml/stable-diffusion-v1-5",
  "prompthero/openjourney-v4",
  "dreamlike-art/dreamlike-photoreal-2.0",
  "Linaqruf/animagine-xl",
  "playgroundai/playground-v2.5-1024px-aesthetic",
];

const WORKING_TEXT_MODELS = [
  "google/flan-t5-large",
  "google/flan-t5-xl",
  "microsoft/DialoGPT-medium",
  "EleutherAI/gpt-neo-125M",
  "mistralai/Mistral-7B-Instruct-v0.1",
];

app.post("/api/generate/text", async (req, res) => {
  const { prompt, model = "google/flan-t5-large", parameters = {} } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: "Prompt is required" });
  }

  console.log(`\n📝 Generating text with: ${model}`);
  console.log(`Input: "${prompt.substring(0, 100)}..."`);

  try {
    const response = await client.textGeneration({
      model: model,
      inputs: prompt,
      parameters: {
        max_new_tokens: parameters.maxTokens || 250,
        temperature: parameters.temperature || 0.7,
        top_p: 0.95,
        do_sample: true,
        return_full_text: false,
      },
    });

    console.log(`Text generated successfully`);
    
    res.json({
      success: true,
      data: response.generated_text,
      model: model,
    });
  } catch (error) {
    console.error(` Text generation failed:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/api/generate/image", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  console.log(`\n📝 Generating image for: "${prompt.substring(0, 60)}..."`);
  console.log(`🔄 Will try ${WORKING_IMAGE_MODELS.length} models until one succeeds\n`);

  for (let i = 0; i < WORKING_IMAGE_MODELS.length; i++) {
    const model = WORKING_IMAGE_MODELS[i];
    try {
      console.log(`[${i + 1}/${WORKING_IMAGE_MODELS.length}] 🔄 Trying: ${model}`);
      
      const imageBlob = await client.textToImage({
        model: model,
        inputs: prompt,
        parameters: {
          negative_prompt: "blurry, bad quality, distorted, ugly, low resolution, watermark, text",
          num_inference_steps: 20,
          guidance_scale: 7,
        },
      });

      const arrayBuffer = await imageBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      console.log(` SUCCESS with ${model} (${(buffer.length / 1024).toFixed(2)} KB)`);
      
      const base64Image = buffer.toString('base64');
      const imageUrl = `data:image/png;base64,${base64Image}`;
      
      res.json({
        success: true,
        data: imageUrl,
        model: model,
        size_kb: (buffer.length / 1024).toFixed(2)
      });
      
      return;
      
    } catch (err) {
      console.log(` Failed: ${model} - ${err.message.substring(0, 100)}`);
      // Continue to next model
    }
  }
  
  console.error(`\n All ${WORKING_IMAGE_MODELS.length} models failed`);
  res.status(500).json({ 
    success: false,
    error: "All models are currently busy or unavailable",
    details: "Free tier has rate limits. Please wait 1-2 minutes and try again.",
    models_tried: WORKING_IMAGE_MODELS.length
  });
});

app.post("/api/generate/code", async (req, res) => {
  const { prompt, language = "javascript" } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: "Prompt is required" });
  }

  console.log(`\n💻 Generating ${language} code for: "${prompt.substring(0, 100)}..."`);

  try {
    const enhancedPrompt = `Generate ${language} code for: ${prompt}

Requirements:
- Write clean, well-commented code
- Include necessary imports
- Add error handling
- Only output the code, no explanations

Code:`;

    const response = await client.textGeneration({
      model: "bigcode/starcoderbase-1b",
      inputs: enhancedPrompt,
      parameters: {
        max_new_tokens: 600,
        temperature: 0.2,
        return_full_text: false,
      },
    });

    let code = response.generated_text;
    code = code.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
    
    console.log(` Code generated successfully (${code.length} chars)`);
    
    res.json({
      success: true,
      data: code,
      language: language,
    });
  } catch (error) {
    console.error(` Code generation failed:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/api/summarize", async (req, res) => {
  const { text, model = "facebook/bart-large-cnn" } = req.body;

  if (!text) {
    return res.status(400).json({ success: false, error: "Text is required" });
  }

  console.log(`\n📄 Summarizing text (${text.length} chars)...`);

  try {
    const response = await client.summarization({
      model: model,
      inputs: text,
      parameters: {
        max_length: 150,
        min_length: 40,
        do_sample: false,
      },
    });

    console.log(`✅ Summary generated (${response.summary_text.length} chars)`);
    
    res.json({
      success: true,
      data: response.summary_text,
    });
  } catch (error) {
    console.error(` Summarization failed:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


app.get("/api/models", (req, res) => {
  res.json({
    success: true,
    models: {
      text: WORKING_TEXT_MODELS.map(m => ({ 
        id: m, 
        name: m.split('/').pop(),
        description: getModelDescription(m)
      })),
      image: WORKING_IMAGE_MODELS.map(m => ({ 
        id: m, 
        name: m.split('/').pop(),
        description: getImageModelDescription(m)
      })),
      code: [{ id: "bigcode/starcoderbase-1b", name: "StarCoder", description: "Code generation" }],
      summarization: [{ id: "facebook/bart-large-cnn", name: "BART CNN", description: "News summarization" }]
    }
  });
});

function getModelDescription(model) {
  const descriptions = {
    "google/flan-t5-large": "Best general purpose text generation",
    "google/flan-t5-xl": "More powerful text generation",
    "microsoft/DialoGPT-medium": "Great for conversations",
    "EleutherAI/gpt-neo-125M": "Fast text generation",
    "mistralai/Mistral-7B-Instruct-v0.1": "Advanced AI model"
  };
  return descriptions[model] || "Text generation model";
}

function getImageModelDescription(model) {
  const descriptions = {
    "black-forest-labs/FLUX.1-dev": "Highest quality images",
    "black-forest-labs/FLUX.1-schnell": "Fast high-quality generation",
    "stabilityai/stable-diffusion-2-1": "Stable Diffusion 2.1",
    "runwayml/stable-diffusion-v1-5": "Stable Diffusion 1.5",
    "prompthero/openjourney-v4": "Artistic style",
    "dreamlike-art/dreamlike-photoreal-2.0": "Photorealistic"
  };
  return descriptions[model] || "Image generation model";
}

app.get("/api/test-image", async (req, res) => {
  try {
    console.log("Testing image generation with FLUX.1-schnell...");
    const testImage = await client.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: "a simple test image of a blue sky",
      parameters: { num_inference_steps: 15 }
    });
    
    const arrayBuffer = await testImage.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    res.json({ 
      success: true,
      status: "API key works!", 
      message: "Successfully generated test image",
      size_kb: (buffer.length / 1024).toFixed(2),
      available_models: WORKING_IMAGE_MODELS.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      status: " API key is valid but models are busy",
      error: err.message
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ 
    success: true,
    status: "ok", 
    message: "Server is running",
    text_models: WORKING_TEXT_MODELS.length,
    image_models: WORKING_IMAGE_MODELS.length
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n Server running at http://localhost:${PORT}`);
  console.log(`\n Available Endpoints:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   GET  /api/models - List all models`);
  console.log(`   GET  /api/test-image - Test image generation`);
  console.log(`   POST /api/generate/text - Text generation`);
  console.log(`   POST /api/generate/image - Image generation`);
  console.log(`   POST /api/generate/code - Code generation`);
  console.log(`   POST /api/summarize - Text summarization`);
  console.log(`\nLoaded Models:`);
  console.log(`   Text Models: ${WORKING_TEXT_MODELS.length}`);
  console.log(`   Image Models: ${WORKING_IMAGE_MODELS.length}`);
  console.log(`\n First 5 image models: ${WORKING_IMAGE_MODELS.slice(0, 5).join(", ")}...\n`);
});