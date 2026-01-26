import { Test, TestingModule } from '@nestjs/testing';
import { NiveauService } from './niveau.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NiveauService', () => {
  let service: NiveauService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NiveauService,
        {
          provide: PrismaService,
          useValue: {
            niveau: {
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

    service = module.get<NiveauService>(NiveauService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
