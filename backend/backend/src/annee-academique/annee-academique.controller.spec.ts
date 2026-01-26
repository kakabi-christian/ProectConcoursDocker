import { Test, TestingModule } from '@nestjs/testing';
import { AnneeController } from './annee-academique.controller';
describe('AnneeAcademiqueController', () => {
  let controller: AnneeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnneeController],
    }).compile();

    controller = module.get<AnneeController>(AnneeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
