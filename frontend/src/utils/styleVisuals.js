const HAIR_VARIANT = {
  "french-crop": { height: "38%", radius: "42% 42% 28% 28%", lift: "-4%" },
  "textured-quiff": { height: "44%", radius: "38% 38% 22% 22%", lift: "-8%" },
  "low-fade": { height: "40%", radius: "46% 46% 18% 18%", lift: "-2%" },
  "mid-fade": { height: "40%", radius: "44% 44% 16% 16%", lift: "-2%" },
  "buzz-cut": { height: "28%", radius: "50% 50% 40% 40%", lift: "2%" },
  "curtain-middle-part": { height: "46%", radius: "48% 48% 30% 30%", lift: "-6%" },
  "layered-cut": { height: "48%", radius: "50% 50% 32% 32%", lift: "-8%" },
  "hair-spa": { height: "52%", radius: "50% 50% 35% 35%", lift: "-6%" },
  "scalp-detox": { height: "48%", radius: "48% 48% 30% 30%", lift: "-4%" },
  "keratin-gloss": { height: "50%", radius: "46% 46% 28% 28%", lift: "-5%" },
  "mullet": { height: "52%", radius: "40% 40% 12% 12%", lift: "-4%" },
  "slick-back": { height: "42%", radius: "45% 45% 20% 20%", lift: "-5%" },
  "side-swept": { height: "44%", radius: "52% 38% 26% 26%", lift: "-6%" },
  "crew-cut": { height: "30%", radius: "48% 48% 36% 36%", lift: "0" },
  "mohawk-fade": { height: "50%", radius: "34% 34% 14% 14%", lift: "-10%" },
  "ai-recommendation": { height: "46%", radius: "48% 48% 28% 28%", lift: "-6%" },
};

const BEARD_VARIANT = {
  "clean-shave": { opacity: 0.08, height: "18%" },
  "light-stubble": { opacity: 0.35, height: "22%" },
  "heavy-stubble": { opacity: 0.5, height: "26%" },
  "goatee": { opacity: 0.55, height: "24%", narrow: true },
  "full-beard-fade": { opacity: 0.62, height: "34%" },
  "anchor-beard": { opacity: 0.58, height: "28%", narrow: true },
  "van-dyke": { opacity: 0.52, height: "26%", narrow: true },
  "french-beard": { opacity: 0.6, height: "30%" },
};

export function getHairVisual(styleId) {
  return HAIR_VARIANT[styleId] || HAIR_VARIANT["layered-cut"];
}

export function getBeardVisual(styleId) {
  return BEARD_VARIANT[styleId] || BEARD_VARIANT["light-stubble"];
}

export function hairFillStyle(style, activeTab) {
  if (activeTab === "hairColors" && style.hex) {
    return {
      background: `linear-gradient(180deg, ${style.hex} 0%, ${style.hex}99 55%, transparent 100%)`,
      mixBlendMode: "color",
      opacity: 0.82,
    };
  }
  const base = style.hex || "#1f1410";
  return {
    background: `linear-gradient(180deg, ${base}ee 0%, ${base}bb 45%, transparent 92%)`,
    mixBlendMode: "multiply",
    opacity: 0.88,
  };
}
