"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderQRCode = generateOrderQRCode;
exports.decodeAndValidateQRCode = decodeAndValidateQRCode;
const QRCode = require("qrcode");
async function generateOrderQRCode(data) {
    if (!data)
        throw new Error('Cannot generate QR: data is undefined');
    console.log('Generating QR for payload:', data);
    try {
        const payload = JSON.stringify({
            trackingCode: data.trackingCode,
            address: data.deliveryAddress,
            serviceType: data.serviceType,
            ShippingScope: data.shippingScope,
            ShipmentType: data.shipmentType,
            branchId: data.branchId,
            batchId: data.batchId,
            weight: data.weight,
            length: data.length,
            width: data.width,
            height: data.height,
        });
        const qrCodeBase64 = await QRCode.toDataURL(payload, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
        });
        return qrCodeBase64;
    }
    catch (err) {
        console.error('Failed to generate QR code:', err);
        throw new Error('QR code generation failed');
    }
}
function decodeAndValidateQRCode(scannedToken, order) {
    let payload;
    try {
        const jsonString = Buffer.from(scannedToken.split(',')[1], 'base64').toString();
        payload = JSON.parse(jsonString);
    }
    catch (err) {
        return { valid: false, notes: 'Invalid QR token' };
    }
    const validateField = (fieldName, payloadValue, orderValue) => {
        if (payloadValue !== undefined && payloadValue !== orderValue) {
            return `Mismatch on ${fieldName}: scanned=${payloadValue}, expected=${orderValue}`;
        }
        return null;
    };
    const validations = [
        validateField('trackingCode', payload.trackingCode, order.trackingCode),
        validateField('batchId', payload.batchId, order.batchId),
        validateField('branchId', payload.branchId, order.branchId),
        validateField('serviceType', payload.serviceType, order.serviceType),
        validateField('weight', payload.weight, order.weight),
        validateField('length', payload.length, order.length),
        validateField('width', payload.width, order.width),
        validateField('height', payload.height, order.height),
        validateField('deliveryAddressLine', payload.deliveryAddress?.addressLine, order.deliveryAddress?.addressLine),
        validateField('shippingScope', payload.shippingScope, order.shippingScope),
        validateField('shipmentType', payload.shipmentType, order.shipmentType),
    ].filter(Boolean);
    if (validations.length > 0) {
        return {
            valid: false,
            orderId: order.id,
            batchId: order.batchId,
            notes: validations.join('; '),
            payload,
        };
    }
    return { valid: true, orderId: order.id, batchId: order.batchId, payload };
}
//# sourceMappingURL=qr-code.helper.js.map