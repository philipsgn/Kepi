import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import {
  Coffee,
  Coins,
  PiggyBank,
  Plus,
  Receipt,
  Scale,
  Sparkles,
  Trash2,
  User,
  Utensils,
  Wallet,
} from 'lucide-react-native';
import { FavoriteUnit } from '../../src/types/database';
import { useAuthStore } from '../../src/store/authStore';
import { useBudgetStore } from '../../src/store/budgetStore';
import { formatVND } from '../../src/utils/currency';
import { useTheme } from '../../src/theme/ThemeContext';
import { radii } from '../../src/theme/tokens';

/**
 * Biểu tượng Monogram Kepi
 */
function KepiMonogram({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      <Circle cx="28" cy="28" r="26" fill="rgba(229, 152, 68, 0.15)" />
      <Rect x="15" y="12" width="6.5" height="32" rx="3.25" fill="#0F2F24" />
      <Line
        x1="22"
        y1="27"
        x2="39"
        y2="13"
        stroke="#E59844"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      <Line
        x1="23.5"
        y1="27"
        x2="39"
        y2="43"
        stroke="#1B4D3E"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      <Circle cx="40" cy="12" r="3.5" fill="#E59844" />
    </Svg>
  );
}

interface FixedCostItem {
  id: string;
  name: string;
  amount: number;
}

const QUICK_FIXED_SUGGESTIONS = [
  'Tiền trọ',
  'Điện nước',
  'Internet',
  'Ăn uống/Chợ',
  'Trả góp',
];

/**
 * Chuyển đổi vị trí tỉ lệ ratio [0, 1] sang số tiền VND (Non-linear scale)
 * - 0.0 - 0.5: 0 đến 30 triệu (bước nhảy 500k, cực êm cho phần lớn người dùng)
 * - 0.5 - 0.8: 30 triệu đến 100 triệu (bước nhảy 5 triệu)
 * - 0.8 - 1.0: 100 triệu đến 300 triệu (bước nhảy 10 triệu)
 */
function ratioToIncome(ratio: number): number {
  const clamped = Math.max(0, Math.min(1, ratio));
  if (clamped <= 0.5) {
    const subRatio = clamped / 0.5;
    const raw = subRatio * 30000000;
    return Math.round(raw / 500000) * 500000;
  } else if (clamped <= 0.8) {
    const subRatio = (clamped - 0.5) / 0.3;
    const raw = 30000000 + subRatio * 70000000;
    return Math.round(raw / 5000000) * 5000000;
  } else {
    const subRatio = (clamped - 0.8) / 0.2;
    const raw = 100000000 + subRatio * 200000000;
    return Math.round(raw / 10000000) * 10000000;
  }
}

/**
 * Chuyển đổi số tiền VND sang tỉ lệ ratio [0, 1] trên thanh trượt
 */
function incomeToRatio(amount: number): number {
  if (amount <= 0) return 0;
  if (amount <= 30000000) {
    return (amount / 30000000) * 0.5;
  } else if (amount <= 100000000) {
    return 0.5 + ((amount - 30000000) / 70000000) * 0.3;
  } else if (amount <= 300000000) {
    return 0.8 + ((amount - 100000000) / 200000000) * 0.2;
  }
  return 1.0;
}

/**
 * Định dạng rút gọn số tiền trên chip (ví dụ 3.000.000 -> 3tr, 500.000 -> 500k)
 */
function formatCompactVND(amount: number): string {
  if (amount <= 0) return '';
  if (amount >= 1000000) {
    const tr = amount / 1000000;
    return `${Number(tr.toFixed(1))}tr`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return `${Number(k.toFixed(0))}k`;
  }
  return `${amount}đ`;
}

interface IncomeSliderProps {
  value: number;
  onChange: (val: number) => void;
  primaryColor: string;
  isDark: boolean;
  textColorMuted: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

/**
 * Thanh trượt Thu nhập Tương tác Xúc giác Siêu mượt (Non-linear Interactive Slider)
 * Zero native dependencies - PanResponder tối ưu 60fps chống khựng / ngắt cử chỉ
 */
function IncomeSlider({
  value,
  onChange,
  primaryColor,
  isDark,
  textColorMuted,
  onDragStart,
  onDragEnd,
}: IncomeSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<View>(null);
  const trackWidthRef = useRef(0);
  const trackPageXRef = useRef(0);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onDragStartRef = useRef(onDragStart);
  onDragStartRef.current = onDragStart;

  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  const lastHapticRef = useRef(value);
  const lastHapticTimeRef = useRef(0);

  const triggerIncomeUpdate = useCallback((ratio: number) => {
    const newIncome = ratioToIncome(ratio);
    if (newIncome !== lastHapticRef.current) {
      lastHapticRef.current = newIncome;
      const now = Date.now();
      if (now - lastHapticTimeRef.current > 35) {
        lastHapticTimeRef.current = now;
        Haptics.selectionAsync();
      }
    }
    onChangeRef.current(newIncome);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (evt) => {
        onDragStartRef.current?.();
        // Tính toạ độ tuyệt đối tức thì của thanh trượt: pageX - locationX
        const trackPageX = evt.nativeEvent.pageX - evt.nativeEvent.locationX;
        trackPageXRef.current = trackPageX;
        if (trackWidthRef.current > 0) {
          const ratio = Math.max(0, Math.min(1, evt.nativeEvent.locationX / trackWidthRef.current));
          triggerIncomeUpdate(ratio);
        }
      },
      onPanResponderMove: (evt) => {
        if (trackWidthRef.current > 0) {
          const touchX = evt.nativeEvent.pageX - trackPageXRef.current;
          const ratio = Math.max(0, Math.min(1, touchX / trackWidthRef.current));
          triggerIncomeUpdate(ratio);
        }
      },
      onPanResponderRelease: () => {
        onDragEndRef.current?.();
      },
      onPanResponderTerminate: () => {
        onDragEndRef.current?.();
      },
    })
  ).current;

  const ratio = incomeToRatio(value);
  const thumbLeft =
    trackWidth > 0 ? Math.max(0, Math.min(trackWidth - 26, ratio * (trackWidth - 26))) : 0;

