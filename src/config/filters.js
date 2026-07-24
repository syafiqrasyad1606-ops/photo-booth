// config/filters.js
const FILTERS = {
  normal: {
    id: "normal",
    label: "Normal",
    css: "",
  },

  bw: {
    id: "bw",
    label: "B&W",
    css: "grayscale(1) contrast(1.08)",
  },

  vintage: {
    id: "vintage",
    label: "Vintage",
    css: "sepia(0.5) saturate(1.3) contrast(0.92) brightness(1.06)",
  },

  // ========== FILTER BARU ==========
  warm: {
    id: "warm",
    label: "Warm",
    css: "saturate(1.2) brightness(1.05) sepia(0.2)",
  },

  cool: {
    id: "cool",
    label: "Cool",
    css: "saturate(1.1) brightness(0.95) hue-rotate(180deg) sepia(0.1)",
  },

  dramatic: {
    id: "dramatic",
    label: "Dramatic",
    css: "contrast(1.3) brightness(0.9) saturate(1.1)",
  },

  pastel: {
    id: "pastel",
    label: "Pastel",
    css: "saturate(0.7) brightness(1.1) contrast(0.9)",
  },

  neon: {
    id: "neon",
    label: "Neon",
    css: "saturate(1.8) contrast(1.2) hue-rotate(20deg)",
  },
};

export default FILTERS;