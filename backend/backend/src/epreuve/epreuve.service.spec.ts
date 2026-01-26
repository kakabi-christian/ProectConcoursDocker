import { Test, TestingModule } from '@nestjs/testing';
import { EpreuveService } from './epreuve.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EpreuveService', () => {
  let service: EpreuveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EpreuveService,
        {
          provide: PrismaService,
          useValue: {
            epreuve: {
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

    service = module.get<EpreuveService>(EpreuveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
