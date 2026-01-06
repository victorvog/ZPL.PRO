import { jsPDF } from "jspdf";
import { ZplFile } from "../types";

export const generateLabelsPdf = async (files: ZplFile[]): Promise<void> => {
  if (files.length === 0) return;

  // 4x6 inches in mm is roughly 101.6 x 152.4
  // jsPDF unit 'mm', format [100, 150] (approx 4x6)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [101.6, 152.4] 
  });

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.imageUrl) {
      if (i > 0) {
        doc.addPage([101.6, 152.4], "portrait");
      }
      
      // Add image to PDF. 
      // We assume the image URL is a blob URL. We need to fetch it to get base64 or add directly if supported
      try {
        const img = new Image();
        img.src = file.imageUrl;
        await new Promise((resolve) => {
            img.onload = resolve;
        });

        // Stretch to fit 4x6 page
        doc.addImage(img, 'PNG', 0, 0, 101.6, 152.4);
      } catch (e) {
        console.error("Error adding image to PDF", e);
      }
    }
  }

  doc.save("etiquetas-envio.pdf");
};