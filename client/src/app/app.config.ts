import { ApplicationConfig , provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { firebaseConfig } from '../environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideMessaging(() => getMessaging()),
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(
    routes,
    withComponentInputBinding(),
    withRouterConfig({
      paramsInheritanceStrategy: 'always',
    }),
  ),  // Ensure that Firebase Authentication is provided
  ]
 
};
