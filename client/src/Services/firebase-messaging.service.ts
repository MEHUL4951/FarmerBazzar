import { Injectable, inject } from '@angular/core';
import { firebaseConfig } from '../environments/environment';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { FirebaseApp } from '@angular/fire/app';

@Injectable({
  providedIn: 'root'
})
export class FirebaseMessagingService {
  private messaging: Messaging;
  

  constructor() {
    const firebaseApp = inject(FirebaseApp);
    this.messaging = getMessaging(firebaseApp);
  }

  async requestPermissionAndToken(): Promise<string | null> {
    try {
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        window.alert('🔕 Notification permission denied or blocked.');
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey: firebaseConfig.vapidKey
      });

      return token;
    } catch (error) {
      console.error('🔥 FCM token error:', error);
      return null;
    }
  }

   listenToMessages(callback: (payload: any) => void) {
    onMessage(this.messaging, (payload) => {
      callback(payload);
    });
  }

 
}
