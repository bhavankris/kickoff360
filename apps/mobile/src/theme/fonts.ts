import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
} from '@expo-google-fonts/archivo';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';

/**
 * The kickoff360 type system: Archivo for UI, Space Mono for labels/numbers.
 * RN needs an exact fontFamily per weight; the loaded variants map onto the
 * NativeWind font classes in tailwind.config.js (`font-archivo-extrabold`,
 * `font-mono-bold`, …) — style text with those, not raw fontFamily.
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
