import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { EmailService } from './email.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Public()
  @Post('test-send')
  @HttpCode(HttpStatus.OK)
  async testEmail(@Body() body: { email: string }) {
    // On génère un code de test (ex: 123456)
    const testCode = '123456';
    
    // On appelle la méthode sendOtpEmail de ton service
    await this.emailService.sendOtpEmail(body.email, testCode);
    
    return {
      message: `Tentative d'envoi effectuée vers ${body.email}. Vérifie tes logs Railway et ta boîte mail !`,
      success: true
    };
  }
}