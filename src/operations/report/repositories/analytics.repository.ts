import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

}
