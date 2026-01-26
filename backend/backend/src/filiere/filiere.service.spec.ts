import { Test, TestingModule } from '@nestjs/testing';
import { FiliereService } from './filiere.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FiliereService', () => {
  let service: FiliereService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FiliereService,
        {
          provide: PrismaService,
          useValue: {
            filiere: {
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

    service = module.get<FiliereService>(FiliereService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
