import { Test, TestingModule } from '@nestjs/testing';
import { PaiementService } from './paiement.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CampayService } from '../campay/campay.service'; // ✅ Import du service

describe('PaiementService', () => {
  let service: PaiementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaiementService,
        // ✅ Mock PrismaService pour éviter les erreurs de dépendances
        {
          provide: PrismaService,
          useValue: {
            paiement: {
              findMany: jest.fn().mockResolvedValue([]),
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({}),
              update: jest.fn().mockResolvedValue({}),
              delete: jest.fn().mockResolvedValue({}),
            },
            campay: {
              findMany: jest.fn().mockResolvedValue([]),
              create: jest.fn().mockResolvedValue({}),
            },
          },
        },
        // ✅ Mock EmailService
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn().mockResolvedValue(true),
          },
        },
        // ✅ Mock CampayService
        {
          provide: CampayService,
          useValue: {
            createCampay: jest.fn().mockResolvedValue({}),
            findAll: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<PaiementService>(PaiementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
