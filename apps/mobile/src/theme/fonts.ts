import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
} from '@expo-google-fonts/archivo';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import type { TextStyle } from 'react-native';

/**
 * The kickoff360 type system: Archivo for UI, Space Mono for labels/numbers.
 * RN needs an exact fontFamily per weight, so `f(800)` / `mono(700)` map the
 * design's weight scale onto the loaded variants.
 */

export const FONTS = {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
  SpaceMono_400Regular,
  SpaceMono_700Bold,
};

const ARCHIVO: Record<number, string> = {
  400: 'Archivo_400Regular',
  500: 'Archivo_500Medium',
  600: 'Archivo_600SemiBold',
  700: 'Archivo_700Bold',
  800: 'Archivo_800ExtraBold',
  900: 'Archivo_900Black',
};

/** Archivo at a design weight (rounds to the nearest loaded variant). */
export function f(weight: 400 | 500 | 600 | 700 | 800 | 900 = 400): TextStyle {
  return { fontFamily: ARCHIVO[weight] };
}

/** Space Mono (400 or 700). */
export function mono(weight: 400 | 700 = 400): TextStyle {
  return { fontFamily: weight === 700 ? 'SpaceMono_700Bold' : 'SpaceMono_400Regular' };
}
