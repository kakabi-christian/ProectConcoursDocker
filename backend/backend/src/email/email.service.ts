import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASS');

    this.logger.log(`[EmailService] Initialisation pour l'utilisateur: ${user}`);

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Utilisation de SSL/TLS direct
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false, // Évite les blocages de certificats sur Railway
      },
      connectionTimeout: 15000, // 15 secondes d'attente max
    });

    this.transporter.verify((error) => {
      if (error) {
        this.logger.error(`[EmailService] ❌ Échec de configuration: ${error.message}`);
      } else {
        this.logger.log('[EmailService] ✅ Le transporteur est prêt à envoyer des emails');
      }
    });
  }

  async sendOtpEmail(to: string, code: string) {
    this.logger.log(`[EmailService] 📤 Préparation de l'envoi OTP vers: ${to}`);
    
    const subject = '🔐 Code de vérification pour votre reçu';
    const html = `
      <div style="font-family: Arial; max-width: 600px; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #007bff;">Votre code de vérification</h2>
        <p style="font-size: 16px;">Voici votre code pour récupérer votre reçu :</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 30px; font-weight: bold; letter-spacing: 10px;">
          ${code}
        </div>
        <p>Ce code expire dans 10 minutes.</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Gestion Concours" <${this.configService.get('EMAIL_USER')}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`[EmailService] 🚀 Email envoyé avec succès à ${to}`);
    } catch (error) {
      this.logger.error(`[EmailService] ❌ Erreur fatale d'envoi à ${to}: ${error.message}`);
      throw new InternalServerErrorException("Impossible d'envoyer l'email de vérification.");
    }
  }


  private async sendMail(to: string, subject: string, html: string) {
    const from = this.configService.get<string>('EMAIL_USER');
    const mailOptions = { from, to, subject, html };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to} with subject: "${subject}"`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error('Email sending failed');
    }
  }

  async sendVerificationEmail(to: string, code: string) {
    try {
      const subject = 'Your verification code';
      const html = `
        <p>Hello,</p>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
      `;
      await this.sendMail(to, subject, html);
    } catch (error) {
      this.logger.error(`Error in sendVerificationEmail: ${error.message}`);
    }
  }

  async resendVerificationEmail(to: string, code: string) {
    try {
      const subject = 'Resend verification code';
      const html = `
        <p>Hello,</p>
        <p>Your new verification code is: <strong>${code}</strong></p>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
      `;
      await this.sendMail(to, subject, html);
    } catch (error) {
      this.logger.error(`Error in resendVerificationEmail: ${error.message}`);
    }
  }
  // backend/src/email/email.service.ts

async sendAdminCredentials(to: string, nom: string, codeAdmin: string, password: string) {
  try {
    const subject = '🚀 Vos identifiants de connexion Administrateur';
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
          <h1>Bienvenue dans l'équipe !</h1>
        </div>
        <div style="padding: 20px; color: #333;">
          <p>Bonjour <strong>${nom}</strong>,</p>
          <p>Votre compte administrateur a été créé avec succès. Voici vos accès confidentiels :</p>
          
          <div style="background-color: #f4f7f6; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #007bff;">
            <p style="margin: 5px 0;"><strong>Identifiant (Email) :</strong> ${to}</p>
            <p style="margin: 5px 0;"><strong>Code Admin :</strong> <span style="color: #007bff; font-weight: bold;">${codeAdmin}</span></p>
            <p style="margin: 5px 0;"><strong>Mot de passe :</strong> ${password}</p>
          </div>

          <p style="color: #666; font-size: 0.9em;">⚠️ Par mesure de sécurité, nous vous conseillons de modifier votre mot de passe dès votre première connexion.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${this.configService.get('FRONTEND_URL') || '#'}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Se connecter au Dashboard</a>
          </div>
        </div>
        <div style="background-color: #f9f9f9; color: #999; padding: 15px; text-align: center; font-size: 12px;">
          Ceci est un message automatique, merci de ne pas y répondre.
        </div>
      </div>
    `;
    await this.sendMail(to, subject, html);
  } catch (error) {
    this.logger.error(`Erreur lors de l'envoi des identifiants admin: ${error.message}`);
  }
}

  async sendResetPasswordEmail(to: string, resetToken: string) {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      const subject = 'Reset your password';
      const html = `
        <p>Hello,</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link will expire in <strong>30 minutes</strong>.</p>
      `;
      await this.sendMail(to, subject, html);
    } catch (error) {
      this.logger.error(`Error in sendResetPasswordEmail: ${error.message}`);
    }
  }
  // backend/src/email/email.service.ts

// backend/src/email/email.service.ts

async sendDossierStatusUpdate(to: string, userName: string, status: string, concoursNom: string, commentaire?: string) {
  try {
    const isValidated = status === 'VALIDATED';
    const subject = isValidated 
      ? `✅ Dossier Validé - Concours ${concoursNom}` 
      : `⚠️ Action requise : Dossier Rejeté - Concours ${concoursNom}`;

    const statusText = isValidated ? "VALIDÉ" : "REJETÉ";
    const headerColor = isValidated ? "#28a745" : "#dc3545"; // Vert si OK, Rouge si Rejet

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: ${headerColor}; color: white; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Mise à jour de votre dossier</h1>
        </div>
        
        <div style="padding: 30px; color: #333; line-height: 1.6;">
          <p style="font-size: 16px;">Bonjour <strong>${userName}</strong>,</p>
          <p>L'administration a terminé l'examen de votre dossier pour le concours : <strong>${concoursNom}</strong>.</p>
          
          <div style="background-color: #f4f7f6; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; border: 1px dashed ${headerColor};">
            <p style="margin: 0; color: #666; text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 1px;">Nouveau Statut</p>
            <p style="margin: 5px 0; font-size: 22px; color: ${headerColor}; font-weight: bold;">${statusText}</p>
          </div>

          ${!isValidated && commentaire ? `
            <div style="background-color: #fff5f5; padding: 15px; border-radius: 5px; border-left: 5px solid #dc3545; margin-bottom: 20px;">
              <p style="margin: 0; color: #dc3545; font-weight: bold;">Motif du rejet :</p>
              <p style="margin: 5px 0; color: #333;">${commentaire}</p>
            </div>
            <p>Veuillez vous connecter pour corriger vos documents afin de soumettre à nouveau votre dossier.</p>
          ` : `
            <p style="color: #28a745; font-weight: bold;">Félicitations ! Votre dossier est maintenant complet et validé par nos services.</p>
          `}

          <div style="text-align: center; margin-top: 35px;">
            <a href="${this.configService.get('FRONTEND_URL') || '#'}" 
               style="background-color: #007bff; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
               Accéder à mon Dashboard
            </a>
          </div>
        </div>

        <div style="background-color: #f9f9f9; color: #999; padding: 15px; text-align: center; font-size: 12px; border-top: 1px solid #eeeeee;">
          Ceci est un message automatique, merci de ne pas y répondre.
        </div>
      </div>
    `;

    // On utilise await pour s'assurer que l'envoi est terminé
    await this.sendMail(to, subject, html);

  } catch (error) {
    this.logger.error(`Erreur lors de l'envoi de la mise à jour dossier: ${error.message}`);
    // TRÈS IMPORTANT : On re-balance l'erreur pour que DossierService sache que ça a échoué
    throw error; 
  }
}
}