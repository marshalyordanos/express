import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailableReports() {
    return ['orders', 'drivers', 'deliveries', 'revenue'];
  }


  async downloadFile(id: string) {
    return { url: `/downloads/${id}.pdf` };
  }
}
