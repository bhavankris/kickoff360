import { Fragment } from 'react';
import { Text, View } from 'react-native';
import type { Timestamp } from 'firebase/firestore';
import { countdownParts, useNow } from '@repo/core';

/** Ticking countdown to a kick-off (days/hrs/min, hrs/min/sec on the final day). */
export function LiveCountdown({ target, size = 'lg' }: { target: Timestamp | Date; size?: 'lg' | 'sm' }) {
  const now = useNow(1000);
  const units = countdownParts(target, now);
  const big = size === 'lg';
  return (
    <View className={`flex-row justify-center ${big ? 'gap-2.5' : 'gap-[7px]'}`}>
      {units.map(([v, label], i) => (
        <Fragment key={label}>
          <View className={`items-center ${big ? 'min-w-[58px]' : 'min-w-[44px]'}`}>
            <View
              className={`w-full border border-line bg-surface2 ${
                big ? 'rounded-[14px] pb-2 pt-2.5' : 'rounded-[10px] pb-[5px] pt-[7px]'
              }`}
            >
              <Text
                className={`text-center font-archivo-extrabold text-ink ${big ? 'text-[32px]' : 'text-[22px]'}`}
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {String(v).padStart(2, '0')}
              </Text>
            </View>
            <Text className={`mt-1.5 font-mono-bold tracking-[1px] text-faint ${big ? 'text-[10px]' : 'text-[8.5px]'}`}>
              {label}
            </Text>
          </View>
          {i < units.length - 1 ? (
            <Text className={`font-archivo-extrabold text-faint ${big ? 'mt-2 text-[28px]' : 'mt-[5px] text-[20px]'}`}>
              :
            </Text>
          ) : null}
        </Fragment>
      ))}
    </View>
  );
}
