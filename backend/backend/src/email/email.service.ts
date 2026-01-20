import { Injectable, Logger, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {}

  // OnModuleInit assure que l'initialisation se fait au lancement du module NestJS
  async onModuleInit() {
    this.logger.log('--- 🚀 [INIT] DÉMARRAGE DU SERVICE EMAIL AVEC MAILJET ---');
    await this.initializeTransporter();
  }

  private async initializeTransporter() {
    const apiKey = this.configService.get<string>('MAILJET_API_KEY');
    const apiSecret = this.configService.get<string>('MAILJET_SECRET_KEY');

    this.logger.debug(`[CONFIG] Vérification des clés Mailjet...`);

    if (!apiKey || !apiSecret) {
      this.logger.error('❌ [CONFIG ERROR] MAILJET_API_KEY ou MAILJET_SECRET_KEY manquante !');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: 'in-v3.mailjet.com',
        port: 587,
        secure: false, 
        auth: {
          user: apiKey,
          pass: apiSecret,
        },
        tls: {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2'
        },
        connectionTimeout: 15000,
      });

      // On attend la vérification avant de dire que c'est prêt
      await this.transporter.verify();
      this.logger.log('✅ [SMTP READY] Connexion Mailjet établie avec succès !');
    } catch (error) {
      this.logger.error(`❌ [SMTP ERROR] La configuration a échoué : ${error.message}`);
    }
  }

  private async sendMail(to: string, subject: string, html: string) {
    // 🛡️ SÉCURITÉ ANTI-CRASH : Si le transporter est indéfini, on tente de le recréer ou on throw proprement
    if (!this.transporter) {
      this.logger.warn('⚠️ Transporter non prêt, tentative de réinitialisation d\'urgence...');
      await this.initializeTransporter();
      
      if (!this.transporter) {
        throw new InternalServerErrorException("Le service email n'est pas configuré (transporter undefined).");
      }
    }

    const from = `"Gestion Concours" <kakabichristian7@gmail.com>`;
    const mailOptions = { from, to, subject, html };

    this.logger.warn(`--- 📥 [TENTATIVE D'ENVOI] ---`);
    this.logger.log(`[DESTINATAIRE]: ${to}`);

    try {
      this.logger.log(`[PROCESS] ⏳ Envoi en cours via Mailjet...`);
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ [SUCCÈS] Email envoyé | MessageId: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`❌ [SEND ERROR] Échec de l'envoi à ${to}`);
      this.logger.error(`[CAUSE]: ${error.message}`);
      throw new InternalServerErrorException(`Erreur d'envoi email: ${error.message}`);
    }
  }

  // --- MÉTHODES SPÉCIFIQUES ---

  async sendOtpEmail(to: string, code: string) {
    this.logger.log(`[OTP] Envoi code ${code} à ${to}`);
    const subject = '🔐 Code de vérification pour votre reçu';
    const html = `<div style="font-family: Arial; padding: 20px; border: 1px solid #eee;">
                    <h2>Code : ${code}</h2>
                    <p>Ce code expire dans 10 minutes.</p>
                  </div>`;
    return await this.sendMail(to, subject, html);
  }

  async sendAdminCredentials(to: string, nom: string, codeAdmin: string, password: string) {
    const subject = '🚀 Vos identifiants Administrateur';
    const html = `<h3>Bienvenue ${nom}</h3><p>Identifiant: ${to}<br>Pass: ${password}</p>`;
    return await this.sendMail(to, subject, html);
  }

  async sendDossierStatusUpdate(to: string, userName: string, status: string, concoursNom: string, commentaire?: string) {
    const isValid = status === 'VALIDATED';
    const subject = isValid ? '✅ Dossier Validé' : '⚠️ Dossier Rejeté';
    const html = `<h3>Bonjour ${userName}</h3><p>Votre dossier pour ${concoursNom} est ${status}.</p>`;
    return await this.sendMail(to, subject, html);
  }

  async sendVerificationEmail(to: string, code: string) { return this.sendOtpEmail(to, code); }
  async resendVerificationEmail(to: string, code: string) { return this.sendOtpEmail(to, code); }
  
  async sendResetPasswordEmail(to: string, resetToken: string) {
    const url = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const link = `${url}/reset-password?token=${resetToken}`;
    const html = `<p>Réinitialisation : <a href="${link}">${link}</a></p>`;
    return await this.sendMail(to, 'Réinitialisation mot de passe', html);
  }
}