import React, { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { SparkleMark } from './SparkleMark';

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [message, setMessage] = useState<string | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(12));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (msg: string) => {
      setMessage(msg);
      if (timerRef.current) clearTimeout(timerRef.current);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      }, 2400);
    },
    [opacity, translateY]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Animated.View pointerEvents="none" style={[styles.wrap, { opacity, transform: [{ translateY }] }]}>
        <View style={[theme.shadows.card, styles.shadowWrap]}>
          <LinearGradient
            colors={[theme.colors.bgCardAltFrom, theme.colors.bgCardAltTo]}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={[styles.toast, { borderColor: theme.colors.hairline }]}
          >
            <SparkleMark size={16} color={theme.colors.moonFull} />
            <Text style={{ color: theme.colors.textHi, fontFamily: theme.fonts.bodyBold, fontSize: 13.5 }}>{message}</Text>
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
    bottom: 40,
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
});
