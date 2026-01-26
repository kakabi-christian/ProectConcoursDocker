import { Test, TestingModule } from '@nestjs/testing';
import { ArchiveService } from './archive.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ArchiveService', () => {
  let service: ArchiveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArchiveService,

        // ✅ Mock PrismaService pour l’injection
        {
          provide: PrismaService,
          useValue: {
            archive: {
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

    service = module.get<ArchiveService>(ArchiveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
