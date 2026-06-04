import React, {useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';

// ── Motion primitives ──────────────────────────────────────────────
// Subtle, tasteful animation only — count-ups on hero numbers, a fill
// that sweeps in, cards that settle on mount. Nothing bouncy. The goal
// is "alive and considered", not playful.

/**
 * Animates a number from its previous value up to `value`. Returns the
 * current in-flight number; the caller formats it (usd, %, etc.).
 * Non-native driver because we read the value each frame.
 */
export const useCountUp = (value = 0, duration = 900) => {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const id = anim.addListener(({value: v}) => setDisplay(v));
    Animated.timing(anim, {
      toValue: value ?? 0,
      duration,
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [anim, value, duration]);

  return display;
};

/**
 * Fade + slight scale/translate settle on mount. Wrap cards or the
 * donut. `delay` staggers a sequence.
 */
export const FadeScaleIn = ({children, delay = 0, from = 0.96, style}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(from)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {toValue: 1, duration: 420, delay, useNativeDriver: true}),
      Animated.spring(scale, {toValue: 1, delay, friction: 8, tension: 60, useNativeDriver: true}),
      Animated.spring(translateY, {toValue: 0, delay, friction: 8, tension: 60, useNativeDriver: true}),
    ]).start();
  }, [opacity, scale, translateY, delay]);

  return (
    <Animated.View style={[{opacity, transform: [{scale}, {translateY}]}, style]}>
      {children}
    </Animated.View>
  );
};

/**
 * Hook returning an Animated width-percent string that sweeps from 0
 * to `percent`% on mount. Feed into an Animated.View style.width.
 */
export const useSweep = (percent = 0, duration = 900) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.max(0, Math.min(100, percent)),
      duration,
      useNativeDriver: false,
    }).start();
  }, [anim, percent, duration]);
  return anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });
};
