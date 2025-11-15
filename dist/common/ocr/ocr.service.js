"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CommonOCRService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonOCRService = void 0;
const common_1 = require("@nestjs/common");
const Tesseract = require("tesseract.js");
const path_1 = require("path");
let CommonOCRService = CommonOCRService_1 = class CommonOCRService {
    constructor() {
        this.logger = new common_1.Logger(CommonOCRService_1.name);
    }
    async extractFromImage(imageUrl) {
        try {
            const rawText = await this.runTesseract(imageUrl);
            const cleaned = this.cleanOcrNoise(rawText);
            const info = this.parseEthiopianLicense(cleaned) ?? this.parseGenericLicense(cleaned);
            if (info.dob)
                info.dob = this.normalizeDate(info.dob);
            if (info.issueDate)
                info.issueDate = this.normalizeDate(info.issueDate);
            if (info.expiryDate)
                info.expiryDate = this.normalizeDate(info.expiryDate);
            return info;
        }
        catch (err) {
            this.logger.error('OCR extraction failed', err);
            return null;
        }
    }
    async runTesseract(imageUrl) {
        this.logger.log(`Tesseract OCR START → ${imageUrl}`);
        try {
            const tessPath = (0, path_1.join)(__dirname, 'tessdata');
            console.log("Path ::: ", tessPath);
            const { data } = await Tesseract.recognize(imageUrl, 'amh+eng', {
                langPath: tessPath,
                logger: (m) => this.logger.debug(`Tesseract: ${m.status}`),
            });
            this.logger.log(`Tesseract OCR SUCCESS → ${data.text.substring(0, 200)}...`);
            return data.text;
        }
        catch (error) {
            this.logger.error('Tesseract OCR ERROR', error);
            return '';
        }
    }
    cleanOcrNoise(text) {
        const watermarks = [
            /doctempl\.com/gi,
            /mytempl\.com/gi,
            /edutempl\.com/gi,
            /axtempl\.com/gi,
            /extempl\.com/gi,
            /gotempl\.com/gi,
            /ps/gi,
        ];
        let clean = text;
        for (const w of watermarks)
            clean = clean.replace(w, '');
        return clean.replace(/\s+/g, ' ').trim();
    }
    normalizeDate(dateStr) {
        const parts = dateStr.match(/(\d{1,4})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/);
        if (!parts)
            return dateStr;
        let [_, p1, p2, p3] = parts;
        if (p3.length === 2)
            p3 = '19' + p3;
        return `${p1.padStart(2, '0')}/${p2.padStart(2, '0')}/${p3}`;
    }
    parseEthiopianLicense(text) {
        if (!/Ethiopian\s+Driving\s+License|የኢተዮጵያ\s+የአሸከርካሪ/i.test(text))
            return null;
        const info = {
            licenseNumber: text.match(/License\s*No[.\s]*[:\-]?\s*([0-9]+)/i)?.[1] ??
                text.match(/ፈቃድ\s*ቁ\.[\s]*\[([0-9]+)/)?.[1] ??
                null,
            fullName: text.match(/Full\s*Name[.\s]*[:\-]?\s*([A-Za-z\u1200-\u137F ]+)/i)?.[1] ??
                text.match(/([A-Za-z\u1200-\u137F ]+)\s+፤/i)?.[1] ??
                null,
            dob: text.match(/DOB[.\s]*[:\-]?\s*([\d\/\.]+)/i)?.[1] ??
                text.match(/ቀን\s*([\d\/\.]+)/)?.[1] ??
                null,
            sex: text.match(/Sex[.\s]*[:\-]?\s*([MF])/i)?.[1] ?? null,
            nationality: text.match(/Nationality[.\s]*[:\-]?\s*([A-Za-z\u1200-\u137F]+)/i)?.[1] ??
                text.match(/ኢትዮጵያዊ/i)?.[0] ??
                'Ethiopian',
            bloodType: text.match(/Blood\s*Type[.\s]*[:\-]?\s*([OAB±\+-]+)/i)?.[1] ??
                null,
            issueDate: text.match(/Issue\s*Date[.\s]*[:\-]?\s*([\d\/\.]+)/i)?.[1] ??
                text.match(/የተሰጠበት\s*ቀን[.\s]*[:\-]?\s*([\d\/\.]+)/)?.[1] ??
                null,
            expiryDate: text.match(/Expiry\s*Date[.\s]*[:\-]?\s*([\d\/\.]+)/i)?.[1] ??
                text.match(/የሚያበቃበት[.\s]*[:\-]?\s*([\d\/\.]+)/)?.[1] ??
                null,
            phone: text.match(/0\d{9}/)?.[0] ??
                text.match(/\+?\d{9,15}/)?.[0] ??
                null,
            address: text.match(/Region:?\s*([A-Za-z\u1200-\u137F ,]+)/i)?.[1] ?? null,
            grade: text.match(/Grade:?\s*([A-Za-z\u1200-\u137F]+)/i)?.[1] ?? null,
            emergencyContactName: text.match(/Emergency\s*Contact\s*Name[.\s]*[:\-]?\s*([A-Za-z\u1200-\u137F ]+)/i)?.[1] ?? null,
            emergencyContactPhone: text.match(/Emergency\s*Contact\s*Phone[.\s]*[:\-]?\s*(\+?\d{9,15})/i)?.[1] ?? null,
            raw: text,
        };
        return info;
    }
    parseGenericLicense(text) {
        const clean = text.replace(/\s+/g, ' ').trim();
        return {
            licenseNumber: clean.match(/(?:LIC|DL|DR|License\s*No)[\s.:-]*([A-Z0-9]+)/i)?.[1] ?? null,
            fullName: clean.match(/Full\s*Name[\s.:-]*([A-Za-z\u1200-\u137F ]+?)(?:\s{2,}|$)/i)?.[1] ?? null,
            dob: clean.match(/DOB[\s.:-]*([\d\/\.]{8,10})/i)?.[1]?.replace(/\./g, '/') ?? null,
            sex: clean.match(/Sex[\s.:-]*([MF])/i)?.[1] ?? null,
            nationality: clean.match(/Nationality[\s.:-]*([A-Za-z\u1200-\u137F]+)/i)?.[1] ?? null,
            bloodType: clean.match(/Blood\s*Type[\s.:-]*([OAB±\+-]+)/i)?.[1] ?? null,
            issueDate: clean.match(/(?:ISS|Issue\s*Date)[\s.:-]*([\d\/\.]{8,10})/i)?.[1]?.replace(/\./g, '/') ?? null,
            expiryDate: clean.match(/(?:EXP|Expiry?\s*Date)[\s.:-]*([\d\/\.]{8,10})/i)?.[1]?.replace(/\./g, '/') ?? null,
            phone: clean.match(/(\+?\d{9,15})/)?.[1] ?? null,
            raw: clean,
        };
    }
};
exports.CommonOCRService = CommonOCRService;
exports.CommonOCRService = CommonOCRService = CommonOCRService_1 = __decorate([
    (0, common_1.Injectable)()
], CommonOCRService);
//# sourceMappingURL=ocr.service.js.map