// src/utils/qr-code.helper.ts
import { Order, ServiceType, ShipmentType, ShippingScope } from '@prisma/client';
import QRCode from 'qrcode';

export interface OrderQRCodeData {
  trackingCode: string;
  branchId?: string;
  serviceType: ServiceType; // ServiceType enum string
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  deliveryAddress: string;
  batchId?: string;
  shippingScope: ShippingScope; // ShippingScope enum string
  shipmentType: ShipmentType; // ShipmentType enum string
}

export interface ScanResult {
  valid: boolean;
  orderId?: string;
  batchId?: string;
  notes?: string;
  payload?: OrderQRCodeData;
}

export async function generateOrderQRCode(data: OrderQRCodeData): Promise<string> {
  // Convert data to JSON string to encode in QR
  const payload = JSON.stringify(data);

  // Generate QR code as a Base64 string
  const qrCodeBase64 = await QRCode.toDataURL(payload);

  return qrCodeBase64;
}


export function decodeAndValidateQRCode(
  scannedToken: string,
  order: Order
): ScanResult {
  let payload: OrderQRCodeData;

  try {
    // Decode Base64 Data URL
    const jsonString = Buffer.from(scannedToken.split(',')[1], 'base64').toString();
    payload = JSON.parse(jsonString);
  } catch (err) {
    return { valid: false, notes: 'Invalid QR token' };
  }

  // Compare decoded payload with DB order
  if (payload.trackingCode !== order.trackingCode) {
    return { valid: false, orderId: order.id, notes: 'Tracking code mismatch', payload };
  }

  if (payload.batchId && payload.batchId !== order.batchId) {
    return { valid: false, orderId: order.id, batchId: order.batchId, notes: 'Batch mismatch', payload };
  }

  if (payload.branchId && payload.branchId !== order.branchId) {
    return { valid: false, orderId: order.id, notes: 'Branch mismatch', payload };
  }

  if (payload.serviceType !== order.serviceType) {
    return { valid: false, orderId: order.id, notes: 'Service type mismatch', payload };
  }

  if (payload.weight !== order.weight) {
    return { valid: false, orderId: order.id, notes: 'Weight mismatch', payload };
  }

  if (payload.length !== order.length) {
    return { valid: false, orderId: order.id, notes: 'Length mismatch', payload };
  }

  if (payload.width !== order.width) {
    return { valid: false, orderId: order.id, notes: 'Width mismatch', payload };
  }

  if (payload.height !== order.height) {
    return { valid: false, orderId: order.id, notes: 'Height mismatch', payload };
  }

  if (payload.deliveryAddress !== order.deliveryAddress) {
    return { valid: false, orderId: order.id, notes: 'Delivery address mismatch', payload };
  }

  if (payload.shippingScope !== order.shippingScope) {
    return { valid: false, orderId: order.id, notes: 'Shipping scope mismatch', payload };
  }

  if (payload.shipmentType !== order.shipmentType) {
    return { valid: false, orderId: order.id, notes: 'Shipment type mismatch', payload };
  }

  return { valid: true, orderId: order.id, batchId: order.batchId, payload };
}