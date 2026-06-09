import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { env } from '../lib/env';
import type { AuthAdapter } from './signIn';

GoogleSignin.configure({ webClientId: env.GOOGLE_WEB_CLIENT_ID });

export const authAdapter: AuthAdapter = {
  async signIn() {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const { data } = await GoogleSignin.signIn();
    if (!data?.idToken) throw new Error('No idToken from Google Sign-In');
    const cred = GoogleAuthProvider.credential(data.idToken);
    return (await signInWithCredential(auth, cred)).user;
  },
  async signOut() {
    await GoogleSignin.signOut();
    await auth.signOut();
  },
};
