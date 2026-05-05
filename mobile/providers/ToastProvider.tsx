import { colors } from "@/theme/tokens";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastTone = "success" | "error" | "warning";

type ToastItem = {
  id: number;
  title: string;
  message?: string;
  tone: ToastTone;
  duration: number;
};

type ToastContextValue = {
  showToast: (options: { title: string; message?: string; tone?: ToastTone; duration?: number }) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 3200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const translateY = useRef(new Animated.Value(-24)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const dismissActiveToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -24,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setQueue((current) => current.slice(1));
      }
    });
  }, [opacity, translateY]);

  useEffect(() => {
    if (!queue.length) {
      return;
    }

    translateY.setValue(-24);
    opacity.setValue(0);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(dismissActiveToast, queue[0].duration);
    return () => clearTimeout(timer);
  }, [dismissActiveToast, opacity, queue, translateY]);

  const showToast = useCallback((options: { title: string; message?: string; tone?: ToastTone; duration?: number }) => {
    setQueue((current) => [
      ...current,
      {
        id: Date.now() + current.length,
        title: options.title,
        message: options.message,
        tone: options.tone || "success",
        duration: options.duration || TOAST_DURATION,
      },
    ]);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      showSuccess: (title, message) => showToast({ title, message, tone: "success" }),
      showError: (title, message) => showToast({ title, message, tone: "error" }),
      showWarning: (title, message) => showToast({ title, message, tone: "warning" }),
    }),
    [showToast],
  );

  const activeToast = queue[0];
  const toneStyle =
    activeToast?.tone === "error"
      ? styles.error
      : activeToast?.tone === "warning"
        ? styles.warning
        : styles.success;
  const textStyle = activeToast?.tone === "warning" ? styles.toastTextDark : styles.toastTextLight;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {activeToast ? (
        <View pointerEvents="box-none" style={styles.overlay}>
          <Animated.View
            style={[
              styles.toastWrap,
              {
                paddingTop: insets.top + 8,
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <Pressable onPress={dismissActiveToast} style={[styles.toast, toneStyle]}>
              <Text style={[styles.toastTitle, textStyle]}>{activeToast.title}</Text>
              {activeToast.message ? <Text style={[styles.toastMessage, textStyle]}>{activeToast.message}</Text> : null}
            </Pressable>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  toastWrap: {
    paddingHorizontal: 16,
  },
  toast: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  success: {
    backgroundColor: colors.primary,
  },
  error: {
    backgroundColor: colors.danger,
  },
  warning: {
    backgroundColor: "#f2c94c",
  },
  toastTitle: {
    fontWeight: "900",
    fontSize: 14,
  },
  toastMessage: {
    marginTop: 4,
    lineHeight: 20,
    fontWeight: "700",
  },
  toastTextLight: {
    color: colors.white,
  },
  toastTextDark: {
    color: colors.text,
  },
});
