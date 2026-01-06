// Using Labelary API for public rendering. 
// Note: In a production environment, you might want a backend proxy to avoid rate limits or strict CORS,
// but Labelary is the standard for client-side demos.

export const renderZplToImage = async (zpl: string): Promise<string> => {
  try {
    // 8dpmm is standard for 203dpi thermal printers. 4x6 inches is standard shipping label size.
    const url = `https://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/`;
    
    const formData = new FormData();
    formData.append('file', new Blob([zpl], { type: 'text/plain' }));

    const response = await fetch(url, {
      method: 'POST',
      body: zpl, // Labelary accepts raw string body
      headers: {
        'Accept': 'image/png',
        // 'Content-Type': 'application/x-www-form-urlencoded' // Usually standard post works best
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao renderizar etiqueta');
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("ZPL Render Error:", error);
    // Return a placeholder or empty string to signal failure
    return ''; 
  }
};