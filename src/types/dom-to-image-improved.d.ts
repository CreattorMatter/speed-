declare module 'dom-to-image-improved' {
  interface DomToImageOptions {
    quality?: number;
    bgcolor?: string;
    cacheBust?: boolean;
    scale?: number;
  }

  export function toPng(node: HTMLElement, options?: DomToImageOptions): Promise<string>;
  export function toJpeg(node: HTMLElement, options?: DomToImageOptions): Promise<string>;
  export function toBlob(node: HTMLElement, options?: DomToImageOptions): Promise<Blob>;
  export function toPixelData(node: HTMLElement, options?: DomToImageOptions): Promise<Uint8ClampedArray>;

  const domtoimage: {
    toPng: typeof toPng;
    toJpeg: typeof toJpeg;
    toBlob: typeof toBlob;
    toPixelData: typeof toPixelData;
  };

  export default domtoimage;
} 