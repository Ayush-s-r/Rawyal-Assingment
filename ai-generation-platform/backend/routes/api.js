const express = require('express');
const router = express.Router();
const huggingFaceService = require('../services/huggingFaceService');

router.post('/generate/text', async (req, res) => {
  const { prompt, model, parameters } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ 
      success: false, 
      error: 'Prompt is required' 
    });
  }

  const modelToUse = model || 'google/flan-t5-large';
  console.log(`Generating text with model: ${modelToUse}`);
  
  const result = await huggingFaceService.textGeneration(prompt, modelToUse, parameters);
  res.json(result);
});

router.post('/generate/image', async (req, res) => {
  const { prompt, model } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ 
      success: false, 
      error: 'Prompt is required' 
    });
  }

  // Use FLUX model which is currently working
  const modelToUse = model || 'black-forest-labs/FLUX.1-dev';
  console.log(`Generating image with model: ${modelToUse}`);
  
  const result = await huggingFaceService.imageGeneration(prompt, modelToUse);
  res.json(result);
});


router.post('/generate/code', async (req, res) => {
  const { prompt, language } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ 
      success: false, 
      error: 'Prompt is required' 
    });
  }

  console.log(`Generating code in ${language || 'javascript'}`);
  const result = await huggingFaceService.codeGeneration(prompt, language);
  res.json(result);
});


router.post('/summarize', async (req, res) => {
  const { text, model } = req.body;
  
  if (!text) {
    return res.status(400).json({ 
      success: false, 
      error: 'Text is required' 
    });
  }

  const modelToUse = model || 'facebook/bart-large-cnn';
  console.log(`Summarizing text with model: ${modelToUse}`);
  
  const result = await huggingFaceService.summarization(text, modelToUse);
  res.json(result);
});


router.get('/models', (req, res) => {
  res.json({
    success: true,
    models: {
      text: [
        { id: 'google/flan-t5-large', name: 'Google FLAN-T5 Large', description: 'Best for general text' },
        { id: 'google/flan-t5-xl', name: 'Google FLAN-T5 XL', description: 'More powerful' },
        { id: 'mistralai/Mistral-7B-Instruct-v0.1', name: 'Mistral 7B', description: 'Advanced AI' }
      ],
      image: [
        { id: 'black-forest-labs/FLUX.1-dev', name: 'FLUX.1', description: 'High quality images' },
        { id: 'stabilityai/stable-diffusion-xl-base-1.0', name: 'SDXL 1.0', description: 'Stable Diffusion XL' }
      ],
      code: [
        { id: 'bigcode/starcoderbase-1b', name: 'StarCoder', description: 'Code generation' }
      ],
      summarization: [
        { id: 'facebook/bart-large-cnn', name: 'BART CNN', description: 'News summarization' }
      ]
    }
  });
});

router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;