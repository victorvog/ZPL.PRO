// This service uses the Web Serial API to send raw ZPL bytes to a USB connected printer.

export const hasWebSerial = (): boolean => {
  return 'serial' in navigator;
};

export const printZplDirectly = async (zplContent: string) => {
  if (!hasWebSerial()) {
    alert("Seu navegador não suporta a Web Serial API. Tente usar o Chrome ou Edge.");
    return;
  }

  try {
    // Request permission to access the USB device
    // @ts-ignore - Web Serial types are often missing in standard TS configs
    const port = await navigator.serial.requestPort();
    
    // @ts-ignore
    await port.open({ baudRate: 9600 }); // Standard baud rate for many Zebra printers

    const encoder = new TextEncoder();
    const writer = port.writable.getWriter();
    
    await writer.write(encoder.encode(zplContent));
    
    writer.releaseLock();
    await port.close();
    
    return true;
  } catch (error) {
    console.error("Print Error:", error);
    throw error;
  }
};