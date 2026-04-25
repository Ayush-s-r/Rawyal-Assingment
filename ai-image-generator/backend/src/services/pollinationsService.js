export const generateImage = async (prompt, referenceLink) => {
  const finalPrompt = `${prompt}${
    referenceLink ? `. Inspired by ${referenceLink}` : ""
  }, ultra realistic, high quality, 4k, detailed`;

  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    finalPrompt
  )}`;

  return {
    image: imageUrl,
    modelUsed: "Pollinations (free)",
  };
};