import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../firebase';
import { userConverter } from './converters';
import type { UserDoc } from '../types';

/** Read a user profile, or null if onboarding hasn't happened yet. */
export async function getUser(uid: string): Promise<UserDoc | null> {
  const ref = doc(getDb(), 'users', uid).withConverter(userConverter);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/** Write the onboarding profile. Merge so re-runs don't clobber createdAt. */
export async function completeOnboarding(
  uid: string,
  a: { email: string; nameFromGoogle: string; displayName: string; countryCode: string },
): Promise<void> {
  await setDoc(
    doc(getDb(), 'users', uid),
    { ...a, onboardingComplete: true, createdAt: serverTimestamp() },
    { merge: true },
  );
}
