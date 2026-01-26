import { Test, TestingModule } from '@nestjs/testing';
import { AnneeService } from './annee-academique.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnneeService', () => {
  let service: AnneeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnneeService,

        // ✅ Mock PrismaService
        {
          provide: PrismaService,
          useValue: {
            anneeAcademique: {
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

    service = module.get<AnneeService>(AnneeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
