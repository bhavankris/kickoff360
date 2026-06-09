import type { User } from 'firebase/auth';

/**
 * The auth contract. Screens import `authAdapter` from './signIn' and never know
 * which platform they run on — Metro (and a future Next bundler) resolve the right
 * implementation by file extension: signIn.native.ts on mobile, signIn.web.ts on web.
 *
 * This base file is the TypeScript resolution target (so `authAdapter` is typed) and
 * the runtime fallback. It is never actually used at runtime because a platform file
 * always exists; it throws if somehow reached on an unknown platform.
 */
export interface AuthAdapter {
  signIn(): Promise<User>;
  signOut(): Promise<void>;
}

export const authAdapter: AuthAdapter = {
  signIn() {
    throw new Error('authAdapter not implemented for this platform');
  },
  signOut() {
    throw new Error('authAdapter not implemented for this platform');
  },
};
