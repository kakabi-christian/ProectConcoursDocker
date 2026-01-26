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
  // Configuration dynamique selon le statut
  const config = {
    VALIDATED: {
      subject: '✅ Dossier Validé - Félicitations !',
      label: 'DOSSIER VALIDÉ',
      icon: 'https://cdn-icons-png.flaticon.com/128/190/190411.png',
      color: '#25963F',
      gradient: 'linear-gradient(135deg, #25963F 0%, #1a6b2d 100%)',
      intro: 'Excellente nouvelle ! Votre dossier a été examiné et approuvé par notre équipe administrative.'
    },
    REJECTED: {
      subject: '❌ Dossier Refusé - Notification',
      label: 'DOSSIER REFUSÉ',
      icon: 'https://cdn-icons-png.flaticon.com/128/497/497738.png',
      color: '#d63031',
      gradient: 'linear-gradient(135deg, #d63031 0%, #a22021 100%)',
      intro: 'Nous avons le regret de vous informer que votre dossier ne peut être accepté en l\'état.'
    },
    DRAFT: {
      subject: '📝 Action Requise : Dossier à corriger',
      label: 'MODIFICATIONS ATTENDUES',
      icon: 'https://cdn-icons-png.flaticon.com/128/1159/1159633.png',
      color: '#e67e22',
      gradient: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
      intro: 'Votre dossier nécessite quelques ajustements avant de pouvoir être validé.'
    },
    PENDING: {
      subject: '⏳ Dossier en cours de traitement',
      label: 'EXAMEN EN COURS',
      icon: 'https://cdn-icons-png.flaticon.com/128/3286/3286230.png',
      color: '#2980b9',
      gradient: 'linear-gradient(135deg, #2980b9 0%, #1c5982 100%)',
      intro: 'Votre dossier est bien arrivé ! Nos services procèdent actuellement à sa vérification.'
    }
  };

  const style = config[status] || config.PENDING;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
        .wrapper { padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { background: ${style.gradient}; color: #ffffff; padding: 40px 20px; text-align: center; }
        .icon-circle { background: rgba(255,255,255,0.2); width: 70px; height: 70px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; }
        .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
        .body { padding: 35px; color: #2d3436; }
        .greeting { font-size: 20px; font-weight: bold; color: #2d3436; }
        .concours-tag { display: inline-block; padding: 5px 15px; background: #f0f2f5; border-radius: 20px; color: #636e72; font-weight: 600; font-size: 14px; margin: 10px 0 20px; }
        .status-box { text-align: center; margin: 25px 0; padding: 15px; border-radius: 10px; border: 2px dashed ${style.color}; background-color: ${style.color}05; }
        .status-text { font-size: 18px; font-weight: 800; color: ${style.color}; }
        .message { line-height: 1.8; color: #636e72; font-size: 16px; }
        .comment-section { background: #fff9db; border-left: 4px solid #f1c40f; padding: 15px; margin-top: 25px; border-radius: 4px; }
        .footer { text-align: center; padding: 25px; background: #fdfdfd; font-size: 13px; color: #b2bec3; border-top: 1px solid #eee; }
        .btn { display: inline-block; padding: 15px 30px; background: ${style.gradient}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 25px; transition: transform 0.2s; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="header">
            <div class="icon-circle">
              <img src="${style.icon}" alt="icon" width="40">
            </div>
            <h1>${style.label}</h1>
          </div>
          
          <div class="body">
            <div class="greeting">Bonjour ${userName},</div>
            <div class="concours-tag">${concoursNom}</div>
            
            <p class="message">${style.intro}</p>

            <div class="status-box">
              <span class="status-text">${style.label}</span>
            </div>

            ${commentaire ? `
              <div class="comment-section">
                <strong style="color: #856404;">Note de l'administration :</strong><br/>
                <span style="color: #533f03;">"${commentaire}"</span>
              </div>
            ` : ''}

            ${status !== 'VALIDATED' ? `
              <div style="text-align: center;">
                <a href="https://votre-plateforme.cm/connexion" class="btn">Mettre à jour mon dossier</a>
              </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>Ministère des Enseignements Supérieurs - Direction des Concours</p>
            <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
            <p>&copy; ${new Date().getFullYear()} Plateforme Intégrée</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return await this.sendMail(to, style.subject, html);
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