  return (
    <View style={styles.sliderContainer}>
      <View
        ref={trackRef}
        style={styles.sliderTrackTouchArea}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          trackWidthRef.current = w;
          setTrackWidth(w);
          trackRef.current?.measure((_x, _y, _w, _h, pageX) => {
            if (pageX !== undefined) {
              trackPageXRef.current = pageX;
            }
          });
        }}
        {...panResponder.panHandlers}
      >
        {/* RÃNH TRƯỢT NỀN */}
        <View
          pointerEvents="none"
          style={[
            styles.sliderTrackBackground,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.06)',
            },
          ]}
        >
          {/* DẢI MÀU HOẠT ĐỘNG */}
          <View
            style={[
              styles.sliderTrackActive,
              {
                width: `${Math.round(ratio * 100)}%`,
                backgroundColor: primaryColor,
              },
            ]}
          />
        </View>

        {/* NÚT TRƯỢT THUMB */}
        {trackWidth > 0 && (
          <View
            pointerEvents="none"
            style={[
              styles.sliderThumb,
              {
                left: thumbLeft,
                backgroundColor: primaryColor,
              },
            ]}
          />
        )}
      </View>

      {/* MỐC ĐỊNH HƯỚNG TRỰC QUAN */}
      <View style={styles.milestoneRow}>
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            onChange(0);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.milestoneText, { color: textColorMuted }]}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            onChange(15000000);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.milestoneText, { color: textColorMuted }]}>15tr</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            onChange(30000000);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.milestoneText, { color: textColorMuted }]}>30tr</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            onChange(100000000);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.milestoneText, { color: textColorMuted }]}>100tr</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            onChange(300000000);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.milestoneText, { color: textColorMuted }]}>300tr+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface FixedCostSliderProps {
  value: number;
  onChange: (val: number) => void;
  sliderColor: string;
  isDark: boolean;
  textColorMuted: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

/**
 * Chuyển đổi vị trí tỉ lệ ratio [0, 1] sang số tiền Chi phí cố định (Non-linear scale)
 * - 0.0 - 0.4: 0 đến 4 triệu (bước nhảy 100k, cực êm cho tiền điện, nước, net, chi tiêu định kỳ nhỏ)
 * - 0.4 - 0.75: 4 triệu đến 15 triệu (bước nhảy 500k, tối ưu cho tiền trọ / thuê nhà)
 * - 0.75 - 1.0: 15 triệu đến 30 triệu (bước nhảy 1 triệu, cho nhà cao cấp hoặc trả góp lớn)
 */
function ratioToFixedCost(ratio: number): number {
  const clamped = Math.max(0, Math.min(1, ratio));
  if (clamped <= 0.4) {
    const subRatio = clamped / 0.4;
    const raw = subRatio * 4000000;
    return Math.round(raw / 100000) * 100000;
  } else if (clamped <= 0.75) {
    const subRatio = (clamped - 0.4) / 0.35;
    const raw = 4000000 + subRatio * 11000000;
    return Math.round(raw / 500000) * 500000;
  } else {
    const subRatio = (clamped - 0.75) / 0.25;
    const raw = 15000000 + subRatio * 15000000;
    return Math.round(raw / 1000000) * 1000000;
  }
}

function fixedCostToRatio(amount: number): number {
  if (amount <= 0) return 0;
  if (amount <= 4000000) {
    return (amount / 4000000) * 0.4;
  } else if (amount <= 15000000) {
    return 0.4 + ((amount - 4000000) / 11000000) * 0.35;
  } else if (amount <= 30000000) {
    return 0.75 + ((amount - 15000000) / 15000000) * 0.25;
  }
  return 1.0;
}

/**
 * Thanh trượt Chi Phí Cố Định Tương Tác Xúc Giác Gọn Gàng (Tactile Mini-Slider)
 * Zero native dependencies - PanResponder tối ưu 60fps
 */
function FixedCostSlider({
  value,
  onChange,
  sliderColor,
  isDark,
  textColorMuted,
  onDragStart,
  onDragEnd,
}: FixedCostSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<View>(null);
  const trackWidthRef = useRef(0);
  const trackPageXRef = useRef(0);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onDragStartRef = useRef(onDragStart);
  onDragStartRef.current = onDragStart;

  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  const lastHapticRef = useRef(value);
  const lastHapticTimeRef = useRef(0);

  const triggerUpdate = useCallback((ratio: number) => {
    const newAmount = ratioToFixedCost(ratio);
    if (newAmount !== lastHapticRef.current) {
      lastHapticRef.current = newAmount;
      const now = Date.now();
      if (now - lastHapticTimeRef.current > 35) {
        lastHapticTimeRef.current = now;
        Haptics.selectionAsync();
      }
    }
    onChangeRef.current(newAmount);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (evt) => {
        onDragStartRef.current?.();
        const trackPageX = evt.nativeEvent.pageX - evt.nativeEvent.locationX;
        trackPageXRef.current = trackPageX;
        if (trackWidthRef.current > 0) {
          const ratio = Math.max(0, Math.min(1, evt.nativeEvent.locationX / trackWidthRef.current));
          triggerUpdate(ratio);
        }
      },
      onPanResponderMove: (evt) => {
        if (trackWidthRef.current > 0) {
          const touchX = evt.nativeEvent.pageX - trackPageXRef.current;
          const ratio = Math.max(0, Math.min(1, touchX / trackWidthRef.current));
          triggerUpdate(ratio);
        }
      },
      onPanResponderRelease: () => {
        onDragEndRef.current?.();
      },
      onPanResponderTerminate: () => {
        onDragEndRef.current?.();
      },
    })
  ).current;

  const ratio = fixedCostToRatio(value);
  const thumbLeft =
    trackWidth > 0 ? Math.max(0, Math.min(trackWidth - 22, ratio * (trackWidth - 22))) : 0;

  return (
    <View style={styles.fixedSliderContainer}>
      <View
        ref={trackRef}
        style={styles.fixedSliderTrackTouchArea}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          trackWidthRef.current = w;
          setTrackWidth(w);
          trackRef.current?.measure((_x, _y, _w, _h, pageX) => {
            if (pageX !== undefined) {
              trackPageXRef.current = pageX;
            }
          });
        }}
        {...panResponder.panHandlers}
      >
        {/* RÃNH TRƯỢT NỀN */}
        <View
          pointerEvents="none"
          style={[
            styles.fixedSliderTrackBackground,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.06)',
            },
          ]}
        >
          {/* DẢI MÀU HOẠT ĐỘNG */}
          <View
            style={[
              styles.fixedSliderTrackActive,
              {
                width: `${Math.round(ratio * 100)}%`,
                backgroundColor: sliderColor,
              },
            ]}
          />
        </View>

        {/* NÚT TRƯỢT THUMB NHỎ XINH (22px) */}
        {trackWidth > 0 && (
          <View
            pointerEvents="none"
            style={[
              styles.fixedSliderThumb,
              {
                left: thumbLeft,
                backgroundColor: sliderColor,
              },
            ]}
          />
        )}
      </View>

      {/* MỐC ĐỊNH HƯỚNG GỌN GÀNG [0, 4tr, 15tr, 30tr+] */}
      <View style={styles.fixedMilestoneRow}>
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            onChange(0);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.fixedMilestoneText, { color: textColorMuted }]}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            onChange(4000000);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.fixedMilestoneText, { color: textColorMuted }]}>4tr</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            onChange(15000000);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.fixedMilestoneText, { color: textColorMuted }]}>15tr</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            onChange(30000000);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.fixedMilestoneText, { color: textColorMuted }]}>30tr+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface ZeroBasedSplitterProps {
  ratio: number; // 0.0 to 1.0 (tỉ lệ trích tích lũy trên tiền khả dụng)
  disposableIncome: number;
  savingsAmount: number;
  monthlySpendAmount: number;
  dailyBudget: number;
  onChangeRatio: (newRatio: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isDark: boolean;
  textColorMuted: string;
}

const MAX_SPLIT_RATIO = 1.0; // Cho phép phân bổ toàn dải 0% - 100% linh hoạt theo quyền quyết định của người dùng

/**
 * Thanh phân bổ Cân Bằng Số 0 (Zero-Based Splitter)
 * Tách tiền khả dụng thành [Tích lũy tháng] và [Tiền tiêu 30 ngày] trên 1 trục duy nhất
 * Đảm bảo 100% ngân sách được phân bổ trọn vẹn, không dư thừa, không âm ví.
 * Zero native dependencies - PanResponder 60fps mượt mà
 */
function ZeroBasedSplitter({
  ratio,
  disposableIncome,
  savingsAmount,
  monthlySpendAmount,
  dailyBudget,
  onChangeRatio,
  onDragStart,
  onDragEnd,
  isDark,
  textColorMuted,
}: ZeroBasedSplitterProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<View>(null);
  const trackWidthRef = useRef(0);
  const trackPageXRef = useRef(0);

  const onChangeRatioRef = useRef(onChangeRatio);
  onChangeRatioRef.current = onChangeRatio;

  const onDragStartRef = useRef(onDragStart);
  onDragStartRef.current = onDragStart;

  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  const lastPercentHapticRef = useRef(Math.round(ratio * 100));
  const lastHapticTimeRef = useRef(0);

  const triggerRatioUpdate = useCallback((rawRatio: number) => {
    // Giới hạn trong khoảng [0, MAX_SPLIT_RATIO]
    const clampedRatio = Math.max(0, Math.min(MAX_SPLIT_RATIO, rawRatio));
    // Làm tròn tới bước 1% (0.01)
    const roundedRatio = Math.round(clampedRatio * 100) / 100;
    const currentPercent = Math.round(roundedRatio * 100);

    if (currentPercent !== lastPercentHapticRef.current) {
      lastPercentHapticRef.current = currentPercent;
      const now = Date.now();
      if (now - lastHapticTimeRef.current > 35) {
        lastHapticTimeRef.current = now;
        Haptics.selectionAsync();
      }
    }
    onChangeRatioRef.current(roundedRatio);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (evt) => {
        onDragStartRef.current?.();
        const trackPageX = evt.nativeEvent.pageX - evt.nativeEvent.locationX;
        trackPageXRef.current = trackPageX;
        if (trackWidthRef.current > 0) {
          const rawRatio = evt.nativeEvent.locationX / trackWidthRef.current;
          triggerRatioUpdate(rawRatio);
        }
      },
      onPanResponderMove: (evt) => {
        if (trackWidthRef.current > 0) {
          const touchX = evt.nativeEvent.pageX - trackPageXRef.current;
          const rawRatio = touchX / trackWidthRef.current;
          triggerRatioUpdate(rawRatio);
        }
      },
      onPanResponderRelease: () => {
        onDragEndRef.current?.();
      },
      onPanResponderTerminate: () => {
        onDragEndRef.current?.();
      },
    })
  ).current;

  // Tính vị trí nút thumb trên thanh trượt
  // Bên trái [0 -> ratio] là Tích lũy (#7E9F80 Cốm non)
  // Bên phải [ratio -> 1.0] là Tiền tiêu tháng (#E59844 Vàng thu)
  const thumbWidth = 28;
  const thumbLeft =
    trackWidth > 0 ? Math.max(0, Math.min(trackWidth - thumbWidth, ratio * (trackWidth - thumbWidth))) : 0;



  return (
    <View style={styles.splitterOuterWrapper}>
      {/* THANH KÉO BI-COLOR ĐA CHIỀU */}
      <View
        ref={trackRef}
        style={styles.splitterTouchArea}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          trackWidthRef.current = w;
          setTrackWidth(w);
          trackRef.current?.measure((_x, _y, _w, _h, pageX) => {
            if (pageX !== undefined) {
              trackPageXRef.current = pageX;
            }
          });
        }}
        {...panResponder.panHandlers}
      >
        {/* RÃNH NỀN: PHẦN PHẢI LÀ CHI TIÊU (#E59844) */}
        <View
          pointerEvents="none"
          style={[
            styles.splitterTrackBackground,
            {
              backgroundColor: isDark ? 'rgba(229, 152, 68, 0.4)' : 'rgba(229, 152, 68, 0.25)',
            },
          ]}
        >
          {/* PHẦN TRÁI: DẢI TÍCH LŨY (#7E9F80) */}
          <View
            style={[
              styles.splitterSavingsSegment,
              {
                width: `${Math.round(ratio * 100)}%`,
                backgroundColor: '#7E9F80',
              },
            ]}
          />
        </View>

        {/* NÚT THUMB CHUNKY NẰM NGAY ĐIỂM CHIA */}
        {trackWidth > 0 && (
          <View
            pointerEvents="none"
            style={[
              styles.splitterThumb,
              {
                left: thumbLeft,
                backgroundColor: '#FFFFFF',
                borderColor: ratio > 0 ? '#7E9F80' : '#E59844',
              },
            ]}
          >
            {/* Vạch grip ở giữa nút */}
            <View style={styles.splitterGripLines}>
              <View style={[styles.splitterGripBar, { backgroundColor: ratio > 0 ? '#7E9F80' : '#E59844' }]} />
              <View style={[styles.splitterGripBar, { backgroundColor: ratio > 0 ? '#7E9F80' : '#E59844' }]} />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Màn hình Thiết lập Chào mừng Kepi (Fun Minimalist Onboarding)
 * Tuân thủ mục 37 DECISIONS.md & Aesthetic Hà Nội Thu Đông:
 * - Ít chữ, tiêu đề ngắn gọn, spacing thu hẹp compact.
 * - Icon phẳng borderless (lược bỏ hoàn toàn viền bo ngoài quanh icon).
 * - Người dùng chỉ nhập Tên, Thu nhập; thêm nhiều khoản Cố định bằng icon `+` hoặc chip gợi ý.
 * - Hạn mức tiêu ngày tự động tính toán tức thì kèm Live Preview sinh động.
 * - Hỗ trợ nút "Đặt nhanh 100k/ngày & Vào luôn" cho học sinh / freelancer chưa có lương cố định.
 */
export default function BudgetSetupScreen() {
  const router = useRouter();
  const { tokens, isDark } = useTheme();
  const { user, profile, updateProfile, setHasCompletedBudgetSetup } = useAuthStore();
  const { setupBudget } = useBudgetStore();

  // 1. Tên hiển thị (Bắt buộc)
  const [name, setName] = useState(profile?.full_name || user?.full_name || '');

  // 2. Thu nhập hàng tháng
  const [incomeStr, setIncomeStr] = useState('');
  const parsedIncome = parseInt(incomeStr.replace(/\D/g, ''), 10) || 0;

  // 3. Danh sách Chi phí cố định nhiều khoản (Multi-item list)
  const [fixedCosts, setFixedCosts] = useState<FixedCostItem[]>([]);

  // Chip cố định đang được chọn để nhập tiền (Active Chip Focus)
  const [activeFixedId, setActiveFixedId] = useState<string | null>(null);

  // Danh sách các custom item (không nằm trong danh sách gợi ý sẵn)
  const customFixedItems = useMemo(() => {
    return fixedCosts.filter((item) => !QUICK_FIXED_SUGGESTIONS.includes(item.name));
  }, [fixedCosts]);

  // Khoản đang được chọn để nhập tiền
  const activeItem = useMemo(() => {
    return fixedCosts.find((f) => f.id === activeFixedId);
  }, [fixedCosts, activeFixedId]);

  // 4. Tỉ lệ tích lũy tháng (Zero-Based Splitter: mặc định 20% tiền khả dụng)
  const [savingsRatio, setSavingsRatio] = useState<number>(0.2);

  // 5. Đơn vị quy đổi vui vẻ
  const [favUnit, setFavUnit] = useState<FavoriteUnit>('tra_sua');

  // Tổng chi phí cố định (chỉ tính các khoản có amount > 0)
  const totalFixedCosts = useMemo(() => {
    return fixedCosts.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [fixedCosts]);

  // Tiền khả dụng sau khi trừ hóa đơn bắt buộc = Thu nhập - Tổng cố định
  const disposableIncome = useMemo(() => {
    return Math.max(0, parsedIncome - totalFixedCosts);
  }, [parsedIncome, totalFixedCosts]);

  // Số tiền tích lũy tháng = disposableIncome * savingsRatio (làm tròn tới 100k)
  const savingsGoalAmount = useMemo(() => {
    if (disposableIncome <= 0) return 0;
    return Math.round((disposableIncome * savingsRatio) / 100000) * 100000;
  }, [disposableIncome, savingsRatio]);

  // Tổng tiền chi tiêu 30 ngày = Tiền khả dụng - Tích lũy (nguyên tắc Cân bằng số 0)
  const monthlyDiscretionarySpend = useMemo(() => {
    if (disposableIncome <= 0) return 0;
    return Math.max(0, disposableIncome - savingsGoalAmount);
  }, [disposableIncome, savingsGoalAmount]);

  // Hạn mức ngày tự động tính = Tổng chi tiêu tháng / 30 ngày
  const autoCalculatedDaily = useMemo(() => {
    if (monthlyDiscretionarySpend <= 0) return 0;
    return Math.floor(monthlyDiscretionarySpend / 30);
  }, [monthlyDiscretionarySpend]);

  // Cảnh báo khi chi phí cố định vượt quá hoặc bằng thu nhập
  const isFixedExceedIncome = parsedIncome > 0 && totalFixedCosts >= parsedIncome;

  // Điều kiện để kích hoạt Hero Card Cân Bằng Số 0: Thu nhập > 0 và Khả dụng > 0 (không bắt buộc phải có chi phí cố định)
  const isBudgetCalculated = parsedIncome > 0 && disposableIncome > 0;

  // Điều khiển cuộn ScrollView (tắt khi người dùng đang kéo thanh trượt)
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // Kích hoạt hoặc thêm chip gợi ý (Active Chip Focus)
  const handleSelectSuggestedFixedCost = (suggestedName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const existing = fixedCosts.find((it) => it.name === suggestedName);
    if (existing) {
      setActiveFixedId(existing.id);
    } else {
      const newId = `fixed-${suggestedName}-${Date.now()}`;
      const newItem: FixedCostItem = {
        id: newId,
        name: suggestedName,
        amount: 0,
      };
      setFixedCosts((prev) => [...prev, newItem]);
      setActiveFixedId(newId);
    }
  };

  // Thêm một khoản cố định tuỳ biến mới và focus ngay
  const handleAddCustomFixedCost = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newId = `fixed-custom-${Date.now()}`;
    const newItem: FixedCostItem = {
      id: newId,
      name: '',
      amount: 0,
    };
    setFixedCosts((prev) => [...prev, newItem]);
    setActiveFixedId(newId);
  };

  // Cập nhật tên hoặc số tiền của khoản cố định
  const handleUpdateFixedCost = (id: string, updates: Partial<FixedCostItem>) => {
    setFixedCosts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Xóa khoản cố định
  const handleRemoveFixedCost = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFixedCosts((prev) => prev.filter((item) => item.id !== id));
    if (activeFixedId === id) {
      setActiveFixedId(null);
    }
  };

  // Hoàn tất luồng nhập liệu chuẩn
  const handleFinish = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Chào bạn!', 'Hãy cho Kepi biết tên hoặc biệt danh của bạn nhé.');
      return;
    }

    if (parsedIncome <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Thu nhập hàng tháng',
        'Vui lòng nhập thu nhập ước tính, hoặc bấm "Đặt nhanh 100k/ngày & Vào luôn" ở bên dưới.'
      );
      return;
    }

    if (totalFixedCosts >= parsedIncome) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Chi phí cố định vượt thu nhập',
        `Tổng chi phí cố định (${formatVND(totalFixedCosts)}) đang lớn hơn hoặc bằng thu nhập (${formatVND(parsedIncome)}). Vui lòng điều chỉnh lại để bắt đầu phân bổ ngân sách.`
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const targetUserId = user?.id || `guest-${Date.now()}`;
    await updateProfile({
      full_name: trimmedName,
      fav_unit: favUnit,
    });

    try {
      await AsyncStorage.setItem('vi_locket_fixed_cost_items', JSON.stringify(fixedCosts));
      await AsyncStorage.setItem('vi_locket_savings_ratio', String(savingsRatio));
    } catch (err) {
      console.warn('Failed to save setup fixed costs:', err);
    }

    await setupBudget({
      userId: targetUserId,
      monthlyIncome: parsedIncome,
      monthlyFixedCosts: totalFixedCosts,
      goalName: 'Mục tiêu tích lũy tháng',
      goalTargetAmount: savingsGoalAmount,
      favUnit,
    });

    setHasCompletedBudgetSetup(true);
    router.replace('/(main)');
  };

  // Lối tắt: Bỏ qua thu nhập, đặt nhanh 100k/ngày & vào luôn (cho học sinh/freelancer)
  const handleQuickSkipForStudent = async () => {
    const trimmedName = name.trim() || 'Bạn';
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const targetUserId = user?.id || `guest-${Date.now()}`;
    await updateProfile({
      full_name: trimmedName,
      fav_unit: favUnit,
    });

    // Thu nhập 3.000.000đ, Cố định 0đ => Hạn mức 100.000đ/ngày
    await setupBudget({
      userId: targetUserId,
      monthlyIncome: 3000000,
      monthlyFixedCosts: 0,
      goalName: '',
      goalTargetAmount: 0,
      favUnit,
    });

    setHasCompletedBudgetSetup(true);
    router.replace('/(main)');
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#0E1620' : '#FAF6EC' },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          scrollEnabled={scrollEnabled}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER CHÀO MỪNG NHỎ GỌN */}
          <View style={styles.header}>
            <View style={styles.monogramBox}>
              <KepiMonogram size={46} />
            </View>
            <Text style={[styles.welcomeTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
              Kepi xin chào!
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: isDark ? 'rgba(250, 246, 236, 0.65)' : '#55606D' }]}>
              Cùng làm quen và giữ ví tỉnh táo nhé
            </Text>
          </View>

          {/* CARD 1: TÊN BẠN */}
          <View
            style={[
              styles.cardSection,
              {
                backgroundColor: isDark ? '#162231' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View style={styles.sectionLabelRow}>
              <User size={17} color={tokens.primary} strokeWidth={2.4} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                Tên hoặc Biệt danh <Text style={styles.requiredStar}>*</Text>
              </Text>
            </View>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FAF6EC',
                  color: isDark ? '#FFFFFF' : '#1B2733',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                },
              ]}
              placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.35)' : '#99A1AF'}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* CARD 2: THU NHẬP HÀNG THÁNG */}
          <View
            style={[
              styles.cardSection,
              {
                backgroundColor: isDark ? '#162231' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View style={styles.sectionLabelRow}>
              <Wallet size={17} color={tokens.primary} strokeWidth={2.4} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                Thu nhập ước tính / tháng
              </Text>
            </View>

            {/* Ô NHẬP TIỀN CÓ HẬU TỐ "đ" CỐ ĐỊNH BÊN NGOÀI - CHỐNG KẸT PHÍM BACKSPACE */}
            <View
              style={[
                styles.currencyInputContainer,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FAF6EC',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                },
              ]}
            >
              <TextInput
                style={[
                  styles.currencyTextInput,
                  {
                    color: isDark ? '#FFFFFF' : '#1B2733',
                  },
                ]}
                placeholder="0"
                placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.35)' : '#99A1AF'}
                keyboardType="numeric"
                value={parsedIncome > 0 ? parsedIncome.toLocaleString('vi-VN') : ''}
                onChangeText={(val) => {
                  const cleaned = val.replace(/\D/g, '');
                  setIncomeStr(cleaned);
                }}
              />
              <Text
                style={[
                  styles.currencySuffix,
                  {
                    color:
                      parsedIncome > 0
                        ? tokens.primary
                        : isDark
                        ? 'rgba(255, 255, 255, 0.35)'
                        : '#99A1AF',
                  },
                ]}
              >
                đ
              </Text>
            </View>

            {/* THANH TRƯỢT THU NHẬP PHI TUYẾN TÍNH (0 - 300TR+) */}
            <IncomeSlider
              value={parsedIncome}
              onChange={(newVal) => {
                setIncomeStr(newVal > 0 ? newVal.toString() : '');
              }}
              onDragStart={() => setScrollEnabled(false)}
              onDragEnd={() => setScrollEnabled(true)}
              primaryColor={tokens.primary}
              isDark={isDark}
              textColorMuted={tokens.textMuted}
            />
          </View>

          {/* CARD 3: CHI PHÍ CỐ ĐỊNH (NHIỀU KHOẢN VỚI ICON +) */}
          <View
            style={[
              styles.cardSection,
              {
                backgroundColor: isDark ? '#162231' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View style={styles.sectionHeaderBetween}>
              <View style={styles.sectionLabelRow}>
                <Receipt size={17} color={tokens.primary} strokeWidth={2.4} />
                <Text style={[styles.sectionTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                  Chi phí cố định ({fixedCosts.length})
                </Text>
              </View>

              {/* NÚT + THÊM DÒNG MỚI (ICON-ONLY MINIMALIST) */}
              <TouchableOpacity
                style={[styles.addInlineButton, { backgroundColor: tokens.primary }]}
                onPress={handleAddCustomFixedCost}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Thêm chi phí cố định"
              >
                <Plus size={15} color="#0E1620" strokeWidth={2.8} />
              </TouchableOpacity>
            </View>

            {/* DẢI CHIP GỢI Ý & CUSTOM (ACTIVE CHIP FOCUS) */}
            <View style={styles.suggestionChipsScroll}>
              {QUICK_FIXED_SUGGESTIONS.map((name) => {
                const existing = fixedCosts.find((f) => f.name === name);
                const isSelected = activeFixedId !== null && existing?.id === activeFixedId;
                const amount = existing?.amount || 0;
                const hasAmount = amount > 0;

                let chipLabel = `+ ${name}`;
                if (hasAmount) {
                  chipLabel = `${name} • ${formatCompactVND(amount)}`;
                } else if (existing) {
                  chipLabel = name;
                }

                return (
                  <TouchableOpacity
                    key={name}
                    style={[
                      styles.suggestionChip,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? 'rgba(229, 152, 68, 0.25)'
                            : 'rgba(229, 152, 68, 0.2)'
                          : hasAmount
                          ? isDark
                            ? 'rgba(229, 152, 68, 0.12)'
                            : 'rgba(229, 152, 68, 0.1)'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.05)'
                          : '#FAF6EC',
                        borderColor: isSelected
                          ? tokens.primary
                          : hasAmount
                          ? 'rgba(229, 152, 68, 0.5)'
                          : 'transparent',
                      },
                    ]}
                    onPress={() => handleSelectSuggestedFixedCost(name)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.suggestionChipText,
                        {
                          color: isSelected || hasAmount
                            ? tokens.primary
                            : isDark
                            ? '#FAF6EC'
                            : '#55606D',
                          fontWeight: isSelected || hasAmount ? '700' : '500',
                        },
                      ]}
                    >
                      {chipLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* CÁC CHIP TÙY BIẾN THÊM TỪ NÚT + */}
              {customFixedItems.map((item) => {
                const isSelected = activeFixedId === item.id;
                const amount = item.amount || 0;
                const hasAmount = amount > 0;
                const displayName = item.name.trim() || 'Khoản mới';

                let chipLabel = displayName;
                if (hasAmount) {
                  chipLabel = `${displayName} • ${formatCompactVND(amount)}`;
                }

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.suggestionChip,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? 'rgba(229, 152, 68, 0.25)'
                            : 'rgba(229, 152, 68, 0.2)'
                          : hasAmount
                          ? isDark
                            ? 'rgba(229, 152, 68, 0.12)'
                            : 'rgba(229, 152, 68, 0.1)'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.05)'
                          : '#FAF6EC',
                        borderColor: isSelected
                          ? tokens.primary
                          : hasAmount
                          ? 'rgba(229, 152, 68, 0.5)'
                          : 'transparent',
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setActiveFixedId(item.id);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.suggestionChipText,
                        {
                          color: isSelected || hasAmount
                            ? tokens.primary
                            : isDark
                            ? '#FAF6EC'
                            : '#55606D',
                          fontWeight: isSelected || hasAmount ? '700' : '500',
                        },
                      ]}
                    >
                      {chipLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* KHU VỰC NHẬP TIỀN TẬP TRUNG CHO CHIP ĐANG CHỌN (ACTIVE CHIP FOCUS) */}
            {activeItem ? (
              <View
                style={[
                  styles.activeEditorBox,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#FAF6EC',
                    borderColor: isDark ? 'rgba(229, 152, 68, 0.3)' : 'rgba(229, 152, 68, 0.25)',
                  },
                ]}
              >
                <View style={styles.activeEditorHeader}>
                  {QUICK_FIXED_SUGGESTIONS.includes(activeItem.name) ? (
                    <Text style={[styles.activeEditorTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                      {activeItem.name}
                    </Text>
                  ) : (
                    <TextInput
                      style={[styles.activeCustomNameInput, { color: isDark ? '#FFFFFF' : '#1B2733' }]}
                      placeholder="Tên khoản..."
                      placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.35)' : '#99A1AF'}
                      value={activeItem.name}
                      onChangeText={(val) => handleUpdateFixedCost(activeItem.id, { name: val })}
                      autoFocus={!activeItem.name}
                    />
                  )}

                  <TouchableOpacity
                    onPress={() => handleRemoveFixedCost(activeItem.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.trashBtn}
                    accessibilityLabel="Xóa khoản này"
                  >
                    <Trash2 size={16} color={tokens.danger} strokeWidth={2.2} />
                  </TouchableOpacity>
                </View>

                {/* Ô NHẬP SỐ TIỀN CÓ HẬU TỐ "đ" */}
                <View
                  style={[
                    styles.currencyInputContainer,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      marginBottom: 0,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.currencyTextInput, { color: tokens.danger }]}
                    placeholder="0"
                    placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.35)' : '#99A1AF'}
                    keyboardType="numeric"
                    value={activeItem.amount > 0 ? activeItem.amount.toLocaleString('vi-VN') : ''}
                    onChangeText={(val) => {
                      const num = parseInt(val.replace(/\D/g, ''), 10) || 0;
                      handleUpdateFixedCost(activeItem.id, { amount: num });
                    }}
                    autoFocus={!!activeItem.name}
                  />
                  <Text style={[styles.currencySuffix, { color: tokens.danger }]}>đ</Text>
                </View>

                {/* THANH TRƯỢT CHI PHÍ CỐ ĐỊNH GỌN GÀNG, MƯỢT MÀ */}
                <FixedCostSlider
                  value={activeItem.amount}
                  onChange={(newAmount) => handleUpdateFixedCost(activeItem.id, { amount: newAmount })}
                  onDragStart={() => setScrollEnabled(false)}
                  onDragEnd={() => setScrollEnabled(true)}
                  sliderColor={tokens.danger}
                  isDark={isDark}
                  textColorMuted={tokens.textMuted}
                />
              </View>
            ) : null}

            {/* TỔNG CỘNG CHI PHÍ CỐ ĐỊNH */}
            <View style={styles.fixedTotalRow}>
              <Text style={[styles.fixedTotalLabel, { color: tokens.textMuted }]}>
                Tổng cố định:
              </Text>
              <Text style={[styles.fixedTotalAmount, { color: tokens.danger }]}>
                {formatVND(totalFixedCosts)}
              </Text>
            </View>
          </View>

          {/* CARD 4: PHÂN BỔ CÂN BẰNG SỐ 0 (HERO CARD) HOẶC PLACEHOLDER */}
          {isBudgetCalculated ? (
            <View
              style={[
                styles.heroZeroCard,
                {
                  backgroundColor: isDark ? '#162231' : '#FFFFFF',
                  borderColor: tokens.primary,
                  shadowColor: '#E59844',
                },
              ]}
            >
              {/* TIÊU ĐỀ CARD & DÒNG PHỤ KHẢ DỤNG XUỐNG DÒNG (KHÔNG CHẠM NHAU) */}
              <View style={styles.heroZeroHeaderCol}>
                <View style={styles.sectionLabelRow}>
                  <Scale size={17} color={tokens.primary} strokeWidth={2.4} />
                  <Text
                    style={[
                      styles.heroZeroTitle,
                      { color: isDark ? '#FAF6EC' : '#1B2733' },
                    ]}
                  >
                    Cân bằng ngân sách
                  </Text>
                </View>
                <Text style={[styles.disposableSubtext, { color: tokens.textMuted }]}>
                  Khả dụng:{' '}
                  <Text style={{ color: tokens.primary, fontWeight: '700' }}>
                    {formatVND(disposableIncome)}
                  </Text>
                </Text>
              </View>

              {/* TẦNG 1: DÒNG TIỀN THÁNG (TÍCH LŨY THÁNG & CHI TIÊU THÁNG) */}
              <View style={styles.pillarsContainer}>
                {/* CỘT TRÁI: TÍCH LŨY THÁNG */}
                <View style={styles.borderlessCol}>
                  <Text style={[styles.borderlessLabel, { color: '#7E9F80' }]}>
                    Tích lũy {Math.round(savingsRatio * 100)}%
                  </Text>
                  <Text
                    style={[
                      styles.borderlessAmount,
                      { color: isDark ? '#FFFFFF' : '#1B2733' },
                    ]}
                  >
                    {formatVND(savingsGoalAmount)}
                  </Text>
                </View>

                {/* CỘT PHẢI: CHI TIÊU THÁNG */}
                <View style={[styles.borderlessCol, { alignItems: 'flex-end' }]}>
                  <Text style={[styles.borderlessLabel, { color: '#E59844' }]}>
                    Chi tiêu {Math.round((1 - savingsRatio) * 100)}%
                  </Text>
                  <Text
                    style={[
                      styles.borderlessAmount,
                      { color: isDark ? '#FFFFFF' : '#1B2733' },
                    ]}
                  >
                    {formatVND(monthlyDiscretionarySpend)}
                  </Text>
                </View>
              </View>

              {/* TẦNG 2: THANH KÉO PHÂN BỔ ZERO-BASED SPLITTER */}
              <ZeroBasedSplitter
                ratio={savingsRatio}
                disposableIncome={disposableIncome}
                savingsAmount={savingsGoalAmount}
                monthlySpendAmount={monthlyDiscretionarySpend}
                dailyBudget={autoCalculatedDaily}
                onChangeRatio={setSavingsRatio}
                onDragStart={() => setScrollEnabled(false)}
                onDragEnd={() => setScrollEnabled(true)}
                isDark={isDark}
                textColorMuted={tokens.textMuted}
              />

              {/* TẦNG 3: HÔM NAY TIÊU ĐƯỢC (KẾT QUẢ NGÀY) */}
              <View
                style={[
                  styles.dailyResultBox,
                  {
                    backgroundColor: isDark
                      ? 'rgba(229, 152, 68, 0.12)'
                      : 'rgba(229, 152, 68, 0.08)',
                    borderColor: isDark
                      ? 'rgba(229, 152, 68, 0.25)'
                      : 'rgba(229, 152, 68, 0.2)',
                  },
                ]}
              >
                <Text style={[styles.dailyResultLabel, { color: isDark ? '#FAF6EC' : '#55606D' }]}>
                  Hôm nay tiêu được:
                </Text>
                <Text style={[styles.dailyResultAmount, { color: tokens.primary }]}>
                  {formatVND(autoCalculatedDaily)}{' '}
                  <Text style={[styles.dailyResultUnit, { color: tokens.textMuted }]}>/ ngày</Text>
                </Text>
              </View>
            </View>
          ) : (
            /* KHUNG MỜ BÁO TRẠNG THÁI CHƯA ĐỦ ĐIỀU KIỆN HOẶC VƯỢT THU NHẬP */
            <View
              style={[
                styles.heroZeroCardPlaceholder,
                {
                  backgroundColor: isDark
                    ? 'rgba(22, 34, 49, 0.45)'
                    : 'rgba(255, 255, 255, 0.55)',
                  borderColor: isFixedExceedIncome
                    ? tokens.danger
                    : isDark
                    ? 'rgba(255, 255, 255, 0.14)'
                    : 'rgba(0, 0, 0, 0.12)',
                },
              ]}
            >
              <View style={styles.heroCalHeader}>
                <Scale
                  size={17}
                  color={isFixedExceedIncome ? tokens.danger : tokens.textMuted}
                  strokeWidth={2.4}
                />
                <Text
                  style={[
                    styles.heroCalTitle,
                    {
                      color: isFixedExceedIncome
                        ? tokens.danger
                        : tokens.textMuted,
                    },
                  ]}
                >
                  {isFixedExceedIncome
                    ? 'Chi phí cố định vượt thu nhập'
                    : 'Cân bằng ngân sách'}
                </Text>
              </View>

              <Text style={[styles.disposableSubtext, { color: tokens.textMuted, marginLeft: 0 }]}>
                {isFixedExceedIncome
                  ? `Cố định (${formatVND(totalFixedCosts)}) >= Thu nhập (${formatVND(parsedIncome)})`
                  : 'Khả dụng: -- đ'}
              </Text>

              <View
                style={[
                  styles.dailyResultBox,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.04)'
                      : '#FAF6EC',
                    borderColor: 'transparent',
                    alignSelf: 'stretch',
                    marginTop: 2,
                  },
                ]}
              >
                <Text style={[styles.dailyResultLabel, { color: tokens.textMuted }]}>
                  Hôm nay tiêu được:
                </Text>
                <Text
                  style={[
                    styles.dailyResultAmount,
                    { color: isFixedExceedIncome ? tokens.danger : tokens.textMuted },
                  ]}
                >
                  {isFixedExceedIncome ? '0 đ' : '-- đ'}{' '}
                  <Text style={[styles.dailyResultUnit, { color: tokens.textMuted }]}>/ ngày</Text>
                </Text>
              </View>

              <Text
                style={[
                  styles.heroCalHint,
                  {
                    color: isFixedExceedIncome ? tokens.danger : tokens.textMuted,
                    fontStyle: isFixedExceedIncome ? 'normal' : 'italic',
                  },
                ]}
              >
                {isFixedExceedIncome
                  ? `Chi phí cố định (${formatVND(totalFixedCosts)}) đang lớn hơn hoặc bằng thu nhập (${formatVND(parsedIncome)}). Hãy điều chỉnh lại các khoản cố định để tiếp tục.`
                  : 'Kéo thanh trượt hoặc nhập thu nhập để Kepi tính toán hạn mức ngày cho bạn.'}
              </Text>
            </View>
          )}

          {/* CARD 5: ĐƠN VỊ QUY ĐỔI YÊU THÍCH (CHỈ SÁNG ĐÈN KHI ĐÃ ĐỦ THU NHẬP & CỐ ĐỊNH) */}
          {isBudgetCalculated && (
            <View
              style={[
                styles.cardSection,
                {
                  backgroundColor: isDark ? '#162231' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                },
              ]}
            >
              <View style={styles.sectionLabelRow}>
                <Coins size={17} color={tokens.primary} strokeWidth={2.4} />
                <Text style={[styles.sectionTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                  Đơn vị quy đổi vui vẻ
                </Text>
              </View>

              <View style={styles.favUnitsRow}>
                {[
                  { id: 'tra_sua' as FavoriteUnit, label: 'Trà sữa', price: '30k' },
                  { id: 'ca_phe' as FavoriteUnit, label: 'Cà phê', price: '30k' },
                  { id: 'bat_pho' as FavoriteUnit, label: 'Bát phở', price: '40k' },
                ].map((unit) => {
                  const isSelected = favUnit === unit.id;
                  return (
                    <TouchableOpacity
                      key={unit.id}
                      style={[
                        styles.favUnitChip,
                        {
                          backgroundColor: isSelected
                            ? tokens.primary
                            : isDark
                            ? 'rgba(255, 255, 255, 0.06)'
                            : '#FAF6EC',
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setFavUnit(unit.id);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.favUnitText,
                          {
                            color: isSelected ? '#0E1620' : isDark ? '#FAF6EC' : '#1B2733',
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {unit.label} ({unit.price})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ACTION BUTTONS */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: tokens.primary },
                !name.trim() && { opacity: 0.6 },
              ]}
              onPress={handleFinish}
              activeOpacity={0.85}
              disabled={!name.trim()}
            >
              <Text style={styles.primaryButtonText}>🍂 BẮT ĐẦU VÍ NGAY</Text>
            </TouchableOpacity>

            {/* NÚT BỎ QUA / VÀO NHANH CHO SINH VIÊN / FREELANCER */}
            <TouchableOpacity
              style={styles.quickSkipButton}
              onPress={handleQuickSkipForStudent}
              activeOpacity={0.75}
            >
              <Text style={[styles.quickSkipText, { color: tokens.textMuted }]}>
                Chưa có thu nhập cố định?{' '}
                <Text style={{ color: tokens.primary, fontWeight: '700' }}>
                  Đặt 100k/ngày & Vào luôn ➔
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 36,
    gap: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 4,
  },
  monogramBox: {
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  welcomeSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  cardSection: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  requiredStar: {
    color: '#C86D51',
  },
  textInput: {
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14.5,
  },
  amountInput: {
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  currencyTextInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
    paddingVertical: 6,
  },
  currencySuffix: {
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 6,
  },
  sliderContainer: {
    marginTop: 4,
    marginBottom: 4,
  },
  sliderTrackTouchArea: {
    height: 44,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrackBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderTrackActive: {
    height: '100%',
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    top: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 4,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: -2,
  },
  milestoneText: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  fixedAmountContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  fixedAmountSuffix: {
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 3,
  },
  addInlineButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionChipsScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestionChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  suggestionChipText: {
    fontSize: 11.5,
  },
  activeEditorBox: {
    padding: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  activeEditorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeEditorTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  activeCustomNameInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    paddingVertical: 2,
  },
  fixedListContainer: {
    gap: 8,
    marginTop: 2,
  },
  fixedCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  fixedNameInput: {
    flex: 1.2,
    fontSize: 13.5,
    fontWeight: '600',
    paddingVertical: 4,
  },
  fixedAmountInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    paddingVertical: 4,
  },
  trashBtn: {
    padding: 4,
    marginLeft: 4,
  },
  fixedTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  fixedTotalLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  fixedTotalAmount: {
    fontSize: 13.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  fixedSliderContainer: {
    marginTop: 8,
    marginBottom: 2,
  },
  fixedSliderTrackTouchArea: {
    height: 34,
    justifyContent: 'center',
    position: 'relative',
  },
  fixedSliderTrackBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fixedSliderTrackActive: {
    height: '100%',
    borderRadius: 3,
  },
  fixedSliderThumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    top: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.22,
    shadowRadius: 2.5,
    elevation: 3,
  },
  fixedMilestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: -2,
  },
  fixedMilestoneText: {
    fontSize: 10.5,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  emptyFixedHint: {
    fontSize: 12,
    lineHeight: 16.5,
    paddingVertical: 2,
  },
  heroCalculationCard: {
    borderRadius: radii.xl,
    borderWidth: 1.5,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  heroCalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroCalTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  heroCalAmount: {
    fontSize: 26,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  heroCalUnit: {
    fontSize: 14,
    fontWeight: '600',
  },
  heroCalHint: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  favUnitsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  favUnitChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favUnitText: {
    fontSize: 12,
  },
  actionSection: {
    marginTop: 6,
    gap: 12,
  },
  primaryButton: {
    height: 48,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E59844',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#0E1620',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  quickSkipButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  quickSkipText: {
    fontSize: 12.5,
    textAlign: 'center',
  },
  optionalBadge: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 16.5,
    marginTop: -2,
    marginBottom: 2,
  },
  heroZeroCard: {
    borderRadius: radii.xl,
    borderWidth: 1.5,
    padding: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  heroZeroCardPlaceholder: {
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    gap: 6,
    shadowOpacity: 0,
    elevation: 0,
  },
  heroZeroHeaderCol: {
    gap: 3,
  },
  heroZeroTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  disposableSubtext: {
    fontSize: 12.5,
    fontVariant: ['tabular-nums'],
    marginLeft: 24,
  },
  pillarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingTop: 2,
  },
  borderlessCol: {
    flex: 1,
    gap: 3,
  },
  borderlessLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  borderlessAmount: {
    fontSize: 18.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.4,
  },
  splitterOuterWrapper: {
    gap: 8,
    marginTop: 2,
  },
  splitterTouchArea: {
    height: 38,
    justifyContent: 'center',
    position: 'relative',
  },
  splitterTrackBackground: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  splitterSavingsSegment: {
    height: '100%',
    borderRadius: 5,
  },
  splitterThumb: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    top: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
    elevation: 4,
  },
  splitterGripLines: {
    flexDirection: 'row',
    gap: 2.5,
  },
  splitterGripBar: {
    width: 1.5,
    height: 9,
    borderRadius: 1,
  },
  dailyResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: 2,
  },
  dailyResultLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  dailyResultAmount: {
    fontSize: 16.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  dailyResultUnit: {
    fontSize: 12,
    fontWeight: '600',
  },
});
