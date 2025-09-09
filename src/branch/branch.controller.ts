import { Controller, Inject } from '@nestjs/common';
import { MessagePattern,Payload } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import { IResponse } from 'src/common/types';
import { handleCatch } from 'src/common/handleCatch';
import { Public } from 'src/common/decorator/public.decorator';
import { BranchCreateDto, BranchResponseDto,BranchUpdateDto } from './brach.branchDTO';
import { BranchUseCases } from './branch.useCase';
import { Branch } from '@prisma/client';

@Controller()
export class BranchController {
    constructor(@Inject('BranchUseCases')private readonly branchUseCase: BranchUseCases) {}

    @Public()
    @MessagePattern(PATTERNS.BRANCH_CREATE)
    async createBranch(@Payload() data: BranchCreateDto){
        try {      
        return this.branchUseCase.createBranch(data);
        } catch (error) {
            handleCatch(error);
        }
    }
    @Public()
    @MessagePattern(PATTERNS.BRANCH_FIND_BY_ID)
    async findBranchById(@Payload() data: {id: string}){
        try {      
        return this.branchUseCase.findBranchById(data.id);
        } catch (error) {
            handleCatch(error);
        }
    }
    @Public()
    @MessagePattern(PATTERNS.BRANCH_UPDATE)
    async updateBranch(@Payload() payload: {id: string, data: Partial<BranchUpdateDto>}){
        try {      
        return this.branchUseCase.updateBranch(payload.id,payload.data);
        } catch (error) {
            handleCatch(error);
        }
    }

    @Public()
    @MessagePattern(PATTERNS.BRANCH_DELETE)
    async deleteBranch(@Payload() data: {id: string}){
        try {      
        return this.branchUseCase.deleteBranch(data.id);
        } catch (error) {
            handleCatch(error);
        }
    }

    @Public()
    @MessagePattern(PATTERNS.BRANCH_FIND_ALL)
    async findAllBranches(){
        console.log('Branchs fetched successfully');
        
        try {      
            const branchs = await this.branchUseCase.findAllBranch();
        return new IResponse(true, 'Branchs fetched successfully', branchs, null);
        } catch (error) {
            handleCatch(error);
        }
    }

}
