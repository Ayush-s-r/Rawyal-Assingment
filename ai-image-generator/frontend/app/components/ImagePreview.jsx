"use client";

import { useState, useEffect } from "react";

export default function ImagePreview({ image, loading }) {
  const [retryKey, setRetryKey] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [showImage, setShowImage] = useState(false);

  // ⏳ wait before showing image (important for Pollinations)
  useEffect(() => {
    if (image) {
      setShowImage(false);
      setImgError(false);
      setRetryKey(0);

      const timer = setTimeout(() => {
        setShowImage(true);
      }, 1200); // wait 1.2s

      return () => clearTimeout(timer);
    }
  }, [image]);

  // 🔁 retry logic
  useEffect(() => {
    if (imgError && retryKey < 3) {
      const timer = setTimeout(() => {
        setRetryKey((prev) => prev + 1);
        setImgError(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [imgError, retryKey]);

  return (
    <div className="mt-8 w-full flex flex-col items-center">

      {/* 🔄 Loading */}
      {loading && (
        <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md text-center">
          <p className="text-gray-400 animate-pulse">
            Generating your product image...
          </p>
        </div>
      )}

      {/* 🖼️ Image */}
      {image && !loading && (
        <div className="bg-gray-900 p-4 rounded-2xl shadow-xl w-full max-w-md">

          {!showImage && (
            <div className="w-full h-[300px] bg-gray-800 animate-pulse rounded-xl mb-4 flex items-center justify-center text-gray-400">
              Preparing image...
            </div>
          )}

          {showImage && !imgError && (
            <img
              key={retryKey}
              src={image}
              alt="Generated"
              className="rounded-xl w-full object-cover mb-4 transition"
              onError={() => setImgError(true)}
            />
          )}

          {imgError && (
            <div className="text-yellow-400 text-sm mb-4 text-center">
              Retrying image load...
            </div>
          )}

          {/* 📥 Download */}
          <a
            href={image}
            target="_blank"
            className="block text-center bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium"
          >
            Open / Download Image
          </a>
        </div>
      )}

      {/* 💤 Empty */}
      {!image && !loading && (
        <div className="text-gray-500 text-sm mt-4">
          Your generated image will appear here
        </div>
      )}
    </div>
  );
}