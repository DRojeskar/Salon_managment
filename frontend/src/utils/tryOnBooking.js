function normalize(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function serviceLabel(service) {
  return String(service?.title || service?.name || "").trim();
}

const TAB_KEYWORDS = {
  hairCuts: ["haircut", "haircutting", "hairstyl", "haircutand", "frenchcrop"],
  hairColors: ["haircolor", "colour", "color", "balayage", "highlights"],
  beardStyles: ["beard", "grooming", "shave", "trim"],
  spa: ["hairspa", "spa", "keratin", "scalp", "botox", "treatment", "haircare"],
};

function scoreService(service, needles) {
  const label = normalize(serviceLabel(service));
  if (!label) return 0;
  let score = 0;
  for (const needle of needles) {
    const key = normalize(needle);
    if (!key) continue;
    if (label === key) score += 100;
    else if (label.includes(key) || key.includes(label)) score += 40;
  }
  return score;
}

/** Try-on style ko salon ki actual service list se map karta hai (backend validation ke liye). */
export function resolveTryOnSalonService({ activeTab, selectedStyle, services = [] }) {
  const list = Array.isArray(services) ? services : [];
  if (!list.length) return null;

  const styleName = String(selectedStyle?.name || "").trim();
  const styleKey = normalize(styleName);

  if (styleKey) {
    const exact = list.find((item) => normalize(serviceLabel(item)) === styleKey);
    if (exact) {
      return { service: serviceLabel(exact), serviceId: exact.id };
    }

    const partial = list.find((item) => {
      const label = normalize(serviceLabel(item));
      return label.includes(styleKey) || styleKey.includes(label);
    });
    if (partial) {
      return { service: serviceLabel(partial), serviceId: partial.id };
    }
  }

  const tabKeys = TAB_KEYWORDS[activeTab] || TAB_KEYWORDS.hairCuts;
  const ranked = [...list]
    .map((item) => ({ item, score: scoreService(item, tabKeys) }))
    .sort((a, b) => b.score - a.score);

  if (ranked[0]?.score > 0) {
    const best = ranked[0].item;
    return { service: serviceLabel(best), serviceId: best.id };
  }

  const fallback = list[0];
  return { service: serviceLabel(fallback), serviceId: fallback.id };
}
