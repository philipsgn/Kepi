import React, { useEffect, useRef, useState } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import { formatCompactVND, formatVND } from '../../utils/currency';

interface RollingNumberProps {
  value: number;
  format?: 'full' | 'compact';
  isHidden?: boolean;
  style?: StyleProp<TextStyle>;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
}

/**
 * Hiệu ứng Số Lăn (Rolling Number) 500ms
 * - Tự động nội suy con số mượt mà khi giá trị thay đổi
 * - Bắt buộc dùng fontVariant: ['tabular-nums'] để con số không bị giật layout
 * - Tự động che thành "••••" khi bật chế độ riêng tư (isHidden)
 */
export const RollingNumber: React.FC<RollingNumberProps> = ({
  value,
  format = 'full',
  isHidden = false,
  style,
  prefix = '',
  suffix = '',
  durationMs = 500,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const startValueRef = useRef<number>(value);
  const targetValueRef = useRef<number>(value);
  const startTimeRef = useRef<number>(Date.now());
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (value === targetValueRef.current) return;

    startValueRef.current = displayValue;
    targetValueRef.current = value;
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(1, elapsed / durationMs);
      // Easing: easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const current = Math.round(
        startValueRef.current + (targetValueRef.current - startValueRef.current) * easeProgress
      );
      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [value, durationMs]);

  if (isHidden) {
    return <Text style={[styles.text, style]}>••••</Text>;
  }

  const formattedStr = format === 'compact' ? formatCompactVND(displayValue) : formatVND(displayValue);

  return (
    <Text style={[styles.text, style]}>
      {prefix}
      {formattedStr}
      {suffix}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontVariant: ['tabular-nums'],
  },
});
