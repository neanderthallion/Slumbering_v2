import React, { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { SparkleMark } from './SparkleMark';

export interface ToastOptions {
  /** Show a close (X) button and keep the toast interactive. Default false. */
  dismissible?: boolean;
  /** How long before it auto-fades, in ms. Default 2400. */
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
}

const DEFAULT_DURATION_MS = 2400;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const [dismissible, setDismissible] = useState(false);
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(-12));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }).start();
  }, [opacity]);

  const showToast = useCallback(
    (msg: string, options?: ToastOptions) => {
      setMessage(msg);
      setDismissible(options?.dismissible ?? false);
      if (timerRef.current) clearTimeout(timerRef.current);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      }, options?.durationMs ?? DEFAULT_DURATION_MS);
    },
    [opacity, translateY]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Animated.View
        pointerEvents={dismissible ? 'box-none' : 'none'}
        style={[styles.wrap, { top: insets.top + 12, opacity, transform: [{ translateY }] }]}
      >
        <View style={[theme.shadows.card, styles.shadowWrap]} pointerEvents={dismissible ? 'auto' : 'none'}>
          <LinearGradient
            colors={[theme.colors.bgCardAltFrom, theme.colors.bgCardAltTo]}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={[styles.toast, { borderColor: theme.colors.hairline }]}
          >
            <SparkleMark size={16} color={theme.colors.moonFull} />
            <Text style={{ color: theme.colors.textHi, fontFamily: theme.fonts.bodyBold, fontSize: 13.5 }}>{message}</Text>
            {dismissible && (
              <Pressable onPress={hide} hitSlop={10} style={styles.close}>
                <Ionicons name="close" size={16} color={theme.colors.textMid} />
              </Pressable>
            )}
          </LinearGradient>
        </View>
      </Animated.View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignSelf: 'center',
  },
  shadowWrap: {
    borderRadius: 999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
  },
  close: {
    marginLeft: 2,
  },
});
