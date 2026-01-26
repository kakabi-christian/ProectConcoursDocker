import { Test, TestingModule } from '@nestjs/testing';
import { SpecialiteService } from './specialite.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SpecialiteService', () => {
  let service: SpecialiteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecialiteService,
        {
          provide: PrismaService,
          useValue: {
            specialite: {
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

    service = module.get<SpecialiteService>(SpecialiteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
