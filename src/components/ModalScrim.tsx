import React, { ReactNode } from 'react';
import { Modal, Pressable, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  onClose: () => void;
  children: ReactNode;
  /** Tapping the dimmed backdrop closes the modal. Defaults to true. */
  dismissOnBackdrop?: boolean;
}

/**
 * Shared centered-modal shell for the app's card-style dialogs (badge info,
 * celebration, audio player). Wrapping the content in RN's <Modal> portals it
 * to a native full-screen host, so the card centers on the true viewport and
 * covers the status bar and tab bar regardless of where it's mounted in the
 * tree (e.g. rendered inline from a row deep inside a ScrollView).
 *
 * `onRequestClose` covers the Android hardware back button, so consumers don't
 * need their own BackHandler wiring.
 */
export function ModalScrim({ onClose, children, dismissOnBackdrop = true }: Props) {
  const { theme } = useTheme();

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={dismissOnBackdrop ? onClose : undefined}>
        {/* Inner Pressable with a no-op handler swallows taps so they don't
            reach the backdrop and dismiss the modal. */}
        <Pressable style={[theme.shadows.panel, styles.shadowWrap]} onPress={() => {}}>
          <View style={styles.card}>
            <LinearGradient
              colors={[theme.colors.bgCardAltFrom, theme.colors.bgCardAltTo]}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.85, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.handle, { backgroundColor: theme.colors.borderSubtle }]} />
            {children}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(33,28,62,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  shadowWrap: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 40,
  },
  card: {
    width: '100%',
    borderRadius: 40,
    padding: 28,
    alignItems: 'center',
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    marginBottom: 16,
  },
});
