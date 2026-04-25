"use client";

import { useState } from "react";
import { generateImage } from "../services/imageService";

export default function GeneratorForm({ setImage }) {
  const [prompt, setPrompt] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt) {
      alert("Please enter a product description");
      return;
    }

    setLoading(true);

    try {
      const res = await generateImage({
        prompt,
        referenceLink: link,
      });

      setImage(res.image);

    } catch (err) {
      const msg = err.response?.data?.error || err.message;

      // 🔥 Retry if model is loading
      if (msg.toLowerCase().includes("loading")) {
        alert("Model is loading... retrying in 5 seconds");

        setTimeout(() => {
          handleSubmit();
        }, 5000);

      } else {
        alert(msg);
      }
    }

    setLoading(false);
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl w-full max-w-lg">
      <input
        type="text"
        placeholder="Enter product description"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
      />

      <input
        type="text"
        placeholder="Reference product link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Generating..." : "Generate Image"}
      </button>
    </div>
  );
}