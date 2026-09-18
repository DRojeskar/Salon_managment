/** Portrait vs landscape ke hisaab se face overlay box estimate karta hai. */
export function estimateFaceBounds(imageWidth, imageHeight) {
  const width = Number(imageWidth) || 1;
  const height = Number(imageHeight) || 1;
  const aspect = width / height;

  if (aspect < 0.82) {
    return { left: 16, top: 6, width: 68, height: 54 };
  }
  if (aspect > 1.25) {
    return { left: 30, top: 10, width: 40, height: 72 };
  }
  return { left: 22, top: 8, width: 56, height: 58 };
}

export function loadImageBoundsFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const bounds = estimateFaceBounds(image.naturalWidth, image.naturalHeight);
      URL.revokeObjectURL(url);
      resolve(bounds);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };
    image.src = url;
  });
}

export const SKIN_TONE_PHOTO_FILTER = {
  Fair: "brightness(1.08) saturate(0.92) contrast(1.02)",
  Light: "brightness(1.04) saturate(0.96)",
  Medium: "brightness(1) saturate(1.05)",
  Tan: "brightness(0.98) saturate(1.08) sepia(0.12)",
  Deep: "brightness(0.94) saturate(1.1) contrast(1.04)",
  Dark: "brightness(0.9) saturate(1.12) contrast(1.06)",
};

export function skinTonePhotoFilter(skinTone) {
  return SKIN_TONE_PHOTO_FILTER[skinTone] || "none";
}

/** Recommendation color text se preview tint */
export function inferHexFromColorText(colorText = "") {
  const text = String(colorText).toLowerCase();
  if (text.includes("honey") || text.includes("golden") || text.includes("caramel")) return "#c68e53";
  if (text.includes("ash") || text.includes("cool") || text.includes("beige")) return "#a89888";
  if (text.includes("burgundy") || text.includes("copper")) return "#9d3b4a";
  if (text.includes("espresso") || text.includes("jet") || text.includes("deep")) return "#2a1810";
  if (text.includes("chocolate") || text.includes("chestnut") || text.includes("mocha")) return "#6b3e2e";
  if (text.includes("champagne") || text.includes("fair")) return "#e8dcc8";
  return "#7a4e32";
}
