import { Test, TestingModule } from '@nestjs/testing';
import { StatistiqueService } from './statistique.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StatistiqueService', () => {
  let service: StatistiqueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatistiqueService,
        {
          provide: PrismaService,
          useValue: {
            // Mock des méthodes Prisma les plus probables utilisées dans StatistiqueService
            candidat: {
              findMany: jest.fn().mockResolvedValue([]),
              count: jest.fn().mockResolvedValue(0),
            },
            concours: {
              findMany: jest.fn().mockResolvedValue([]),
              count: jest.fn().mockResolvedValue(0),
            },
            centreDepot: {
              findMany: jest.fn().mockResolvedValue([]),
              count: jest.fn().mockResolvedValue(0),
            },
          },
        },
      ],
    }).compile();

    service = module.get<StatistiqueService>(StatistiqueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
