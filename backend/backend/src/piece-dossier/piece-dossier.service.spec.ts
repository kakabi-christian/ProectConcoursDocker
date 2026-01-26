import { Test, TestingModule } from '@nestjs/testing';
import { PieceDossierService } from './piece-dossier.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PieceDossierService', () => {
  let service: PieceDossierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PieceDossierService,
        {
          provide: PrismaService,
          useValue: {
            pieceDossier: {
              findMany: jest.fn().mockResolvedValue([]),
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({}),
              update: jest.fn().mockResolvedValue({}),
              delete: jest.fn().mockResolvedValue({}),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PieceDossierService>(PieceDossierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
