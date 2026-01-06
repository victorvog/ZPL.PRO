export interface ZplFile {
  id: string;
  name: string;
  rawContent: string;
  imageUrl?: string;
  analysis?: ZplAnalysis;
  status: 'pending' | 'processing' | 'ready' | 'error';
}

export interface ZplAnalysis {
  recipientName: string;
  trackingNumber: string;
  carrier: string;
  destination: string;
}

export interface PrinterDevice {
  usbVendorId: number;
  usbProductId: number;
  name: string;
}