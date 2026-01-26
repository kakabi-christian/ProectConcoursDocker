import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,

        // ✅ Mock PrismaService
        {
          provide: PrismaService,
          useValue: {
            concours: {
              findMany: jest.fn().mockResolvedValue([]),
            },
            filiere: {
              findMany: jest.fn().mockResolvedValue([]),
            },
            centreExamen: {
              findMany: jest.fn().mockResolvedValue([]),
            },
            user: {
              findUnique: jest.fn().mockResolvedValue(null),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
