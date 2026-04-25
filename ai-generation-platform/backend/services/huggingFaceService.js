const axios = require('axios');

class HuggingFaceService {
  constructor() {
    this.apiKey = process.env.HUGGING_FACE_API_KEY;
  }

  async textGeneration(prompt, model = 'google/flan-t5-large', parameters = {}) {
    try {
      // Working text generation models
      const workingModels = {
        'google/flan-t5-large': 'https://api-inference.huggingface.co/models/google/flan-t5-large',
        'google/flan-t5-xl': 'https://api-inference.huggingface.co/models/google/flan-t5-xl',
        'mistralai/Mistral-7B-Instruct-v0.1': 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
        'meta-llama/Llama-2-7b-chat-hf': 'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf'
      };
      
      const apiUrl = workingModels[model] || `https://api-inference.huggingface.co/models/${model}`;
      
      const response = await axios({
        method: 'post',
        url: apiUrl,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        data: {
          inputs: prompt,
          parameters: {
            max_new_tokens: parameters.maxTokens || 250,
            temperature: parameters.temperature || 0.7,
            top_p: 0.95,
            do_sample: true,
            return_full_text: false
          }
        },
        timeout: 60000
      });

      let generatedText = '';
      if (Array.isArray(response.data) && response.data[0]?.generated_text) {
        generatedText = response.data[0].generated_text;
      } else if (response.data.generated_text) {
        generatedText = response.data.generated_text;
      } else if (typeof response.data === 'string') {
        generatedText = response.data;
      } else if (response.data[0] && typeof response.data[0] === 'string') {
        generatedText = response.data[0];
      }

      return {
        success: true,
        data: generatedText.trim() || prompt,
        model: model
      };
    } catch (error) {
      console.error('Text generation error:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 503) {
        return {
          success: false,
          error: 'Model is loading. Please wait 10-15 seconds and try again.'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  async imageGeneration(prompt, model = 'black-forest-labs/FLUX.1-dev') {
    try {
      // Updated working image generation models (as of 2024)
      const imageModels = {
        'black-forest-labs/FLUX.1-dev': 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev',
        'stabilityai/stable-diffusion-xl-base-1.0': 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
        'prompthero/openjourney-v4': 'https://api-inference.huggingface.co/models/prompthero/openjourney-v4'
      };
      
      const apiUrl = imageModels[model] || `https://api-inference.huggingface.co/models/${model}`;
      
      console.log('Calling image API:', apiUrl);
      
      const response = await axios({
        method: 'post',
        url: apiUrl,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        data: {
          inputs: prompt,
          parameters: {
            negative_prompt: 'blurry, bad quality, distorted, low resolution, ugly',
            num_inference_steps: 25,
            guidance_scale: 7.5
          }
        },
        responseType: 'arraybuffer',
        timeout: 90000
      });

      const base64Image = Buffer.from(response.data, 'binary').toString('base64');
      const imageUrl = `data:image/png;base64,${base64Image}`;

      return {
        success: true,
        data: imageUrl,
        model: model
      };
    } catch (error) {
      console.error('Image generation error:', error.response?.status);
      
      if (error.response?.status === 503) {
        return {
          success: false,
          error: 'Image model is loading. Please wait and try again.'
        };
      }
      
      if (error.response?.status === 404) {
        return {
          success: false,
          error: `Model '${model}' not found or not accessible. Try using 'black-forest-labs/FLUX.1-dev' instead.`
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async codeGeneration(prompt, language = 'javascript') {
    try {
      // Working code generation model
      const apiUrl = 'https://api-inference.huggingface.co/models/bigcode/starcoderbase-1b';
      
      const enhancedPrompt = `Generate ${language} code for: ${prompt}

Requirements:
- Write clean, well-commented ${language} code
- Include necessary imports
- Add error handling
- Only output the code, no explanations

Code:`;

      const response = await axios({
        method: 'post',
        url: apiUrl,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        data: {
          inputs: enhancedPrompt,
          parameters: {
            max_new_tokens: 600,
            temperature: 0.2,
            top_p: 0.95,
            do_sample: true,
            return_full_text: false
          }
        },
        timeout: 45000
      });

      let code = '';
      if (Array.isArray(response.data) && response.data[0]?.generated_text) {
        code = response.data[0].generated_text;
      } else if (response.data.generated_text) {
        code = response.data.generated_text;
      }

      // Clean up the code
      code = code.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');

      return {
        success: true,
        data: code || '// Code generation failed. Please try a different prompt.',
        language: language
      };
    } catch (error) {
      console.error('Code generation error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async summarization(text, model = 'facebook/bart-large-cnn') {
    try {
      const apiUrl = `https://api-inference.huggingface.co/models/${model}`;
      
      const response = await axios({
        method: 'post',
        url: apiUrl,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        data: {
          inputs: text,
          parameters: {
            max_length: 150,
            min_length: 40,
            do_sample: false
          }
        },
        timeout: 30000
      });

      let summary = '';
      if (Array.isArray(response.data) && response.data[0]?.summary_text) {
        summary = response.data[0].summary_text;
      } else if (response.data.summary_text) {
        summary = response.data.summary_text;
      }

      return {
        success: true,
        data: summary || 'Unable to summarize text.'
      };
    } catch (error) {
      console.error('Summarization error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new HuggingFaceService();