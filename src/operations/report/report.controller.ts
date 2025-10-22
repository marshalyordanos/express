import { Injectable } from "@nestjs/common";
import { ReportUsecaseImpl } from "./report.usecase.impl";


@Injectable()
export class ReportMessageController{
    constructor(private readonly usecase: ReportUsecaseImpl){}
    
}