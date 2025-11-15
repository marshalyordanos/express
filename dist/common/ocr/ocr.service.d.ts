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
export declare class CommonOCRService {
    private readonly logger;
    extractFromImage(imageUrl: string): Promise<LicenseInfo | null>;
    private runTesseract;
    private cleanOcrNoise;
    private normalizeDate;
    private parseEthiopianLicense;
    private parseGenericLicense;
}
export {};
