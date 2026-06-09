import { Fragment, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import type { Timestamp } from 'firebase/firestore';
import { countdownParts } from '@repo/core';
import { useTheme } from '../providers/ThemeProvider';
import { f, mono } from '../theme/fonts';

/** Ticking countdown to a kick-off (days/hrs/min, hrs/min/sec on the final day). */
export function LiveCountdown({ target, size = 'lg' }: { target: Timestamp | Date; size?: 'lg' | 'sm' }) {
  const { t } = useTheme();
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const units = countdownParts(target);
  const big = size === 'lg';
  return (
    <View style={{ flexDirection: 'row', gap: big ? 10 : 7, justifyContent: 'center' }}>
      {units.map(([v, label], i) => (
        <Fragment key={label}>
          <View style={{ alignItems: 'center', minWidth: big ? 58 : 44 }}>
            <View
              style={{
                width: '100%',
                backgroundColor: t.surface2,
                borderWidth: 1,
                borderColor: t.line,
                borderRadius: big ? 14 : 10,
                paddingTop: big ? 10 : 7,
                paddingBottom: big ? 8 : 5,
              }}
            >
              <Text
                style={{
                  fontSize: big ? 32 : 22,
                  color: t.text,
                  textAlign: 'center',
                  fontVariant: ['tabular-nums'],
                  ...f(800),
                }}
              >
                {String(v).padStart(2, '0')}
              </Text>
            </View>
            <Text style={{ fontSize: big ? 10 : 8.5, color: t.faint, letterSpacing: 1, marginTop: 6, ...mono(700) }}>
              {label}
            </Text>
          </View>
          {i < units.length - 1 ? (
            <Text style={{ fontSize: big ? 28 : 20, color: t.faint, marginTop: big ? 8 : 5, ...f(800) }}>:</Text>
          ) : null}
        </Fragment>
      ))}
    </View>
  );
}
