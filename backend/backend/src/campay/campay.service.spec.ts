import { Test, TestingModule } from '@nestjs/testing';
import { CampayService } from './campay.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('CampayService', () => {
  let service: CampayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampayService,
        // ✅ Mock PrismaService
        {
          provide: PrismaService,
          useValue: {
            campay: {
              findMany: jest.fn().mockResolvedValue([]),
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({}),
              update: jest.fn().mockResolvedValue({}),
              delete: jest.fn().mockResolvedValue({}),
            },
            paiement: {
              findMany: jest.fn().mockResolvedValue([]),
              create: jest.fn().mockResolvedValue({}),
            },
          },
        },
        // ✅ Mock ConfigService
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('dummy_value'), // retourne la valeur utilisée dans ton service
          },
        },
      ],
    }).compile();

    service = module.get<CampayService>(CampayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
