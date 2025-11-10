import { PrismaService } from "src/prisma/prisma.service";
export declare class ReportRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAvailableReports(): Promise<string[]>;
    downloadFile(id: string): Promise<{
        url: string;
    }>;
}
