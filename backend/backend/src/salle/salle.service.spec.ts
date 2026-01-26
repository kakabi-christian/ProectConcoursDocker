import { Test, TestingModule } from '@nestjs/testing';
import { SalleService } from './salle.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SalleService', () => {
  let service: SalleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalleService,
        {
          provide: PrismaService,
          useValue: {
            salle: {
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

    service = module.get<SalleService>(SalleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
