// import { Injectable, Logger } from '@nestjs/common';
// import * as Tesseract from 'tesseract.js';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';

// interface LicenseInfo {
//   licenseNumber: string | null;
//   fullName: string | null;
//   dob: string | null;
//   sex: string | null;
//   nationality: string | null;
//   bloodType: string | null;
//   issueDate: string | null;
//   expiryDate: string | null;
//   phone: string | null;
//   address?: string | null;
//   grade?: string | null;
//   raw: string;
// }

// @Injectable()
// export class CommonOCRService {
//   private readonly logger = new Logger(CommonOCRService.name);
// //   private readonly tessPath: string;

// //   constructor() {
//     // Resolve __dirname for ESM
//     // const __filename = fileURLToPath(import.meta.url);
//     // const __dirname = dirname(__filename);
//     // this.tessPath = join(__dirname, 'tessdata'); // make sure amh.traineddata is here
//     // this.logger.log(`Tessdata folder resolved at: ${this.tessPath}`);
// //   }
// // 
//   /** Public entry point */
//   async extractFromImage(imageUrl: string): Promise<LicenseInfo | null> {
//     try {
//       const rawText = await this.runTesseract(imageUrl);
//       const cleaned = this.cleanOcrNoise(rawText);
//       return (
//         this.parseEthiopianLicense(cleaned) ?? this.parseGenericLicense(cleaned)
//       );
//     } catch (err) {
//       this.logger.error('OCR extraction failed', err);
//       return null;
//     }
//   }

//   /** Tesseract OCR call */
//   private async runTesseract(imageUrl: string): Promise<string> {
//     this.logger.log(`Tesseract OCR START → ${imageUrl}`);

//     try {
//   const tessPath = join(__dirname, 'tessdata');
// console.log("Path ::: ", tessPath);

//       const { data } = await Tesseract.recognize(imageUrl, 'amh+eng', {
//         langPath: tessPath,
//         logger: (m) => this.logger.debug(`Tesseract: ${m.status}`),
//       });

//       this.logger.log(`Tesseract OCR SUCCESS → ${data.text.substring(0, 200)}...`);
//       return data.text;
//     } catch (error) {
//       this.logger.error('Tesseract OCR ERROR', error);
//       return '';
//     }
//   }

//   /** Clean OCR noise / watermarks */
//   private cleanOcrNoise(text: string): string {
//     const watermarks = [
//       /doctempl\.com/gi,
//       /mytempl\.com/gi,
//       /edutempl\.com/gi,
//       /axtempl\.com/gi,
//       /extempl\.com/gi,
//       /gotempl\.com/gi,
//       /ps/gi,
//     ];
//     let clean = text;
//     for (const w of watermarks) clean = clean.replace(w, '');
//     return clean.replace(/\s+/g, ' ').trim();
//   }

//   /** Ethiopian License parser */
//   private parseEthiopianLicense(text: string): LicenseInfo | null {
//     if (!/Ethiopian\s+Driving\s+License/i.test(text)) return null;

//     const info: LicenseInfo = {
//       licenseNumber: null,
//       fullName: null,
//       dob: null,
//       sex: null,
//       nationality: null,
//       bloodType: null,
//       issueDate: null,
//       expiryDate: null,
//       phone: null,
//       address: null,
//       grade: null,
//       raw: text,
//     };

//     info.licenseNumber = text.match(/License\s+No[.\s]*[:\-]?\s*([0-9]+)/i)?.[1] ?? null;

//     info.fullName = text.match(/Full\s+Name[.\s]*[:\-]?\s*([A-Za-z\u1200-\u137F ]+?)(?:\s{2,}|$)/i)?.[1]?.trim() ?? null;

//     const dobEng = text.match(/DOB[.\s]*[:\-]?\s*([\d\/\.]{8,10})/i);
//     const dobAmh = text.match(/የተወለዱ[.\s]*[:\-]?\s*([\d\/\.]{8,10})/);
//     info.dob = (dobEng?.[1] ?? dobAmh?.[1] ?? null)?.replace(/\./g, '/');

//     info.sex = text.match(/Sex[.\s]*[:\-]?\s*([MF])/i)?.[1] ?? null;

