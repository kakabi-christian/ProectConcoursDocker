import { Test, TestingModule } from '@nestjs/testing';
import { BatimentService } from './batiment.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BatimentService', () => {
  let service: BatimentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatimentService,

        // ✅ Mock PrismaService
        {
          provide: PrismaService,
          useValue: {
            batiment: {
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

    service = module.get<BatimentService>(BatimentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
