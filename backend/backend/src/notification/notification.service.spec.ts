import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: {
            notification: { create: jest.fn() }, // mock des méthodes utilisées
          },
        },
        {
          provide: EmailService,
          useValue: { sendEmail: jest.fn() }, // mock de la méthode sendEmail
        },
        {
          provide: WhatsappService,
          useValue: { sendMessage: jest.fn() }, // mock de la méthode sendMessage
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
