import React, { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (msg: string) => {
      setMessage(msg);
      if (timerRef.current) clearTimeout(timerRef.current);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      }, 2200);
    },
    [opacity]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.toast,
          {
            opacity,
            backgroundColor: theme.mode === 'dark' ? 'rgba(20,18,45,0.95)' : 'rgba(30,30,50,0.92)',
            borderColor: theme.colors.hairline,
          },
        ]}
      >
        <Text style={{ color: '#fff', fontFamily: theme.fonts.bodyBold, fontSize: 13 }}>{message}</Text>
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
  toast: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
  },
});
