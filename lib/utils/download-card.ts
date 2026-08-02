import { toPng } from "html-to-image";

/**
 * Captures an HTML element and downloads it as a PNG image.
 */
export async function downloadCardAsImage(
  element: HTMLElement,
  filename: string = "celebration-card.png"
): Promise<void> {
  try {
    // Wait a brief moment to ensure animations are settled and fonts are loaded
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const dataUrl = await toPng(element, {
      quality: 0.95,
      pixelRatio: 2, // Retina quality
      style: {
        // Force the capture frame to be visible and stable
        transform: "none",
        borderRadius: "24px",
      },
    });

    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to download card image:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}
