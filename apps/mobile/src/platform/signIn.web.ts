import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';
import type { AuthAdapter } from './signIn';

// Future web target. No code change needed in consumers — Metro/Next resolve this
// file on web automatically.
const provider = new GoogleAuthProvider();

export const authAdapter: AuthAdapter = {
  async signIn() {
    return (await signInWithPopup(auth, provider)).user;
  },
  async signOut() {
    await auth.signOut();
  },
};
