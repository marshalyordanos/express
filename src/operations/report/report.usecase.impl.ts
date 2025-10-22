import { Injectable } from "@nestjs/common";
import { ReportUsecase } from "./report.usecase";
import { ReportRespository } from "./report.repository";

@Injectable()
export class ReportUsecaseImpl implements ReportUsecase{

    constructor(private readonly reportRepo: ReportRespository){}
}