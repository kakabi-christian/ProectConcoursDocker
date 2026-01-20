import { Injectable, Logger, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.logger.log('--- 🚀 [INIT] DÉMARRAGE DU SERVICE EMAIL AVEC MAILJET ---');
    await this.initializeTransporter();
  }

  private async initializeTransporter() {
    const apiKey = this.configService.get<string>('MAILJET_API_KEY');
    const apiSecret = this.configService.get<string>('MAILJET_SECRET_KEY');

    if (!apiKey || !apiSecret) {
      this.logger.error('❌ [CONFIG ERROR] MAILJET_API_KEY ou MAILJET_SECRET_KEY manquante !');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: 'in-v3.mailjet.com',
        port: 587,
        secure: false, // false obligatoire pour STARTTLS sur le port 587
        auth: {
          user: apiKey,
          pass: apiSecret,
        },
        tls: {
          rejectUnauthorized: false, // Évite les blocages de certificats sur Railway/Docker
          minVersion: 'TLSv1.2'
        },
        // Paramètres augmentés pour éviter le "Connection timeout"
        connectionTimeout: 30000, 
        greetingTimeout: 30000,
        socketTimeout: 45000,
      });

      // Vérification immédiate de la connexion au démarrage
      await this.transporter.verify();
      this.logger.log('✅ [SMTP READY] Connexion Mailjet établie avec succès !');
    } catch (error) {
      this.logger.error(`❌ [SMTP ERROR] La connexion a échoué : ${error.message}`);
    }
  }

  private async sendMail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.warn('⚠️ Transporter non prêt, tentative de réinitialisation...');
      await this.initializeTransporter();
      if (!this.transporter) {
        throw new InternalServerErrorException("Service email non disponible.");
      }
    }

    // IMPORTANT : Utilisation de l'adresse validée SANS le chiffre 7
    const from = `"Gestion Concours" <kakabichristian@gmail.com>`;
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
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #2c3e50;">Votre code de vérification</h2>
        <div style="font-size: 24px; font-weight: bold; color: #3498db; padding: 10px; background: #f9f9f9; display: inline-block;">
          ${code}
        </div>
        <p>Ce code est valable pendant 10 minutes. Ne le partagez avec personne.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <small>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</small>
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
    const html = `<h3>Bonjour ${userName}</h3><p>Votre dossier pour ${concoursNom} est désormais : ${status}.</p>`;
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