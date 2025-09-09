import { Test, TestingModule } from '@nestjs/testing';
import { BranchGatewayController } from './branch.gateway.controller';

describe('BranchGatewayController', () => {
  let controller: BranchGatewayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BranchGatewayController],
    }).compile();

    controller = module.get<BranchGatewayController>(BranchGatewayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