//     info.nationality = text.match(/Nationality[.\s]*[:\-]?\s*([A-Za-z\u1200-\u137F]+)/i)?.[1] ?? null;

//     info.bloodType = text.match(/Blood\s+Type[.\s]*[:\-]?\s*([OAB±\+-]+)/i)?.[1] ?? null;

//     info.issueDate = text.match(/Issue\s+Date[.\s]*[:\-]?\s*([\d\/\.]{8,10})/i)?.[1]?.replace(/\./g, '/') 
//       ?? text.match(/የሚያወጣበት[.\s]*[:\-]?\s*([\d\/\.]{8,10})/)?.[1]?.replace(/\./g, '/') 
//       ?? null;

//     info.expiryDate = text.match(/Expiry?\s+Date[.\s]*[:\-]?\s*([\d\/\.]{8,10})/i)?.[1]?.replace(/\./g, '/') 
//       ?? text.match(/የሚያበቃበት[.\s]*[:\-]?\s*([\d\/\.]{8,10})/)?.[1]?.replace(/\./g, '/') 
//       ?? null;

//     info.phone = text.match(/0\d{9}/)?.[0] ?? null;

//     return info;
//   }

//   /** Generic fallback parser */
//   private parseGenericLicense(text: string): LicenseInfo {
//     const clean = text.replace(/\s+/g, ' ').trim();

//     return {
//       licenseNumber: clean.match(/(?:LIC|DL|DR|License\s*No)[\s.:-]*([A-Z0-9]+)/i)?.[1] ?? null,
//       fullName: clean.match(/Full\s*Name[\s.:-]*([A-Za-z\u1200-\u137F ]+?)(?:\s{2,}|$)/i)?.[1] ?? null,
//       dob: clean.match(/DOB[\s.:-]*([\d\/\.]{8,10})/i)?.[1]?.replace(/\./g, '/') ?? null,
//       sex: clean.match(/Sex[\s.:-]*([MF])/i)?.[1] ?? null,
//       nationality: clean.match(/Nationality[\s.:-]*([A-Za-z\u1200-\u137F]+)/i)?.[1] ?? null,
//       bloodType: clean.match(/Blood\s*Type[\s.:-]*([OAB±\+-]+)/i)?.[1] ?? null,
//       issueDate: clean.match(/(?:ISS|Issue\s*Date)[\s.:-]*([\d\/\.]{8,10})/i)?.[1]?.replace(/\./g, '/') ?? null,
//       expiryDate: clean.match(/(?:EXP|Expiry?\s*Date)[\s.:-]*([\d\/\.]{8,10})/i)?.[1]?.replace(/\./g, '/') ?? null,
//       phone: clean.match(/(\+?\d{9,15})/)?.[1] ?? null,
//       raw: clean,
//     };
//   }
// }


import { Injectable, Logger } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

interface LicenseInfo {
  licenseNumber: string | null;
  fullName: string | null;
  dob: string | null;
  sex: string | null;
  nationality: string | null;
  bloodType: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  phone: string | null;
  address?: string | null;
  grade?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  raw: string;
}

@Injectable()
export class CommonOCRService {
  private readonly logger = new Logger(CommonOCRService.name);

  /** Public entry point */
  async extractFromImage(imageUrl: string): Promise<LicenseInfo | null> {
    try {
      const rawText = await this.runTesseract(imageUrl);
      const cleaned = this.cleanOcrNoise(rawText);
      const info =
        this.parseEthiopianLicense(cleaned) ?? this.parseGenericLicense(cleaned);

      // normalize fields
      if (info.dob) info.dob = this.normalizeDate(info.dob);
      if (info.issueDate) info.issueDate = this.normalizeDate(info.issueDate);
      if (info.expiryDate) info.expiryDate = this.normalizeDate(info.expiryDate);

      return info;
    } catch (err) {
      this.logger.error('OCR extraction failed', err);
      return null;
    }
  }

