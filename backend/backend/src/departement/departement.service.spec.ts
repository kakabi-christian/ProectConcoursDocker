import { Test, TestingModule } from '@nestjs/testing';
import { DepartementService } from './departement.service';
import { PrismaService } from '../prisma/prisma.service'; // chemin relatif correct

describe('DepartementService', () => {
  let service: DepartementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartementService,
        // ✅ Mock PrismaService pour éviter les erreurs de dépendances
        {
          provide: PrismaService,
          useValue: {
            departement: {
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

    service = module.get<DepartementService>(DepartementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
