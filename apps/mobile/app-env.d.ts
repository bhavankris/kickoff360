import type { Persistence } from 'firebase/auth';

// getReactNativePersistence ships in firebase/auth's React Native entry (Metro
// resolves it at runtime via the package's "react-native" condition) but is omitted
// from the default TypeScript surface. Restore the type so firebase.ts compiles.
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
