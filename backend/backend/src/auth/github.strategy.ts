import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // MODIFICATION ICI : Utilise la variable d'environnement au lieu de localhost
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'https://concours-app.up.railway.app/auth/github/callback',
      scope: ['user:email'], 
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    const { username, emails, photos, displayName } = profile;
    
    const userEmail = emails && emails.length > 0 ? emails[0].value : null;

    const user = {
      email: userEmail,
      nom: displayName || username,
      photo: photos && photos.length > 0 ? photos[0].value : null,
      provider: 'github',
      externalId: profile.id,
    };
    
    console.log(`[GITHUB-STRATEGY] Tentative de connexion de: ${user.email}`);
    
    done(null, user);
  }
}