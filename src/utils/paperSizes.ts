export const PAPER_SIZES = {
  A4: {
    width: 210, // mm
    height: 297, // mm
    name: 'A4'
  },
  A3: {
    width: 297, // mm
    height: 420, // mm
    name: 'A3'
  },
  LETTER: {
    width: 216, // mm
    height: 279, // mm
    name: 'Carta'
  }
};

// Factor de conversión de mm a píxeles (96 DPI)
export const MM_TO_PX = 3.7795275591;

export const getPaperSizeInPixels = (paperSize: keyof typeof PAPER_SIZES) => {
  const size = PAPER_SIZES[paperSize];
  return {
    width: Math.round(size.width * MM_TO_PX),
    height: Math.round(size.height * MM_TO_PX),
    name: size.name
  };
}; 