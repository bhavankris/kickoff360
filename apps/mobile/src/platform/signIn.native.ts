import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { env } from '../lib/env';
import type { AuthAdapter } from './signIn';

// Load the native module lazily via require(). Importing it at the top level runs
// `TurboModuleRegistry.getEnforcing('RNGoogleSignin')` as an import side-effect, which
// throws in any binary that lacks the native module (Expo Go, or a dev build made before
// the dependency was added). Since the auth adapter is imported during app boot, that
// throw used to take the whole app down — surfacing as expo-router "missing default
// export" warnings and "Cannot read property 'ErrorBoundary' of undefined". A require()
// inside the function defers evaluation to call-time so the app still boots.
//
// We use require() rather than `await import()` on purpose: Metro resolves dynamic
// import() of this CJS-interop module to `{ default: … }`, so destructuring named exports
// off it yields `undefined` ("Cannot read property 'configure' of undefined"). require()
// returns the real exports object.
let configured = false;
function getGoogleSignin() {
  const { GoogleSignin } =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@react-native-google-signin/google-signin') as typeof import('@react-native-google-signin/google-signin');
  if (!configured) {
    GoogleSignin.configure({ webClientId: env.GOOGLE_WEB_CLIENT_ID });
    configured = true;
  }
  return GoogleSignin;
}

export const authAdapter: AuthAdapter = {
  async signIn() {
    const GoogleSignin = getGoogleSignin();
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const { data } = await GoogleSignin.signIn();
    if (!data?.idToken) throw new Error('No idToken from Google Sign-In');
    const cred = GoogleAuthProvider.credential(data.idToken);
    return (await signInWithCredential(auth, cred)).user;
  },
  async signOut() {
    try {
      await getGoogleSignin().signOut();
    } catch (e) {
      console.warn('[auth] native Google sign-out skipped', e);
    }
    await auth.signOut();
  },
};
