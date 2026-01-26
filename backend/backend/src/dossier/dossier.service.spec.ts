import { Test, TestingModule } from '@nestjs/testing';
import { DossierService } from './dossier.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { EmailService } from 'src/email/email.service';

describe('DossierService', () => {
  let service: DossierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DossierService,
        // ✅ Mock PrismaService
        {
          provide: PrismaService,
          useValue: {
            dossier: {
              findMany: jest.fn().mockResolvedValue([]),
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({}),
              update: jest.fn().mockResolvedValue({}),
              delete: jest.fn().mockResolvedValue({}),
            },
          },
        },
        // ✅ Mock NotificationService
        {
          provide: NotificationService,
          useValue: { send: jest.fn(), sendEmail: jest.fn() },
        },
        // ✅ Mock WhatsappService
        {
          provide: WhatsappService,
          useValue: { sendMessage: jest.fn() },
        },
        // ✅ Mock EmailService
        {
          provide: EmailService,
          useValue: { sendEmail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<DossierService>(DossierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
