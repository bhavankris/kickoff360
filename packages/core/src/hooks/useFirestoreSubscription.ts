import { useEffect } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { onSnapshot, type DocumentReference, type Query } from 'firebase/firestore';

/**
 * Bridge a Firestore realtime listener into the TanStack Query cache.
 *
 * Live scores need onSnapshot, but we want the data to live in the same cache the
 * rest of the app reads from. This hook ref-counts mounts per query key and keeps a
 * single shared listener open while at least one component is subscribed, then
 * unsubscribes at zero. Duplicate listeners burn Firestore read quota, so the
 * ref-count is the important part. Platform-agnostic — runs on mobile and web.
 */

type Entry = { count: number; unsub: () => void };
const registry = new Map<string, Entry>();

export function useFirestoreSubscription<T>(
  queryKey: QueryKey,
  firestoreQuery: Query<T>,
  toData: (docs: T[]) => unknown = (docs) => docs,
): void {
  const queryClient = useQueryClient();
  const keyStr = JSON.stringify(queryKey);

  useEffect(() => {
    let entry = registry.get(keyStr);

    if (!entry) {
      const unsub = onSnapshot(
        firestoreQuery,
        (snap) => {
          const docs = snap.docs.map((d) => d.data());
          queryClient.setQueryData(queryKey, toData(docs));
        },
        (err) => {
          // Surface the error into the cache so consumers can react.
          queryClient.setQueryData(queryKey, () => {
            throw err;
          });
        },
      );
      entry = { count: 0, unsub };
      registry.set(keyStr, entry);
    }

    entry.count += 1;

    return () => {
      const current = registry.get(keyStr);
      if (!current) return;
      current.count -= 1;
      if (current.count <= 0) {
        current.unsub();
        registry.delete(keyStr);
      }
    };
    // firestoreQuery identity changes per render; we intentionally key the effect off
    // the serialized queryKey (keyStr) rather than the query object.
  }, [keyStr, queryClient]);
}

/** Same bridge for a single document (e.g. a live match-detail doc). */
export function useFirestoreDocSubscription<T>(
  queryKey: QueryKey,
  ref: DocumentReference<T>,
): void {
  const queryClient = useQueryClient();
  const keyStr = JSON.stringify(queryKey);

  useEffect(() => {
    let entry = registry.get(keyStr);

    if (!entry) {
      const unsub = onSnapshot(
        ref,
        (snap) => {
          queryClient.setQueryData(queryKey, snap.exists() ? snap.data() : null);
        },
        (err) => {
          queryClient.setQueryData(queryKey, () => {
            throw err;
          });
        },
      );
      entry = { count: 0, unsub };
      registry.set(keyStr, entry);
    }

    entry.count += 1;

    return () => {
      const current = registry.get(keyStr);
      if (!current) return;
      current.count -= 1;
      if (current.count <= 0) {
        current.unsub();
        registry.delete(keyStr);
      }
    };
    // Like above: keyed off the serialized queryKey, not the ref identity.
  }, [keyStr, queryClient]);
}