  /** Tesseract OCR call */
  private async runTesseract(imageUrl: string): Promise<string> {
    this.logger.log(`Tesseract OCR START → ${imageUrl}`);

    try {
          const tessPath = join(__dirname, 'tessdata');
console.log("Path ::: ", tessPath);

    //   const __filename = fileURLToPath(import.meta.url);
    //   const __dirname = dirname(__filename);
    //   const tessPath = join(__dirname, 'tessdata');

      const { data } = await Tesseract.recognize(imageUrl, 'amh+eng', {
        langPath: tessPath,
        logger: (m) => this.logger.debug(`Tesseract: ${m.status}`),
      });

      this.logger.log(
        `Tesseract OCR SUCCESS → ${data.text.substring(0, 200)}...`
      );
      return data.text;
    } catch (error) {
      this.logger.error('Tesseract OCR ERROR', error);
      return '';
    }
  }

  /** Remove watermark / OCR noise */
  private cleanOcrNoise(text: string): string {
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
    for (const w of watermarks) clean = clean.replace(w, '');
    return clean.replace(/\s+/g, ' ').trim();
  }

  /** Normalize dates to MM/DD/YYYY */
  private normalizeDate(dateStr: string): string {
    const parts = dateStr.match(/(\d{1,4})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/);
    if (!parts) return dateStr;
    let [_, p1, p2, p3] = parts;
    if (p3.length === 2) p3 = '19' + p3; // handle 2-digit years
    return `${p1.padStart(2, '0')}/${p2.padStart(2, '0')}/${p3}`;
  }

  /** Ethiopian License parser */
  private parseEthiopianLicense(text: string): LicenseInfo | null {
    if (!/Ethiopian\s+Driving\s+License|የኢተዮጵያ\s+የአሸከርካሪ/i.test(text))
      return null;

    const info: LicenseInfo = {
      licenseNumber: text.match(/License\s*No[.\s]*[:\-]?\s*([0-9]+)/i)?.[1] ??
        text.match(/ፈቃድ\s*ቁ\.[\s]*\[([0-9]+)/)?.[1] ??
        null,
      fullName:
        text.match(/Full\s*Name[.\s]*[:\-]?\s*([A-Za-z\u1200-\u137F ]+)/i)?.[1] ??
        text.match(/([A-Za-z\u1200-\u137F ]+)\s+፤/i)?.[1] ??
        null,
      dob:
        text.match(/DOB[.\s]*[:\-]?\s*([\d\/\.]+)/i)?.[1] ??
        text.match(/ቀን\s*([\d\/\.]+)/)?.[1] ??
        null,
      sex: text.match(/Sex[.\s]*[:\-]?\s*([MF])/i)?.[1] ?? null,
      nationality:
        text.match(/Nationality[.\s]*[:\-]?\s*([A-Za-z\u1200-\u137F]+)/i)?.[1] ??
        text.match(/ኢትዮጵያዊ/i)?.[0] ??
        'Ethiopian',
      bloodType: text.match(/Blood\s*Type[.\s]*[:\-]?\s*([OAB±\+-]+)/i)?.[1] ??
        null,
      issueDate:
        text.match(/Issue\s*Date[.\s]*[:\-]?\s*([\d\/\.]+)/i)?.[1] ??
        text.match(/የተሰጠበት\s*ቀን[.\s]*[:\-]?\s*([\d\/\.]+)/)?.[1] ??
        null,
      expiryDate:
        text.match(/Expiry\s*Date[.\s]*[:\-]?\s*([\d\/\.]+)/i)?.[1] ??
        text.match(/የሚያበቃበት[.\s]*[:\-]?\s*([\d\/\.]+)/)?.[1] ??
        null,
      phone:
        text.match(/0\d{9}/)?.[0] ??
        text.match(/\+?\d{9,15}/)?.[0] ??
        null,
      address:
        text.match(/Region:?\s*([A-Za-z\u1200-\u137F ,]+)/i)?.[1] ?? null,
      grade:
        text.match(/Grade:?\s*([A-Za-z\u1200-\u137F]+)/i)?.[1] ?? null,
      emergencyContactName:
        text.match(/Emergency\s*Contact\s*Name[.\s]*[:\-]?\s*([A-Za-z\u1200-\u137F ]+)/i)?.[1] ?? null,
      emergencyContactPhone:
        text.match(/Emergency\s*Contact\s*Phone[.\s]*[:\-]?\s*(\+?\d{9,15})/i)?.[1] ?? null,
      raw: text,
    };

    return info;
  }

  /** Generic fallback parser */
  private parseGenericLicense(text: string): LicenseInfo {
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
}
