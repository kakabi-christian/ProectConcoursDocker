import { Injectable, Logger, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailjet from 'node-mailjet';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private mailjet: Mailjet;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.logger.log('--- 🚀 [INIT] DÉMARRAGE DU SERVICE EMAIL VIA API MAILJET ---');
    this.initializeMailjet();
  }

  private initializeMailjet() {
    const apiKey = this.configService.get<string>('MAILJET_API_KEY');
    const apiSecret = this.configService.get<string>('MAILJET_SECRET_KEY');

    if (!apiKey || !apiSecret) {
      this.logger.error('❌ [CONFIG ERROR] Clés API Mailjet (Public/Secret) manquantes !');
      return;
    }

    try {
      this.mailjet = new Mailjet({
        apiKey: apiKey,
        apiSecret: apiSecret
      });
      this.logger.log('✅ [API READY] Client Mailjet initialisé sur le port 443');
    } catch (error) {
      this.logger.error(`❌ [INIT ERROR] Échec de l'initialisation API : ${error.message}`);
    }
  }

  private async sendMail(to: string, subject: string, html: string) {
    if (!this.mailjet) {
      this.logger.warn('⚠️ Client Mailjet non prêt, tentative de réinitialisation...');
      this.initializeMailjet();
      if (!this.mailjet) {
        throw new InternalServerErrorException("Le service email (API) n'est pas disponible.");
      }
    }

    // Utilisation de ton adresse validée sur Mailjet
    const fromEmail = "kakabichristian@gmail.com";
    
    this.logger.warn(`--- 📥 [TENTATIVE D'ENVOI API] ---`);
    this.logger.log(`[DESTINATAIRE]: ${to}`);

    try {
      this.logger.log(`[PROCESS] ⏳ Envoi en cours via API HTTP...`);
      
      const result = await this.mailjet
        .post("send", { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: fromEmail,
                Name: "Gestion Concours"
              },
              To: [
                {
                  Email: to
                }
              ],
              Subject: subject,
              HTMLPart: html,
            }
          ]
        });

      this.logger.log(`✅ [SUCCÈS] Email envoyé via API HTTP`);
      return result.body;
    } catch (error) {
      this.logger.error(`❌ [API ERROR] Échec de l'envoi à ${to}`);
      // Log plus détaillé pour voir l'erreur exacte retournée par Mailjet
      const errorDetail = error.response?.body || error.message;
      this.logger.error(`[CAUSE]: ${JSON.stringify(errorDetail)}`);
      throw new InternalServerErrorException(`Erreur API Mailjet: ${error.message}`);
    }
  }

  // --- MÉTHODES SPÉCIFIQUES ---

  async sendOtpEmail(to: string, code: string) {
    this.logger.log(`[OTP] Envoi code ${code} à ${to}`);
    const subject = '🔐 Code de vérification pour votre reçu';
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #2c3e50;">Votre code de vérification</h2>
        <div style="font-size: 24px; font-weight: bold; color: #3498db; padding: 10px; background: #f9f9f9; display: inline-block; border-radius: 4px;">
          ${code}
        </div>
        <p>Ce code est valable pendant 10 minutes. Ne le partagez avec personne.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <small style="color: #7f8c8d;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</small>
      </div>`;
    return await this.sendMail(to, subject, html);
  }

  async sendAdminCredentials(to: string, nom: string, codeAdmin: string, password: string) {
    const subject = '🚀 Vos identifiants Administrateur';
    const html = `<h3>Bienvenue ${nom}</h3><p>Identifiant: ${to}<br>Pass: ${password}</p>`;
    return await this.sendMail(to, subject, html);
  }

  async sendDossierStatusUpdate(to: string, userName: string, status: string, concoursNom: string, commentaire?: string) {
    const subject = status === 'VALIDATED' ? '✅ Dossier Validé' : '⚠️ Dossier Rejeté';
    const html = `<h3>Bonjour ${userName}</h3><p>Votre dossier pour ${concoursNom} est désormais : <strong>${status}</strong>.</p>`;
    return await this.sendMail(to, subject, html);
  }

  async sendVerificationEmail(to: string, code: string) { return this.sendOtpEmail(to, code); }
  async resendVerificationEmail(to: string, code: string) { return this.sendOtpEmail(to, code); }
  
  async sendResetPasswordEmail(to: string, resetToken: string) {
    const url = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const link = `${url}/reset-password?token=${resetToken}`;
    const html = `<p>Pour réinitialiser votre mot de passe, cliquez ici : <a href="${link}">${link}</a></p>`;
    return await this.sendMail(to, 'Réinitialisation de mot de passe', html);
  }
}