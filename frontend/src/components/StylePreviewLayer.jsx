import { getBeardVisual, getHairVisual, hairFillStyle } from "../utils/styleVisuals";
import { skinTonePhotoFilter } from "../utils/facePreview";

function regionStyle(faceBounds, overrides = {}) {
  if (!faceBounds) return undefined;
  return {
    top: `${faceBounds.top}%`,
    left: `${faceBounds.left}%`,
    width: `${faceBounds.width}%`,
    height: `${faceBounds.height}%`,
    ...overrides,
  };
}

function StylePreviewLayer({ style, activeTab, faceBounds, skinTone, showSpaGlow = false, colorHex }) {
  if (!faceBounds || !style) return null;

  const hairVisual = getHairVisual(style.id);
  const beardVisual = getBeardVisual(style.id);
  const fill = hairFillStyle({ ...style, hex: colorHex || style.hex }, activeTab);
  const skinFilter = skinTonePhotoFilter(skinTone);

  const hairLayerStyle = {
    ...regionStyle(faceBounds, { position: "absolute", zIndex: 2, pointerEvents: "none" }),
    filter: skinFilter !== "none" ? skinFilter : undefined,
  };

  const hairShapeStyle = {
    position: "absolute",
    left: "50%",
    transform: `translateX(-50%) translateY(${hairVisual.lift})`,
    width: hairVisual.radius.includes("52% 38%") ? "92%" : "88%",
    height: hairVisual.height,
    borderRadius: hairVisual.radius,
    ...fill,
  };

  const beardLayerStyle = {
    position: "absolute",
    left: "50%",
    bottom: "8%",
    transform: "translateX(-50%)",
    width: beardVisual.narrow ? "42%" : "72%",
    height: beardVisual.height,
    borderRadius: beardVisual.narrow ? "40% 40% 48% 48%" : "38% 38% 46% 46%",
    background: "linear-gradient(180deg, rgba(35,22,14,.75), rgba(20,12,8,.4))",
    opacity: beardVisual.opacity,
    mixBlendMode: "multiply",
    zIndex: 3,
  };

  const spaGlowStyle = {
    ...regionStyle(faceBounds, {
      position: "absolute",
      zIndex: 2,
      pointerEvents: "none",
      borderRadius: "18%",
      background: "radial-gradient(circle at 50% 30%, rgba(236,72,153,.35), transparent 70%)",
      boxShadow: "inset 0 0 40px rgba(167,139,250,.25)",
    }),
  };

  return (
    <>
      {activeTab === "hairCuts" || activeTab === "hairColors" ? (
        <div className="ai-style-visual-root" style={hairLayerStyle} aria-hidden="true">
          <div className={`ai-style-visual-hair ai-style-${style.id}`} style={hairShapeStyle} />
        </div>
      ) : null}

      {activeTab === "beardStyles" ? (
        <div className="ai-style-visual-root" style={regionStyle(faceBounds, { position: "absolute", zIndex: 2 })} aria-hidden="true">
          <div style={beardLayerStyle} />
        </div>
      ) : null}

      {activeTab === "spa" || showSpaGlow ? <div style={spaGlowStyle} aria-hidden="true" /> : null}

      <div
        className="ai-style-visual-label"
        style={{
          position: "absolute",
          zIndex: 4,
          top: `${Math.max(4, faceBounds.top - 2)}%`,
          left: `${faceBounds.left}%`,
          width: `${faceBounds.width}%`,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <span>{style.name}</span>
      </div>
    </>
  );
}

export default StylePreviewLayer;
