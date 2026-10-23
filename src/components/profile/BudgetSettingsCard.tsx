import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Check,
  Coins,
  Plus,
  Receipt,
  Scale,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Wallet,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Strings } from '../../constants/strings';
import { FavoriteUnit } from '../../types/database';
import {
  FixedCostItem,
  STORAGE_KEY_FIXED_COST_ITEMS,
  formatMaskedCurrency,
} from '../../utils/profileUtils';
import { formatVND } from '../../utils/currency';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

export const STORAGE_KEY_SAVINGS_RATIO = 'vi_locket_savings_ratio';

interface BudgetSettingsCardProps {
  monthlyIncome: number;
  monthlyFixedCosts: number;
  baseDailyBudget: number;
  favUnit: FavoriteUnit;
  isMasked?: boolean;
  onSaveBudgetSettings: (params: {
    monthlyIncome: number;
    monthlyFixedCosts: number;
    favUnit: FavoriteUnit;
    savingsRatio?: number;
    savingsGoalAmount?: number;
  }) => void;
  onOpenFixedCostsModal?: () => void;
}

const QUICK_FIXED_SUGGESTIONS = [
  'Tiền trọ',
  'Điện nước',
  'Internet',
  'Ăn uống/Chợ',
  'Trả góp',
];

const UNITS: { id: FavoriteUnit; label: string; price: number; icon: string }[] = [
  { id: 'tra_sua', label: 'Ly trà sữa', price: 35000, icon: '🧋' },
  { id: 'ca_phe', label: 'Ly cà phê', price: 40000, icon: '☕' },
  { id: 'to_pho', label: 'Bát phở', price: 50000, icon: '🍜' },
];

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

/**
 * Chuyển đổi vị trí tỉ lệ ratio [0, 1] sang số tiền VND (Non-linear scale)
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

interface IncomeSliderProps {
  value: number;
  onChange: (val: number) => void;
  primaryColor: string;
  isDark: boolean;
  textColorMuted: string;
  onDragEnd?: () => void;
}

/**
 * Thanh trượt Thu nhập xúc giác (Non-linear Interactive Slider)
 */
function IncomeSlider({
  value,
  onChange,
  primaryColor,
  isDark,
  textColorMuted,
  onDragEnd,
}: IncomeSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<View>(null);
  const trackWidthRef = useRef(0);
  const trackPageXRef = useRef(0);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

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
  const thumbWidth = 26;
  const thumbLeft =
    trackWidth > 0 ? Math.max(0, Math.min(trackWidth - thumbWidth, ratio * (trackWidth - thumbWidth))) : 0;

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

      <View style={styles.milestoneRow}>
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            onChange(0);
            onDragEnd?.();
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
            onDragEnd?.();
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
            onDragEnd?.();
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
            onDragEnd?.();
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
            onDragEnd?.();
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
            onDragEnd?.();
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
            onDragEnd?.();
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
            onDragEnd?.();
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
            onDragEnd?.();
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
  ratio: number; // 0.0 to 1.0
  onChangeRatio: (newRatio: number) => void;
  onDragEnd?: () => void;
  isDark: boolean;
}

const MAX_SPLIT_RATIO = 1.0;

/**
 * Thanh phân bổ Cân Bằng Số 0 (Zero-Based Splitter) Bi-Color
 */
