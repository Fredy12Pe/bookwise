/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';
const brandColor = '#211B32';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    brand: brandColor,
    searchBar: '#F3F4F6',
    categoryCard: '#F3F4F6',
    border: '#E5E7EB',
    secondaryText: '#6B7280',
  },
  dark: {
    text: '#ECEDEE',
    background: brandColor,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    brand: brandColor,
    searchBar: '#2F2B43',
    categoryCard: '#2F2B43',
    border: '#3F3D56',
    secondaryText: '#9CA3AF',
  },
};
