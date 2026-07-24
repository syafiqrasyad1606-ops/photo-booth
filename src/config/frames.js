import FilmFrame from "../components/frames/FilmFrame";
import KoreanFrame from "../components/frames/KoreanFrame";
import PolaroidFrame from "../components/frames/PolaroidFrame";
import ColorBlockFrame from "../components/frames/ColorBlockFrame";
import ScrapbookFrame from "../components/frames/ScrapbookFrame";

// `label` is included alongside `name` as an alias — some pickers read
// one, some read the other, so both are kept in sync here.
const FRAMES = {
  film: {
    id: "film",
    name: "Film Strip Analog",
    label: "Film Strip Analog",
    draw: FilmFrame,
  },

  korean: {
    id: "korean",
    name: "Studio Korea Minimalis",
    label: "Studio Korea Minimalis",
    draw: KoreanFrame,
  },

  polaroid: {
    id: "polaroid",
    name: "Polaroid Klasik",
    label: "Polaroid Klasik",
    draw: PolaroidFrame,
  },

  colorBlock: {
    id: "colorBlock",
    name: "Color Block Modern",
    label: "Color Block Modern",
    draw: ColorBlockFrame,
  },

  scrapbook: {
    id: "scrapbook",
    name: "Scrapbook",
    label: "Scrapbook",
    draw: ScrapbookFrame,
  },
};

export default FRAMES;