function ZeroBasedSplitter({
  ratio,
  onChangeRatio,
  onDragEnd,
  isDark,
}: ZeroBasedSplitterProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<View>(null);
  const trackWidthRef = useRef(0);
  const trackPageXRef = useRef(0);

  const onChangeRatioRef = useRef(onChangeRatio);
  onChangeRatioRef.current = onChangeRatio;

  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  const lastPercentHapticRef = useRef(Math.round(ratio * 100));
  const lastHapticTimeRef = useRef(0);

  const triggerRatioUpdate = useCallback((rawRatio: number) => {
    const clampedRatio = Math.max(0, Math.min(MAX_SPLIT_RATIO, rawRatio));
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

  const thumbWidth = 28;
  const thumbLeft =
    trackWidth > 0 ? Math.max(0, Math.min(trackWidth - thumbWidth, ratio * (trackWidth - thumbWidth))) : 0;

  return (
    <View style={styles.splitterOuterWrapper}>
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
        <View
          pointerEvents="none"
          style={[
            styles.splitterTrackBackground,
            {
              backgroundColor: isDark ? 'rgba(229, 152, 68, 0.4)' : 'rgba(229, 152, 68, 0.25)',
            },
          ]}
        >
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
 * Khối Định Mức & Thu Chi Tương Tác Xúc Giác (Profile Budget Settings Card)
 * Đồng bộ 100% logic và giao diện với màn hình Thiết lập:
 * - Kéo trượt thu nhập 0-300tr+
 * - Danh sách chi phí cố định với nút + tròn và chip nhanh
 * - Cân bằng ngân sách số 0 Bi-Color 0-100%
 * - Tự động lưu êm (Auto-save) khi buông tay
 * - Hỗ trợ chế độ Ẩn tiền (isMasked)
 */
export const BudgetSettingsCard: React.FC<BudgetSettingsCardProps> = ({
  monthlyIncome,
  monthlyFixedCosts,
  baseDailyBudget = 0,
  favUnit,
  isMasked = false,
  onSaveBudgetSettings,
}) => {
  const { tokens, isDark } = useTheme();

  // Local state for income
  const [income, setIncome] = useState<number>(monthlyIncome);
  const [incomeStr, setIncomeStr] = useState<string>(
    monthlyIncome > 0 ? monthlyIncome.toLocaleString('vi-VN') : ''
  );

  // Local state for fixed costs
  const [fixedCosts, setFixedCosts] = useState<FixedCostItem[]>([]);
  const [fixedCostsLoaded, setFixedCostsLoaded] = useState(false);

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

  // Local state for savings ratio
  const [savingsRatio, setSavingsRatio] = useState<number>(0.2);

  // Local state for fav unit
  const [selectedUnit, setSelectedUnit] = useState<FavoriteUnit>(favUnit);

  // Modal Bottom Sheet state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load fixed costs and savings ratio from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const [savedItems, savedRatio] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_FIXED_COST_ITEMS),
          AsyncStorage.getItem(STORAGE_KEY_SAVINGS_RATIO),
        ]);

        if (savedItems) {
          const parsed: FixedCostItem[] = JSON.parse(savedItems);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFixedCosts(parsed);
          } else if (monthlyFixedCosts > 0) {
            setFixedCosts([{ id: 'fixed-default', name: 'Chi phí cố định', amount: monthlyFixedCosts }]);
          }
        } else if (monthlyFixedCosts > 0) {
          setFixedCosts([{ id: 'fixed-default', name: 'Chi phí cố định', amount: monthlyFixedCosts }]);
        }

        if (savedRatio !== null) {
          const r = parseFloat(savedRatio);
          if (!isNaN(r) && r >= 0 && r <= 1) {
            setSavingsRatio(r);
          }
        }
      } catch (err) {
        console.warn('Failed to load profile budget items:', err);
      } finally {
        setFixedCostsLoaded(true);
      }
    })();
  }, []);

  // Update local income when store prop changes
  useEffect(() => {
    setIncome(monthlyIncome);
    setIncomeStr(monthlyIncome > 0 ? monthlyIncome.toLocaleString('vi-VN') : '');
  }, [monthlyIncome]);

  useEffect(() => {
    setSelectedUnit(favUnit);
  }, [favUnit]);

  // Total fixed costs
  const totalFixedCosts = useMemo(() => {
    return fixedCosts.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [fixedCosts]);

  // Disposable income = Income - Fixed Costs
  const disposableIncome = useMemo(() => {
    return Math.max(0, income - totalFixedCosts);
  }, [income, totalFixedCosts]);

  // Monthly savings amount
  const savingsGoalAmount = useMemo(() => {
    if (disposableIncome <= 0) return 0;
    return Math.round((disposableIncome * savingsRatio) / 100000) * 100000;
  }, [disposableIncome, savingsRatio]);

  // Monthly discretionary spend = Disposable - Savings
  const monthlyDiscretionarySpend = useMemo(() => {
    if (disposableIncome <= 0) return 0;
    return Math.max(0, disposableIncome - savingsGoalAmount);
  }, [disposableIncome, savingsGoalAmount]);

  // Daily budget = Monthly spend / 30
  const autoCalculatedDaily = useMemo(() => {
    if (monthlyDiscretionarySpend <= 0) return 0;
    return Math.floor(monthlyDiscretionarySpend / 30);
  }, [monthlyDiscretionarySpend]);

  // Điều kiện kích hoạt: Thu nhập > 0 và Khả dụng > 0 (không bắt buộc cố định > 0)
  const isBudgetCalculated = income > 0 && disposableIncome > 0;

  // Debounced auto-save handler
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerAutoSave = useCallback(
    (
      newIncome: number,
      newFixedItems: FixedCostItem[],
      newRatio: number,
      newUnit: FavoriteUnit
    ) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        const totalFixed = newFixedItems.reduce((sum, it) => sum + (it.amount || 0), 0);
        const disp = Math.max(0, newIncome - totalFixed);
        const savingsGoal = Math.round((disp * newRatio) / 100000) * 100000;

        try {
          await AsyncStorage.setItem(
            STORAGE_KEY_FIXED_COST_ITEMS,
            JSON.stringify(newFixedItems)
          );
          await AsyncStorage.setItem(STORAGE_KEY_SAVINGS_RATIO, String(newRatio));
        } catch (err) {
          console.warn('Failed to save fixed costs:', err);
        }

        onSaveBudgetSettings({
          monthlyIncome: newIncome,
          monthlyFixedCosts: totalFixed,
          favUnit: newUnit,
          savingsRatio: newRatio,
          savingsGoalAmount: savingsGoal,
        });
      }, 400);
    },
    [onSaveBudgetSettings]
  );

  // Income changes
  const handleIncomeSliderChange = (newVal: number) => {
    setIncome(newVal);
    setIncomeStr(newVal > 0 ? newVal.toLocaleString('vi-VN') : '');
    triggerAutoSave(newVal, fixedCosts, savingsRatio, selectedUnit);
  };

  const handleIncomeTextChange = (text: string) => {
    const rawDigits = text.replace(/\D/g, '');
    const num = parseInt(rawDigits, 10) || 0;
    setIncome(num);
    setIncomeStr(num > 0 ? num.toLocaleString('vi-VN') : '');
    triggerAutoSave(num, fixedCosts, savingsRatio, selectedUnit);
  };

  // Fixed costs handlers (Active Chip Focus)
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
      const updated = [...fixedCosts, newItem];
      setFixedCosts(updated);
      setActiveFixedId(newId);
      triggerAutoSave(income, updated, savingsRatio, selectedUnit);
    }
  };

  const handleAddCustomFixedCost = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newId = `fixed-custom-${Date.now()}`;
    const newItem: FixedCostItem = {
      id: newId,
      name: '',
      amount: 0,
    };
    const updated = [...fixedCosts, newItem];
    setFixedCosts(updated);
    setActiveFixedId(newId);
    triggerAutoSave(income, updated, savingsRatio, selectedUnit);
  };

  const handleUpdateFixedCost = (id: string, updates: Partial<FixedCostItem>) => {
    const updated = fixedCosts.map((item) => (item.id === id ? { ...item, ...updates } : item));
    setFixedCosts(updated);
    triggerAutoSave(income, updated, savingsRatio, selectedUnit);
  };

  const handleRemoveFixedCost = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = fixedCosts.filter((item) => item.id !== id);
    setFixedCosts(updated);
    if (activeFixedId === id) {
      setActiveFixedId(null);
    }
    triggerAutoSave(income, updated, savingsRatio, selectedUnit);
  };

  // Savings ratio changes
  const handleRatioChange = (newRatio: number) => {
    setSavingsRatio(newRatio);
    triggerAutoSave(income, fixedCosts, newRatio, selectedUnit);
  };

  // Unit changes
  const handleSelectUnit = (unitId: FavoriteUnit) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedUnit(unitId);
    triggerAutoSave(income, fixedCosts, savingsRatio, unitId);
  };

  return (
    <View style={styles.wrapper}>
      {/* ================= THẺ TÓM TẮT CÂN BẰNG NGÂN SÁCH (READ-ONLY SUMMARY CARD) ================= */}
      <TouchableOpacity
        style={[
          styles.summaryCard,
          {
            backgroundColor: isDark ? '#162231' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setIsEditModalOpen(true);
        }}
        activeOpacity={0.85}
        accessibilityLabel="Chỉnh sửa ngân sách"
      >
        {/* Header thẻ tóm tắt */}
        <View style={styles.summaryHeader}>
          <View style={styles.sectionLabelRow}>
            <View style={styles.summaryIconBadge}>
              <Scale size={20} color={tokens.primary} strokeWidth={2.4} />
            </View>
            <Text style={[styles.summaryTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
              CÂN BẰNG NGÂN SÁCH
            </Text>
          </View>

          <View style={styles.summaryEditButton}>
            <SlidersHorizontal size={19} color={tokens.primary} strokeWidth={2.4} />
          </View>
        </View>

        {/* Spotlight: Hạn mức tiêu ngày */}
        <View
          style={[
            styles.summarySpotlightBox,
            {
              backgroundColor: isDark ? 'rgba(229, 152, 68, 0.08)' : 'rgba(229, 152, 68, 0.06)',
              borderColor: isDark ? 'rgba(229, 152, 68, 0.2)' : 'rgba(229, 152, 68, 0.15)',
            },
          ]}
        >
          <View style={styles.spotlightTopRow}>
            <Text style={[styles.spotlightLabel, { color: tokens.textMuted }]}>
              Hôm nay tiêu được
            </Text>
          </View>

          <Text style={[styles.spotlightAmount, { color: tokens.primary }]}>
            {isMasked ? '•••• đ' : `${formatVND(autoCalculatedDaily || baseDailyBudget)} / ngày`}
          </Text>
        </View>

        {/* Bi-color Progress Bar Mini */}
        <View style={styles.miniBarContainer}>
          <View
            style={[
              styles.miniBarSavings,
              { width: `${Math.round(savingsRatio * 100)}%`, backgroundColor: '#7E9F80' },
            ]}
          />
          <View
            style={[
              styles.miniBarSpend,
              { width: `${100 - Math.round(savingsRatio * 100)}%`, backgroundColor: tokens.primary },
            ]}
          />
        </View>

        {/* 3 Cột số liệu then chốt */}
        <View style={styles.summaryMetricsRow}>
          {/* Cột 1: Thu nhập */}
          <View style={styles.summaryMetricItem}>
            <Text style={[styles.metricLabel, { color: tokens.textMuted }]}>Thu nhập</Text>
            <Text style={[styles.metricValue, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
              {isMasked ? '••••' : formatCompactVND(income) || '0đ'}
            </Text>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} />

          {/* Cột 2: Cố định */}
          <View style={styles.summaryMetricItem}>
            <Text style={[styles.metricLabel, { color: tokens.textMuted }]}>
              Cố định ({fixedCosts.length})
            </Text>
            <Text style={[styles.metricValue, { color: '#C86D51' }]}>
              {isMasked ? '••••' : formatCompactVND(totalFixedCosts) || '0đ'}
            </Text>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} />

          {/* Cột 3: Tích lũy */}
          <View style={styles.summaryMetricItem}>
            <Text style={[styles.metricLabel, { color: tokens.textMuted }]}>
              Tích lũy ({Math.round(savingsRatio * 100)}%)
            </Text>
            <Text style={[styles.metricValue, { color: '#7E9F80' }]}>
              {isMasked ? '••••' : formatCompactVND(savingsGoalAmount) || '0đ'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* ================= MODAL BOTTOM SHEET CHUYÊN DỤNG (88% CHIỀU CAO - CÔ LẬP HOÀN TOÀN KHỎI SCROLLVIEW NGANG) ================= */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsEditModalOpen(false)}
          />

          <View
            style={[
              styles.modalSheetContainer,
              {
                backgroundColor: isDark ? '#0E1620' : '#FAF6F0',
                borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              },
            ]}
          >
            {/* DRAG HANDLE */}
            <View style={styles.dragHandleWrapper}>
              <View
                style={[
                  styles.dragHandle,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)' },
                ]}
              />
            </View>

            {/* SHEET HEADER */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                  Thiết lập ngân sách
                </Text>
                <Text style={[styles.sheetSubtitle, { color: tokens.textMuted }]}>
                  Kéo trượt thu nhập & tỷ lệ cân bằng
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.sheetCloseButton,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  },
                ]}
                onPress={() => setIsEditModalOpen(false)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} color={isDark ? '#FAF6EC' : '#1B2733'} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {/* SCROLLABLE SLIDERS CONTENT */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* CARD 1: THU NHẬP HÀNG THÁNG */}
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
            <Coins size={17} color={tokens.primary} strokeWidth={2.4} />
            <Text style={[styles.sectionTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
              Thu nhập hàng tháng
            </Text>
          </View>
        </View>

        {/* Ô NHẬP TIỀN CÓ HẬU TỐ "đ" CỐ ĐỊNH */}
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FAF6EC',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            },
          ]}
        >
          {isMasked ? (
            <Text
              style={[
                styles.maskedAmountText,
                { color: isDark ? '#FFFFFF' : '#1B2733' },
              ]}
            >
              •••• đ
            </Text>
          ) : (
            <>
              <TextInput
                style={[
                  styles.currencyInput,
                  { color: isDark ? '#FFFFFF' : '#1B2733' },
                ]}
                placeholder="0"
                placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.35)' : '#99A1AF'}
                keyboardType="numeric"
                value={incomeStr}
                onChangeText={handleIncomeTextChange}
              />
              <Text style={[styles.currencySuffix, { color: tokens.primary }]}>đ</Text>
            </>
          )}
        </View>

        {/* THANH TRƯỢT THU NHẬP NON-LINEAR */}
        <IncomeSlider
          value={income}
          onChange={handleIncomeSliderChange}
          primaryColor={tokens.primary}
          isDark={isDark}
          textColorMuted={tokens.textMuted}
          onDragEnd={() => triggerAutoSave(income, fixedCosts, savingsRatio, selectedUnit)}
        />
      </View>

      {/* CARD 2: CHI PHÍ CỐ ĐỊNH */}
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
              chipLabel = isMasked ? `${name} • ••••` : `${name} • ${formatCompactVND(amount)}`;
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
              chipLabel = isMasked ? `${displayName} • ••••` : `${displayName} • ${formatCompactVND(amount)}`;
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
                styles.inputRow,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  marginBottom: 0,
                },
              ]}
            >
              {isMasked ? (
                <Text style={[styles.maskedAmountText, { color: tokens.danger }]}>
                  •••• đ
                </Text>
              ) : (
                <>
                  <TextInput
                    style={[styles.currencyInput, { color: tokens.danger }]}
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
                </>
              )}
            </View>

            {/* THANH TRƯỢT CHI PHÍ CỐ ĐỊNH GỌN GÀNG, MƯỢT MÀ */}
            <FixedCostSlider
              value={activeItem.amount}
              onChange={(newAmount) => handleUpdateFixedCost(activeItem.id, { amount: newAmount })}
              onDragEnd={() => triggerAutoSave(income, fixedCosts, savingsRatio, selectedUnit)}
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
            {formatMaskedCurrency(totalFixedCosts, isMasked)}
          </Text>
        </View>
      </View>

      {/* CARD 3: HERO CARD CÂN BẰNG NGÂN SÁCH SỐ 0 HOẶC PLACEHOLDER */}
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
          {/* TIÊU ĐỀ CARD & DÒNG PHỤ KHẢ DỤNG XUỐNG DÒNG */}
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
                {formatMaskedCurrency(disposableIncome, isMasked)}
              </Text>
            </Text>
          </View>

          {/* TẦNG 1: DÒNG TIỀN THÁNG (TÍCH LŨY THÁNG & CHI TIÊU THÁNG) */}
          <View style={styles.pillarsContainer}>
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
                {formatMaskedCurrency(savingsGoalAmount, isMasked)}
              </Text>
            </View>

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
                {formatMaskedCurrency(monthlyDiscretionarySpend, isMasked)}
              </Text>
            </View>
          </View>

          {/* TẦNG 2: THANH KÉO PHÂN BỔ ZERO-BASED SPLITTER */}
          <ZeroBasedSplitter
            ratio={savingsRatio}
            onChangeRatio={handleRatioChange}
            onDragEnd={() => triggerAutoSave(income, fixedCosts, savingsRatio, selectedUnit)}
            isDark={isDark}
          />

          {/* TẦNG 3: HỘP SPOTLIGHT HÔM NAY TIÊU ĐƯỢC */}
          <View
            style={[
              styles.dailySpotlightBox,
              {
                backgroundColor: isDark
                  ? 'rgba(229, 152, 68, 0.12)'
                  : 'rgba(229, 152, 68, 0.15)',
              },
            ]}
          >
            <Text
              style={[
                styles.dailySpotlightTitle,
                { color: isDark ? '#FAF6EC' : '#1B2733' },
              ]}
            >
              Hôm nay tiêu được:{' '}
              <Text style={{ color: tokens.primary, fontWeight: '800' }}>
                {formatMaskedCurrency(autoCalculatedDaily, isMasked)}
              </Text>{' '}
              / ngày
            </Text>
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.placeholderCard,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
            },
          ]}
        >
          <View style={styles.sectionLabelRow}>
            <Sparkles size={16} color={tokens.textMuted} strokeWidth={2} />
            <Text style={[styles.placeholderTitle, { color: tokens.textMuted }]}>
              Cân bằng ngân sách
            </Text>
          </View>
          <Text style={[styles.placeholderSub, { color: tokens.textMuted }]}>
            {income <= 0
              ? 'Kéo thanh trượt hoặc nhập thu nhập để Kepi tính toán hạn mức ngày cho bạn.'
              : 'Tổng chi phí cố định đang vượt thu nhập. Hãy điều chỉnh lại.'}
          </Text>
        </View>
      )}

      {/* CARD 4: ĐƠN VỊ QUY ĐỔI YÊU THÍCH */}
      <View
        style={[
          styles.cardSection,
          {
            backgroundColor: isDark ? '#162231' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: isDark ? '#FAF6EC' : '#1B2733', marginBottom: 4 }]}>
          Đơn vị quy đổi vui vẻ
        </Text>
        <Text style={[styles.unitSub, { color: tokens.textMuted, marginBottom: 10 }]}>
          Anh Minh AI sẽ quy đổi các món đồ sang đơn vị quen thuộc này
        </Text>

        <View style={styles.unitsRow}>
          {UNITS.map((u) => {
            const isSelected = selectedUnit === u.id;
            return (
              <TouchableOpacity
                key={u.id}
                style={[
                  styles.unitCard,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? 'rgba(229, 152, 68, 0.2)'
                        : 'rgba(229, 152, 68, 0.15)'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.04)'
                      : '#FAF6EC',
                    borderColor: isSelected ? tokens.primary : 'transparent',
                  },
                ]}
                onPress={() => handleSelectUnit(u.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.unitIcon}>{u.icon}</Text>
                <Text
                  style={[
                    styles.unitLabel,
                    {
                      color: isSelected ? tokens.primary : isDark ? '#FAF6EC' : '#1B2733',
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {u.label}
                </Text>
                <Text style={[styles.unitPrice, { color: tokens.textMuted }]}>
                  {formatVND(u.price)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
            </ScrollView>

            {/* STICKY BOTTOM ACTIONS */}
            <View
              style={[
                styles.sheetBottomBar,
                {
                  backgroundColor: isDark ? '#0E1620' : '#FAF6F0',
                  borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.sheetSaveButton, { backgroundColor: tokens.primary }]}
                onPress={() => {
                  triggerAutoSave(income, fixedCosts, savingsRatio, selectedUnit);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setIsEditModalOpen(false);
                }}
                activeOpacity={0.85}
              >
                <Check size={18} color="#0E1620" strokeWidth={2.8} />
                <Text style={styles.sheetSaveButtonText}>Lưu thay đổi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  cardSection: {
    padding: 14,
    borderRadius: radii.xl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  addInlineButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    marginBottom: 4,
    minHeight: 46,
  },
  currencyInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
    paddingVertical: 6,
  },
  maskedAmountText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    paddingVertical: 10,
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
  suggestionChipsScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
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
    paddingVertical: 4,
  },
  fixedNameInput: {
    flex: 1.2,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 6,
  },
  fixedAmountContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  fixedAmountInput: {
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    paddingVertical: 6,
  },
  fixedAmountSuffix: {
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 3,
  },
  trashBtn: {
    padding: 6,
  },
  fixedTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  fixedTotalLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  fixedTotalAmount: {
    fontSize: 15,
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
    fontStyle: 'italic',
    lineHeight: 17,
  },
  heroZeroCard: {
    padding: 16,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  heroZeroHeaderCol: {
    gap: 2,
    marginBottom: 12,
  },
  heroZeroTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  disposableSubtext: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 24,
  },
  pillarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  borderlessCol: {
    flex: 1,
  },
  borderlessLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  borderlessAmount: {
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
  splitterOuterWrapper: {
    marginTop: 2,
    marginBottom: 10,
  },
  splitterTouchArea: {
    height: 48,
    justifyContent: 'center',
    position: 'relative',
  },
  splitterTrackBackground: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  splitterSavingsSegment: {
    height: '100%',
    borderRadius: 6,
  },
  splitterThumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    top: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 4,
  },
  splitterGripLines: {
    flexDirection: 'row',
    gap: 2.5,
  },
  splitterGripBar: {
    width: 2,
    height: 10,
    borderRadius: 1,
  },
  dailySpotlightBox: {
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  dailySpotlightTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  placeholderCard: {
    padding: 14,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  placeholderTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  placeholderSub: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  unitSub: {
    fontSize: 12,
  },
  unitsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  unitCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  unitIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  unitLabel: {
    fontSize: 11.5,
    marginBottom: 2,
    textAlign: 'center',
  },
  unitPrice: {
    fontSize: 10.5,
    fontVariant: ['tabular-nums'],
  },
  // ================= SUMMARY CARD STYLES =================
  summaryCard: {
    padding: 16,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryIconBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  summaryEditButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summarySpotlightBox: {
    padding: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 4,
  },
  spotlightTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spotlightLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  spotlightAmount: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
  },
  miniBarContainer: {
    height: 6,
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  miniBarSavings: {
    height: '100%',
  },
  miniBarSpend: {
    height: '100%',
  },
  summaryMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  summaryMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  metricDivider: {
    width: 1,
    height: 22,
  },

  // ================= MODAL & BOTTOM SHEET STYLES =================
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  modalSheetContainer: {
    height: '88%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  dragHandleWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 4.5,
    borderRadius: 3,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  sheetCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  sheetBottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  sheetSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 25,
    shadowColor: '#E59844',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sheetSaveButtonText: {
    color: '#0E1620',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
