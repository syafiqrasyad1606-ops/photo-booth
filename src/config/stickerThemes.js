// Sticker positions are edge-based, not raw pixel coordinates — each
// sticker declares which margin it lives on (left/right/bottom) and how
// far along that edge (0 = start, 1 = end). composeScrapbookStrip.js
// converts these into actual canvas coordinates based on the current
// PAD/photo stack height, so the layout stays correct no matter the
// shot count or if PAD gets tuned later.

import selaiStrawberry from "../assets/stickers/selai strawberry.png";
import cupCake from "../assets/stickers/cup cake.png";
import strawberry from "../assets/stickers/strawberry.png";
import cake from "../assets/stickers/cake.png";
import flower from "../assets/stickers/flower.png";

import pita from "../assets/stickers/pita.png";
import ribbon from "../assets/stickers/ribbon.png";
import cat from "../assets/stickers/cat.png";
import bouqet from "../assets/stickers/bouqet.png";

import letter from "../assets/stickers/letter.png";
import loveWrite from "../assets/stickers/love write.png";

import street1 from "../assets/stickers/street1.png";
import street2 from "../assets/stickers/street2.png";
import street3 from "../assets/stickers/street3.png";
import street4 from "../assets/stickers/street4.png";
import street5 from "../assets/stickers/street5.png";
import street6 from "../assets/stickers/street6.png";

import flowerOrange from "../assets/stickers/flower orange.png";
import sun from "../assets/stickers/sun.png";
import goodVibes from "../assets/stickers/good vibes.png";
import flowerGoodVibes from "../assets/stickers/flower good vibes.png";
import yellowCat from "../assets/stickers/yellow cat.png";
import yellowCat2 from "../assets/stickers/yellow cat 2.png";
import cute from "../assets/stickers/cute.png";

const STICKER_THEMES = {
  sweetHoney: {
    id: "sweetHoney",
    name: "Sweet & Honey",
    bg: "#F6DCE0",
    badgeText: "SWEET",
    photoShape: "rounded",
    stickers: [
      { edge: "left", along: 0.10, size: 139, src: flower, rotation: -8 },
      { edge: "left", along: 0.40, size: 147, src: selaiStrawberry, rotation: 6 },
      { edge: "left", along: 0.72, size: 134, src: cake, rotation: -5 },
      { edge: "right", along: 0.18, size: 144, src: cupCake, rotation: 8 },
      { edge: "right", along: 0.55, size: 125, src: strawberry, rotation: -6 },
      { edge: "bottom", along: 0.85, size: 152, src: strawberry, rotation: 0 },
    ],
  },

  ribbonCherry: {
    id: "ribbonCherry",
    name: "Ribbon & Cherry",
    bg: "#F7C9D6",
    badgeText: "CUTE",
    photoShape: "rounded",
    stickers: [
      { edge: "left", along: 0.12, size: 134, src: pita, rotation: -6 },
      { edge: "left", along: 0.50, size: 147, src: cat, rotation: 4 },
      { edge: "right", along: 0.22, size: 157, src: ribbon, rotation: 8 },
      { edge: "right", along: 0.60, size: 130, src: bouqet, rotation: -8 },
      { edge: "bottom", along: 0.15, size: 130, src: ribbon, rotation: -4 },
    ],
  },

  loveLetter: {
    id: "loveLetter",
    name: "Love Letter",
    bg: "#F3D9DE",
    badgeText: "I LOVE YOU",
    photoShape: "rounded",
    stickers: [
      { edge: "left", along: 0.15, size: 134, src: letter, rotation: -5 },
      { edge: "left", along: 0.55, size: 139, src: flower, rotation: 6 },
      { edge: "right", along: 0.20, size: 144, src: loveWrite, rotation: 5 },
      { edge: "right", along: 0.60, size: 130, src: ribbon, rotation: -6 },
    ],
  },

  heart: {
    id: "heart",
    name: "Heart",
    bg: "#F8D4DA",
    badgeText: "I LOVE YOU",
    photoShape: "heart",
    stickers: [
      { edge: "left", along: 0.15, size: 125, src: bouqet, rotation: -6 },
      { edge: "left", along: 0.55, size: 130, src: cat, rotation: 5 },
      { edge: "right", along: 0.20, size: 134, src: ribbon, rotation: 6 },
      { edge: "right", along: 0.60, size: 125, src: flower, rotation: -5 },
    ],
  },

  graffitiStreet: {
    id: "graffitiStreet",
    name: "Graffiti Street Art",
    bg: "#2B2B2E",
    textColor: "#FFFFFF",
    badgeText: "FREAK",
    photoShape: "rounded",
    stickers: [
      { edge: "left", along: 0.10, size: 157, src: street1, rotation: -6 },
      { edge: "left", along: 0.42, size: 147, src: street3, rotation: 4 },
      { edge: "left", along: 0.75, size: 144, src: street5, rotation: -4 },
      { edge: "right", along: 0.18, size: 157, src: street2, rotation: 6 },
      { edge: "right", along: 0.50, size: 139, src: street6, rotation: -6 },
      { edge: "right", along: 0.82, size: 147, src: street4, rotation: 5 },
    ],
  },

  retroGoodVibes: {
    id: "retroGoodVibes",
    name: "Retro 90's Good Vibes",
    bg: "#FBE7B6",
    badgeText: "GOOD VIBES",
    photoShape: "rounded",
    stickers: [
      { edge: "left", along: 0.12, size: 144, src: sun, rotation: -8 },
      { edge: "left", along: 0.48, size: 139, src: flowerOrange, rotation: 6 },
      { edge: "left", along: 0.80, size: 134, src: cute, rotation: -5 },
      { edge: "right", along: 0.20, size: 147, src: yellowCat, rotation: 8 },
      { edge: "right", along: 0.58, size: 134, src: flowerGoodVibes, rotation: -6 },
      { edge: "right", along: 0.85, size: 130, src: yellowCat2, rotation: 5 },
    ],
  },
};

export default STICKER_THEMES;