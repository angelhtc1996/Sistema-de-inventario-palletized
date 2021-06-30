import { environment } from 'src/environments/environment';
import { GoogleLoginProvider, SocialAuthServiceConfig } from 'angularx-social-login';

export const socialNetworkConfig: SocialAuthServiceConfig = {
  autoLogin: false,
  providers: [{
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider(environment.googleOAuthKey)
  }]
};
