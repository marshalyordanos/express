import { Injectable } from "@nestjs/common";
import { AnalyticsRepository } from "../repositories/analytics.repository";

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepo: AnalyticsRepository) {}

}
