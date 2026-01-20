import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.logger.log('--- 🚀 [INIT] DÉMARRAGE DU SERVICE EMAIL AVEC MAILJET ---');
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const apiKey = this.configService.get<string>('MAILJET_API_KEY');
    const apiSecret = this.configService.get<string>('MAILJET_SECRET_KEY');

    // LOGS DE VÉRIFICATION DES VARIABLES
    this.logger.debug(`[CONFIG] API_KEY présente: ${!!apiKey}`);
    this.logger.debug(`[CONFIG] SECRET_KEY présente: ${!!apiSecret}`);

    if (!apiKey || !apiSecret) {
      this.logger.error('❌ [CONFIG ERROR] MAILJET_API_KEY ou MAILJET_SECRET_KEY manquante !');
      return;
    }

    this.logger.log(`[CONNEXION] Tentative de liaison avec in-v3.mailjet.com sur le port 587...`);

    this.transporter = nodemailer.createTransport({
      host: 'in-v3.mailjet.com',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: apiKey,
        pass: apiSecret,
      },
      tls: {
        rejectUnauthorized: false, // Critique pour Railway
        minVersion: 'TLSv1.2'
      },
      connectionTimeout: 15000, // 15 secondes d'attente max
    });

    // TEST DE CONNEXION IMMÉDIAT
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error(`❌ [SMTP ERROR] Échec de connexion : ${error.message}`);
        this.logger.error(`[DEBUG] Détails: ${JSON.stringify(error)}`);
      } else {
        this.logger.log('✅ [SMTP READY] Connexion Mailjet établie avec succès sur le port 587 !');
      }
    });
  }

  /**
   * Méthode d'envoi de base avec logs détaillés
   */
  private async sendMail(to: string, subject: string, html: string) {
    // Note: L'email expéditeur DOIT être validé dans ton dashboard Mailjet
    const from = `"Gestion Concours" <kakabichristian7@gmail.com>`;
    const mailOptions = { from, to, subject, html };

    this.logger.warn(`--- 📥 [TENTATIVE D'ENVOI] ---`);
    this.logger.log(`[DESTINATAIRE]: ${to}`);
    this.logger.log(`[SUJET]: ${subject}`);

    try {
      this.logger.log(`[PROCESS] ⏳ Envoi en cours via Mailjet SMTP...`);
      const startTime = Date.now();
      
      const info = await this.transporter.sendMail(mailOptions);
      
      const endTime = Date.now();
      this.logger.log(`✅ [SUCCÈS] Email envoyé en ${endTime - startTime}ms`);
      this.logger.log(`[SERVER INFO] MessageId: ${info.messageId}`);
      this.logger.log(`[SERVER RESPONSE] ${info.response}`);
      
      return info;
    } catch (error) {
      this.logger.error(`❌ [SEND ERROR] Échec de l'envoi à ${to}`);
      this.logger.error(`[CAUSE]: ${error.message}`);
      
      if (error.code === 'ECONNREFUSED') {
        this.logger.error(`[DEBUG] Connexion refusée. Vérifiez que le port 587 est autorisé sur Railway.`);
      }

      throw new InternalServerErrorException(`Erreur d'envoi email: ${error.message}`);
    }
  }

  // --- MÉTHODES SPÉCIFIQUES ---

  async sendOtpEmail(to: string, code: string) {
    this.logger.log(`[OTP] Préparation de l'email OTP pour ${to}`);
    const subject = '🔐 Code de vérification pour votre reçu';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #007bff; text-align: center;">Récupération de Reçu</h2>
        <p>Votre code de vérification est :</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">
          ${code}
        </div>
        <p style="color: #e74c3c; text-align: center;">⚠️ expire dans 10 minutes.</p>
      </div>
    `;
    return await this.sendMail(to, subject, html);
  }

  async sendAdminCredentials(to: string, nom: string, codeAdmin: string, password: string) {
    this.logger.log(`[ADMIN] Création identifiants pour ${nom}`);
    const subject = '🚀 Vos identifiants de connexion Administrateur';
    const html = `<h2>Bienvenue ${nom}</h2><p>Identifiant: ${to}<br>Code: ${codeAdmin}<br>Pass: ${password}</p>`;
    return await this.sendMail(to, subject, html);
  }

  async sendDossierStatusUpdate(to: string, userName: string, status: string, concoursNom: string, commentaire?: string) {
    this.logger.log(`[DOSSIER] Mise à jour statut: ${status} pour ${to}`);
    const isValidated = status === 'VALIDATED';
    const subject = isValidated ? `✅ Dossier Validé - ${concoursNom}` : `⚠️ Dossier Rejeté - ${concoursNom}`;
    const headerColor = isValidated ? "#28a745" : "#dc3545";

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border-radius: 10px; overflow: hidden; border: 1px solid #ddd;">
        <div style="background-color: ${headerColor}; color: white; padding: 20px; text-align: center;">
          <h1 style="margin:0;">Mise à jour Dossier</h1>
        </div>
        <div style="padding: 20px;">
          <p>Bonjour <strong>${userName}</strong>, votre dossier pour <strong>${concoursNom}</strong> est <strong>${status}</strong>.</p>
          ${commentaire ? `<p style="color:red;"><b>Motif :</b> ${commentaire}</p>` : ''}
        </div>
      </div>
    `;
    try {
      await this.sendMail(to, subject, html);
    } catch (e) {
      this.logger.error(`Erreur DossierUpdate: ${e.message}`);
      throw e;
    }
  }

  // ALIAS ET COMPATIBILITÉ
  async sendVerificationEmail(to: string, code: string) { return this.sendOtpEmail(to, code); }
  async resendVerificationEmail(to: string, code: string) { return this.sendOtpEmail(to, code); }
  
  async sendResetPasswordEmail(to: string, resetToken: string) {
    const url = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const link = `${url}/reset-password?token=${resetToken}`;
    const html = `<p>Réinitialisation : <a href="${link}">${link}</a></p>`;
    return await this.sendMail(to, 'Réinitialisation mot de passe', html);
  }
}