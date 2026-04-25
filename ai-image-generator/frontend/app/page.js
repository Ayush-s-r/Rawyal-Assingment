"use client";

import { useState } from "react";
import GeneratorForm from "./components/GeneratorForm";
import ImagePreview from "./components/ImagePreview";

export default function Home() {
  const [image, setImage] = useState(null);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl mb-6 font-bold">
        Product Image Generator
      </h1>

      <GeneratorForm setImage={setImage} />
      <ImagePreview image={image} />
    </div>
  );
}