'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

export default function Home() {
  const [activeTab, setActiveTab] = useState('text');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [models, setModels] = useState({});
  const [selectedModel, setSelectedModel] = useState('');
  const [parameters, setParameters] = useState({
    temperature: 0.7,
    maxTokens: 250,
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/models`);
      if (response.data.success) {
        setModels(response.data.models);
        if (response.data.models.text && response.data.models.text.length > 0) {
          setSelectedModel(response.data.models.text[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setResult('');
    setImageUrl('');

    try {
      let endpoint = '';
      let payload = {};

      switch (activeTab) {
        case 'text':
          endpoint = '/generate/text';
          payload = { prompt, model: selectedModel, parameters };
          break;
        case 'image':
          endpoint = '/generate/image';
          payload = { prompt };
          break;
        case 'code':
          endpoint = '/generate/code';
          payload = { prompt, language: 'javascript' };
          break;
        case 'summarize':
          endpoint = '/summarize';
          payload = { text: prompt };
          break;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        payload
      );

      if (response.data.success) {
        if (activeTab === 'image') {
          setImageUrl(response.data.data);
        } else {
          setResult(response.data.data);
        }
      } else {
        setResult(`Error: ${response.data.error || 'Generation failed'}`);
      }
    } catch (error) {
      console.error('Generation error:', error);
      setResult(error.response?.data?.error || 'Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'text', name: 'Text Generation', icon: '📝', color: 'from-blue-500 to-cyan-500' },
    { id: 'image', name: 'Image Generation', icon: '🎨', color: 'from-purple-500 to-pink-500' },
    { id: 'code', name: 'Code Generation', icon: '💻', color: 'from-green-500 to-emerald-500' },
    { id: 'summarize', name: 'Summarization', icon: '📄', color: 'from-orange-500 to-red-500' },
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-3">
            AI Generation Studio
          </h1>
          <p className="text-gray-400">
            Powered by Hugging Face • {activeTab === 'image' ? '20+ Image Models' : 'Multiple AI Models'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setResult('');
                setImageUrl('');
                setPrompt('');
                if (models[tab.id] && models[tab.id].length > 0) {
                  setSelectedModel(models[tab.id][0].id);
                }
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-purple-500/25`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700">
          {activeTab !== 'image' && models[activeTab] && models[activeTab].length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {models[activeTab].map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.description}
                  </option>
                ))}
              </select>
            </div>
          )}

       
          {activeTab === 'image' && (
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-xl">
              <p className="text-sm text-blue-300">
                🎨 {models.image?.length || 10}+ image models available. Will automatically try different models until one succeeds!
              </p>
            </div>
          )}

          
          {activeTab === 'text' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Temperature: {parameters.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={parameters.temperature}
                  onChange={(e) => setParameters({ ...parameters, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Higher = more creative</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Tokens: {parameters.maxTokens}
                </label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="50"
                  value={parameters.maxTokens}
                  onChange={(e) => setParameters({ ...parameters, maxTokens: parseInt(e.target.value) })}
                  className="w-full accent-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Response length</p>
              </div>
            </div>
          )}

          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {activeTab === 'summarize' ? 'Text to Summarize' : 'Your Prompt'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                activeTab === 'code'
                  ? 'Example: "Create a function to fetch data from an API"'
                  : activeTab === 'image'
                  ? 'Example: "A beautiful sunset over mountains, digital art, 4k, highly detailed"'
                  : activeTab === 'summarize'
                  ? 'Paste your long text here for summarization...'
                  : 'Enter your prompt here...'
              }
              rows={activeTab === 'summarize' ? 8 : 5}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              disabled={loading}
            />
          </div>

        
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className={`w-full bg-gradient-to-r ${currentTab?.color || 'from-purple-500 to-pink-500'} text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-lg`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              `Generate ${activeTab === 'image' ? 'Image' : activeTab === 'code' ? 'Code' : activeTab === 'summarize' ? 'Summary' : 'Text'}`
            )}
          </button>

          {(result || imageUrl) && (
            <div className="mt-8 p-6 bg-gray-900/50 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-3">
                Generated Output:
              </h3>
              
              {imageUrl && (
                <div className="relative w-full h-96 mb-4 bg-gray-800 rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt="Generated"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              
              {result && (
                <div className="prose prose-invert max-w-none">
                  {activeTab === 'code' ? (
                    <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm text-green-400">{result}</code>
                    </pre>
                  ) : (
                    <ReactMarkdown>{result}</ReactMarkdown>
                  )}
                </div>
              )}
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    if (result) navigator.clipboard.writeText(result);
                    if (imageUrl) {
                      const link = document.createElement('a');
                      link.href = imageUrl;
                      link.download = `generated-${Date.now()}.png`;
                      link.click();
                    }
                  }}
                  className="text-sm text-purple-400 hover:text-purple-300 font-medium"
                >
                  {result ? '📋 Copy to Clipboard' : '💾 Download Image'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Powered by Hugging Face Inference API • Free tier with rate limits • {activeTab === 'image' ? 'Auto-fallback to 20+ models' : 'Multiple AI models available'}</p>
        </div>
      </div>
    </div>
  );
}