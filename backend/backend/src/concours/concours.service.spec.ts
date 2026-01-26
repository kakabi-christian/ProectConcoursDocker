import { Test, TestingModule } from '@nestjs/testing';
import { ConcoursService } from './concours.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ConcoursService', () => {
  let service: ConcoursService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcoursService,
        {
          provide: PrismaService,
          useValue: {
            concours: {
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

    service = module.get<ConcoursService>(ConcoursService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
