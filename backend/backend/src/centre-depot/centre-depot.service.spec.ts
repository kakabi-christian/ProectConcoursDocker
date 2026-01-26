import { Test, TestingModule } from '@nestjs/testing';
import { CentreDepotService } from './centre-depot.service';
import { PrismaService } from '../prisma/prisma.service'; // ✅ Chemin relatif

describe('CentreDepotService', () => {
  let service: CentreDepotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CentreDepotService,
        // ✅ Mock PrismaService pour éviter les erreurs de dépendances
        {
          provide: PrismaService,
          useValue: {
            centreDepot: {
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

    service = module.get<CentreDepotService>(CentreDepotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
