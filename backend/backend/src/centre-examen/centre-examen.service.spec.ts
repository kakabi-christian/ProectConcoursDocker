import { Test, TestingModule } from '@nestjs/testing';
import { CentreExamenService } from './centre-examen.service';
import { PrismaService } from '../prisma/prisma.service'; // ✅ Chemin relatif correct

describe('CentreExamenService', () => {
  let service: CentreExamenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CentreExamenService,
        // ✅ Mock PrismaService pour éviter les erreurs de dépendances
        {
          provide: PrismaService,
          useValue: {
            centreExamen: {
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

    service = module.get<CentreExamenService>(CentreExamenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
