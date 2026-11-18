import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { BarChart2, BookOpen, Camera, Eye, EyeOff, Home, Images, Sparkles } from 'lucide-react-native';
import { Strings } from '../../constants/strings';
import { useTransactionStore } from '../../store/transactionStore';
import { useBudgetStore } from '../../store/budgetStore';
import { Transaction } from '../../types/database';
import { formatVND } from '../../utils/currency';
import { PixelHouseWebView, RoomInfo } from '../pixel/PixelHouseWebView';
import {
  MonthSectionData,
  MonthSummary,
  groupTransactionsByMonth,
} from '../../utils/statsUtils';
import { MonthStickyHeader } from '../stats/MonthStickyHeader';
import { MonthQuickJumper } from '../stats/MonthQuickJumper';
import { TransactionPhotoCell } from '../stats/TransactionPhotoCell';
import { MonthDetailBottomSheet } from '../stats/MonthDetailBottomSheet';
import { DayDetailBottomSheet } from '../journal/DayDetailBottomSheet';
import { AnalyticsDashboardView } from '../stats/AnalyticsDashboardView';
import { AnimeMagazineReportSheet, AnimeMagazineView } from '../stats/AnimeMagazineReportSheet';
import { getDaysRemainingInMonth } from '../../utils/calendarUtils';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { useBottomInset } from '../../hooks/useBottomInset';

const PREFS_STORAGE_KEY = '@vi_locket_home_preferences';

interface StatsViewProps {
  onNavigateToCamera?: () => void;
  onNavigateHome?: () => void;
}

type FilterType = 'ALL' | 'EXPENSE' | 'INCOME' | 'SKIPPED' | 'UNPRICED' | string;

interface RowData {
  id: string;
  items: (Transaction | null)[];
}

/**
 * Trang Thống kê (Tab 2, Index 1) — Cuốn Album Tiền Tách Theo Tháng — Phong cách "Ấm, tĩnh, sang"
 * Tuân thủ mục 8 của PROMPT và docs/screens/STATS.md:
 * - Hỗ trợ Sáng / Tối toàn diện qua useTheme().
 * - Album cuộn dọc tách theo từng tháng, mỗi tháng một khối lưới 3 cột.
 * - Tiêu đề tháng dính đầu khi cuộn.
 * - Danh mục gộp: "Ăn uống".
 * - Khoảng đệm đáy chuẩn xác với useBottomInset().
 */
export const StatsView: React.FC<StatsViewProps> = ({ onNavigateToCamera, onNavigateHome }) => {
  const insets = useSafeAreaInsets();
  const { tokens } = useTheme();
  const { contentBottomPadding } = useBottomInset();
  const [showMagazine, setShowMagazine] = useState(false);
  const { transactions, updateTransaction } = useTransactionStore();

  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');
  const [activeMonthKey, setActiveMonthKey] = useState<string>('');
  const [viewMode, setViewMode] = useState<'HOUSE' | 'ALBUM' | 'ANALYTICS' | 'MAGAZINE'>('HOUSE');
  const [selectedHouseRoom, setSelectedHouseRoom] = useState<RoomInfo>({
    id: 'sanh',
    name: 'Sảnh',
    category: 'all',
    subtitle: 'Tổng quan',
  });
  const [periodMode, setPeriodMode] = useState<'WEEK' | 'MONTH'>('MONTH');

  const { monthlyIncome, savedMoney, realBalance } = useBudgetStore();
  const remainingDays = useMemo(() => getDaysRemainingInMonth(), []);

  const foodSpent = useMemo(() => {
    return transactions
      .filter((t) => (t.status === 'CONFIRMED' || !t.status) && t.type === 'EXPENSE' && (t.category === 'an_uong' || t.category === 'cafe' || t.category === 'giai_tri'))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  const shopSpent = useMemo(() => {
    return transactions
      .filter((t) => (t.status === 'CONFIRMED' || !t.status) && t.type === 'EXPENSE' && t.category === 'mua_sam')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  const transportSpent = useMemo(() => {
    return transactions
      .filter((t) => (t.status === 'CONFIRMED' || !t.status) && t.type === 'EXPENSE' && t.category === 'di_chuyen')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  const photosCount = useMemo(() => {
    return transactions.filter((t) => Boolean(t.photo_url)).length;
  }, [transactions]);

  // Tổng chi tháng hiện tại từ transactions confirmed
  const currentMonthSpent = useMemo(() => {
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);
    return transactions
      .filter(
        (tx) =>
          tx.status === 'CONFIRMED' &&
          tx.occurred_at?.startsWith(currentMonthPrefix) &&
          tx.type === 'EXPENSE'
      )
      .reduce((acc, tx) => acc + (tx.amount || 0), 0);
  }, [transactions]);

  // Tỷ lệ tiết kiệm thực tế
  const currentSavingsRate = useMemo(() => {
    if (!monthlyIncome || monthlyIncome <= 0) return 25;
    const rate = Math.round(((monthlyIncome - currentMonthSpent) / monthlyIncome) * 100);
    return Math.max(0, Math.min(100, rate));
  }, [monthlyIncome, currentMonthSpent]);


  // Sheet phân tích chi tiết tháng
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [selectedMonthSummary, setSelectedMonthSummary] = useState<MonthSummary | null>(null);
  const [selectedMonthTxs, setSelectedMonthTxs] = useState<Transaction[]>([]);

  // Sheet xem khoảnh khắc giao dịch
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [txDetailVisible, setTxDetailVisible] = useState<boolean>(false);

  // Dialog nhập giá nhanh cho khoản chưa có giá
  const [unpricedModalVisible, setUnpricedModalVisible] = useState<boolean>(false);
  const [targetUnpricedTx, setTargetUnpricedTx] = useState<Transaction | null>(null);
  const [inputPriceStr, setInputPriceStr] = useState<string>('');

  const sectionListRef = useRef<SectionList<RowData>>(null);

  // 1. TẢI CÀI ĐẶT ẨN TIỀN
  useEffect(() => {
    AsyncStorage.getItem(PREFS_STORAGE_KEY).then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (typeof parsed.isMasked === 'boolean') {
            setIsMasked(parsed.isMasked);
          }
        } catch (_) {}
      }
    });
  }, []);

  const toggleMaskMoney = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextVal = !isMasked;
    setIsMasked(nextVal);
    try {
      const existing = await AsyncStorage.getItem(PREFS_STORAGE_KEY);
      const parsed = existing ? JSON.parse(existing) : {};
      await AsyncStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify({ ...parsed, isMasked: nextVal }));
    } catch (_) {}
  };

  // 2. GOM NHÓM THEO THÁNG
  const rawSections: MonthSectionData[] = useMemo(() => {
    return groupTransactionsByMonth(transactions);
  }, [transactions]);

  // Cập nhật activeMonthKey mặc định là tháng đầu tiên (mới nhất)
  useEffect(() => {
    if (rawSections.length > 0 && !activeMonthKey) {
      setActiveMonthKey(rawSections[0].summary.monthKey);
    }
  }, [rawSections, activeMonthKey]);

  // Danh sách tháng cho QuickJumper
  const monthJumperItems = useMemo(() => {
    return rawSections.map((s) => {
      const [y, m] = s.summary.monthKey.split('-');
      return {
        key: s.summary.monthKey,
        label: s.summary.monthLabel,
        year: parseInt(y, 10),
        month: parseInt(m, 10),
      };
    });
  }, [rawSections]);

  // 3. LỌC GIAO DỊCH
  const filteredSections = useMemo(() => {
    return rawSections
      .map((sec) => {
        let filteredItems = sec.items;

        if (selectedFilter === 'EXPENSE') {
          filteredItems = filteredItems.filter((it) => it.type === 'EXPENSE' && !(it as any).is_skipped);
        } else if (selectedFilter === 'INCOME') {
          filteredItems = filteredItems.filter((it) => it.type === 'INCOME');
        } else if (selectedFilter === 'SKIPPED') {
          filteredItems = filteredItems.filter((it) => (it as any).is_skipped || it.category === 'Cứu ví');
        } else if (selectedFilter === 'UNPRICED') {
          filteredItems = filteredItems.filter(
            (it) => (it as any).is_unpriced || (it.type === 'EXPENSE' && (it.amount === 0 || isNaN(it.amount)))
          );
        } else if (selectedFilter === 'an_uong') {
          // Gộp: Ăn uống
          filteredItems = filteredItems.filter(
            (it) =>
              it.category === 'Ăn uống' ||
              it.category === 'Cà phê' ||
              it.category === 'Ăn uống & Cà phê' ||
              it.category === 'Ăn vặt' ||
              it.category === 'an_uong'
          );
        } else if (selectedFilter !== 'ALL') {
          // Lọc theo danh mục cụ thể khác
          filteredItems = filteredItems.filter((it) => it.category === selectedFilter);
        }

        // Chia items thành các hàng 3 cột để SectionList render chuẩn 60fps
        const rows: RowData[] = [];
        for (let i = 0; i < filteredItems.length; i += 3) {
          const chunk = filteredItems.slice(i, i + 3);
          while (chunk.length < 3) {
            chunk.push(null as any);
          }
          rows.push({
            id: `row-${sec.summary.monthKey}-${i}`,
            items: chunk,
          });
        }

        return {
          summary: sec.summary,
          data: rows,
          rawItems: filteredItems,
        };
      })
      .filter((sec) => sec.data.length > 0 || sec.summary.isCurrentMonth);
  }, [rawSections, selectedFilter]);

  // Section đang chọn cho Analytics Dashboard
  const activeSection = useMemo(() => {
    if (!activeMonthKey) return rawSections[0] || null;
    return rawSections.find((s) => s.summary.monthKey === activeMonthKey) || rawSections[0] || null;
  }, [rawSections, activeMonthKey]);

  // Kiểm tra ngày có thuộc tuần hiện tại (Thứ 2 đến Chủ Nhật)
  const isDateInCurrentWeek = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return d >= monday && d <= sunday;
    } catch {
      return false;
    }
  };

  const displayAnalyticsTransactions = useMemo(() => {
    if (!activeSection) return [];
    if (periodMode === 'WEEK') {
      return activeSection.items.filter((tx) => isDateInCurrentWeek(tx.created_at));
    }
    return activeSection.items;
  }, [activeSection, periodMode]);

  const displayAnalyticsSummary = useMemo(() => {
    if (!activeSection) return null;
    if (periodMode === 'WEEK') {
      const totalSpent = displayAnalyticsTransactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalIncome = displayAnalyticsTransactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...activeSection.summary,
        totalSpent,
        totalIncome,
        transactionCount: displayAnalyticsTransactions.length,
        averagePerDay: Math.round(totalSpent / 7),
      };
    }
    return activeSection.summary;
  }, [activeSection, displayAnalyticsTransactions, periodMode]);


  // 4. ĐIỀU HƯỚNG NHANH THEO THÁNG
  const handleSelectMonthJumper = useCallback(
    (monthKey: string) => {
      setActiveMonthKey(monthKey);
      const sectionIndex = filteredSections.findIndex((s) => s.summary.monthKey === monthKey);
      if (sectionIndex >= 0 && sectionListRef.current) {
        try {
          sectionListRef.current.scrollToLocation({
            sectionIndex,
            itemIndex: 0,
            animated: true,
            viewOffset: 50,
          });
        } catch (_) {}
      }
    },
    [filteredSections]
  );

  // Mở màn Chi tiết tháng
  const handleOpenMonthDetail = (summary: MonthSummary, items: Transaction[]) => {
    setSelectedMonthSummary(summary);
    setSelectedMonthTxs(items);
    setDetailVisible(true);
  };

  // Mở modal nhập giá nhanh
  const handleOpenUnpricedModal = (item: Transaction) => {
    setTargetUnpricedTx(item);
    setInputPriceStr('');
    setUnpricedModalVisible(true);
  };

  const handleSaveUnpriced = async () => {
    if (!targetUnpricedTx) return;
    const num = parseInt(inputPriceStr.replace(/\D/g, ''), 10);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Số tiền chưa hợp lệ', 'Vui lòng nhập giá trị lớn hơn 0 đ.');
      return;
    }
    await updateTransaction(targetUnpricedTx.id, {
      amount: num,
      ...({ is_unpriced: false } as any),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setUnpricedModalVisible(false);
    setTargetUnpricedTx(null);
  };

  // Mở chi tiết giao dịch
  const handleOpenItemDetail = (item: Transaction) => {
    setSelectedTx(item);
    setTxDetailVisible(true);
  };

  // BỘ CHIP LỌC (đã gộp Ăn uống & Cà phê)
  const filterChips: { id: FilterType; label: string }[] = [
    { id: 'ALL', label: Strings.stats.filterAll },
    { id: 'EXPENSE', label: Strings.stats.filterExpense },
    { id: 'INCOME', label: Strings.stats.filterIncome },
    { id: 'SKIPPED', label: Strings.stats.filterSkipped },
    { id: 'UNPRICED', label: Strings.stats.filterUnpriced },
    { id: 'an_uong', label: 'Ăn uống' },
    { id: 'Mua sắm', label: 'Mua sắm' },
    { id: 'Di chuyển', label: 'Di chuyển' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg, paddingTop: insets.top }]}>
      {/* 1. HEADER TRANG THỐNG KÊ */}
      <View style={[styles.header, { borderBottomColor: tokens.border }]}>
        <Text style={[styles.headerTitle, { color: tokens.text }]}>{Strings.stats.title}</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowMagazine(true);
            }}
            style={[styles.iconBtnBorderless, { marginRight: 8 }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Tạp chí Anime"
          >
            <Sparkles size={20} color={tokens.primary} strokeWidth={2.6} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleMaskMoney}
            style={styles.iconBtnBorderless}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Ẩn số tiền"
          >
            {isMasked ? (
              <EyeOff size={20} color={tokens.primary} strokeWidth={2.6} />
            ) : (
              <Eye size={20} color={tokens.text} strokeWidth={2.6} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 1B. NÚT GẠT CHUYỂN ĐỔI CHẾ ĐỘ: NHÀ HEO VS ALBUM VS PHÂN TÍCH VS TẠP CHÍ */}
      <View
        style={[
          styles.segmentContainer,
          { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setViewMode('HOUSE');
          }}
          style={[
            styles.segmentBtn,
            viewMode === 'HOUSE' && [
              styles.segmentBtnActive,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ],
          ]}
        >
          <Home
            size={14}
            color={viewMode === 'HOUSE' ? tokens.primary : tokens.textMuted}
            strokeWidth={2.4}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color: viewMode === 'HOUSE' ? tokens.text : tokens.textMuted,
                fontWeight: viewMode === 'HOUSE' ? '700' : '500',
              },
            ]}
          >
            Nhà Heo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setViewMode('ALBUM');
          }}
          style={[
            styles.segmentBtn,
            viewMode === 'ALBUM' && [
              styles.segmentBtnActive,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ],
          ]}
        >
          <Images
            size={14}
            color={viewMode === 'ALBUM' ? tokens.primary : tokens.textMuted}
            strokeWidth={2.4}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color: viewMode === 'ALBUM' ? tokens.text : tokens.textMuted,
                fontWeight: viewMode === 'ALBUM' ? '700' : '500',
              },
            ]}
          >
            Album
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setViewMode('ANALYTICS');
          }}
          style={[
            styles.segmentBtn,
            viewMode === 'ANALYTICS' && [
              styles.segmentBtnActive,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ],
          ]}
        >
          <BarChart2
            size={14}
            color={viewMode === 'ANALYTICS' ? tokens.primary : tokens.textMuted}
            strokeWidth={2.4}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color: viewMode === 'ANALYTICS' ? tokens.text : tokens.textMuted,
                fontWeight: viewMode === 'ANALYTICS' ? '700' : '500',
              },
            ]}
          >
            Phân tích
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setViewMode('MAGAZINE');
          }}
          style={[
            styles.segmentBtn,
            viewMode === 'MAGAZINE' && [
              styles.segmentBtnActive,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ],
          ]}
        >
          <BookOpen
            size={14}
            color={viewMode === 'MAGAZINE' ? tokens.primary : tokens.textMuted}
            strokeWidth={2.4}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color: viewMode === 'MAGAZINE' ? tokens.text : tokens.textMuted,
                fontWeight: viewMode === 'MAGAZINE' ? '700' : '500',
              },
            ]}
          >
            Tạp chí
          </Text>
        </TouchableOpacity>
      </View>

      {/* RẼ NHÁNH CHẾ ĐỘ XEM */}
      {viewMode === 'HOUSE' ? (
        /* CHẾ ĐỘ XEM NHÀ HEO 2 TẦNG 6 PHÒNG */
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: contentBottomPadding + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. KHUNG VƯỜN PIXEL NHÀ HEO */}
          <View style={styles.houseHeroWrapper}>
            <PixelHouseWebView
              onSelectRoom={(r) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedHouseRoom(r);
              }}
              onExitToGarden={onNavigateHome}
            />
          </View>

          {/* 2. THẺ CHI TIẾT CĂN PHÒNG ĐANG CHỌN (KẾT NỐI SỐ LIỆU THẬT) */}
          <View
            style={[
              styles.roomDetailCard,
              {
                backgroundColor: tokens.surface || '#FFFBF1',
                borderColor: tokens.border || '#2B2118',
              },
            ]}
          >
            <View style={styles.roomDetailHeader}>
              <View style={styles.roomBadgePill}>
                <Text style={styles.roomBadgeText}>{selectedHouseRoom.name}</Text>
              </View>
              <Text style={[styles.roomSubtitleText, { color: tokens.textMuted }]}>
                {selectedHouseRoom.subtitle}
              </Text>
            </View>

            {selectedHouseRoom.id === 'bep' && (
              <View style={styles.roomContentBox}>
                <Text style={styles.roomMetricLabel}>Tổng chi Ăn uống tháng này:</Text>
                <Text style={[styles.roomMetricValue, { color: tokens.text }]}>
                  {isMasked ? '••••••' : formatVND(foodSpent)}
                </Text>
                <Text style={[styles.roomHintText, { color: tokens.textMuted }]}>
                  🍲 Bếp luôn đỏ lửa cơm canh thơm ngon. Nhớ duy trì ăn uống lành mạnh nha!
                </Text>
              </View>
            )}

            {selectedHouseRoom.id === 'khach' && (
              <View style={styles.roomContentBox}>
                <Text style={styles.roomMetricLabel}>Tổng chi Mua sắm tháng này:</Text>
                <Text style={[styles.roomMetricValue, { color: tokens.text }]}>
                  {isMasked ? '••••••' : formatVND(shopSpent)}
                </Text>
                <Text style={[styles.roomHintText, { color: tokens.textMuted }]}>
                  🛋️ Phòng khách sang trọng tiếp đón bạn bè. Đừng để bẫy săn sale làm vơi ví nha!
                </Text>
              </View>
            )}

            {selectedHouseRoom.id === 'lamviec' && (
              <View style={styles.roomContentBox}>
                <Text style={styles.roomMetricLabel}>Tổng chi Đi lại / Làm việc:</Text>
                <Text style={[styles.roomMetricValue, { color: tokens.text }]}>
                  {isMasked ? '••••••' : formatVND(transportSpent)}
                </Text>
                <Text style={[styles.roomHintText, { color: tokens.textMuted }]}>
                  💻 Đi lại chăm chỉ kiếm tiền. Chú heo chúc bạn công việc luôn hanh thông!
                </Text>
              </View>
            )}

            {selectedHouseRoom.id === 'ngu' && (
              <View style={styles.roomContentBox}>
                <Text style={styles.roomMetricLabel}>Khoản tiền Đã Cứu Ví / Giữ lại được:</Text>
                <Text style={[styles.roomMetricValue, { color: '#5E9A57' }]}>
                  {isMasked ? '••••••' : formatVND(savedMoney)}
                </Text>
                <Text style={[styles.roomHintText, { color: tokens.textMuted }]}>
                  🛏️ Giấc ngủ ngon là liều thuốc vàng. Mỗi đồng giữ lại hôm nay sẽ nuôi lớn tương lai!
                </Text>
              </View>
            )}

            {selectedHouseRoom.id === 'anh' && (
              <View style={styles.roomContentBox}>
                <Text style={styles.roomMetricLabel}>Khoảnh khắc chụp ảnh:</Text>
                <Text style={[styles.roomMetricValue, { color: tokens.text }]}>
                  {photosCount} ảnh kỷ niệm
                </Text>
                <TouchableOpacity
                  style={styles.roomActionBtn}
                  activeOpacity={0.8}
                  onPress={() => setViewMode('ALBUM')}
                >
                  <Text style={styles.roomActionBtnText}>Xem toàn bộ Cuốn Album 📸</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedHouseRoom.id === 'sanh' && (
              <View style={styles.roomContentBox}>
                <Text style={styles.roomMetricLabel}>Số dư ví khả dụng hiện tại:</Text>
                <Text style={[styles.roomMetricValue, { color: '#5E9A57' }]}>
                  {isMasked ? '••••••' : formatVND(realBalance)}
                </Text>
                <TouchableOpacity
                  style={styles.roomActionBtn}
                  activeOpacity={0.8}
                  onPress={() => setViewMode('ANALYTICS')}
                >
                  <Text style={styles.roomActionBtnText}>Xem phân tích tài chính chuyên sâu 📊</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      ) : viewMode === 'ALBUM' ? (
        /* CHẾ ĐỘ CUỐN ALBUM ẢNH */
        <View style={{ flex: 1 }}>
          {/* 2. CHIP LỌC CUỘN NGANG */}
          <View style={[styles.filterStripWrapper, { borderBottomColor: tokens.border }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterStripContent}
            >
              {filterChips.map((item) => {
                const active = selectedFilter === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedFilter(item.id);
                    }}
                    style={[
                      styles.filterChip,
                      { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
                      active && [styles.filterChipActive, { backgroundColor: tokens.primary }],
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: active ? '#1B2733' : tokens.textMuted },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 3. THANH NHẢY NHANH QUA CÁC THÁNG */}
          <MonthQuickJumper
            months={monthJumperItems}
            activeMonthKey={activeMonthKey}
            onSelectMonth={handleSelectMonthJumper}
          />

          {/* 4. ALBUM ẢNH CUỘN DỌC THEO THÁNG */}
          {transactions.length === 0 ? (
            // Trạng thái trống toàn app
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Camera size={36} color={tokens.primary} strokeWidth={2.6} />
              </View>
              <Text style={[styles.emptyTitle, { color: tokens.text }]}>{Strings.stats.emptyTitle}</Text>
              <Text style={[styles.emptyDesc, { color: tokens.textMuted }]}>{Strings.stats.emptyDesc}</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (onNavigateToCamera) onNavigateToCamera();
                }}
                style={[styles.emptyCtaButton, { backgroundColor: tokens.primary }]}
              >
                <Text style={styles.emptyCtaText}>{Strings.stats.emptyCta}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <SectionList<RowData>
              ref={sectionListRef}
              sections={filteredSections}
              keyExtractor={(row) => row.id}
              stickySectionHeadersEnabled={true}
              renderSectionHeader={({ section }) => (
                <MonthStickyHeader
                  summary={section.summary}
                  isMasked={isMasked}
                  onOpenDetail={() => handleOpenMonthDetail(section.summary, section.rawItems)}
                  onUnpricedChipPress={() => setSelectedFilter('UNPRICED')}
                />
              )}
              renderItem={({ item: row }) => (
                <View style={styles.rowGrid}>
                  {row.items.map((tx, idx) => {
                    if (!tx) {
                      return <View key={`placeholder-${idx}`} style={styles.placeholderCell} />;
                    }
                    return (
                      <TransactionPhotoCell
                        key={tx.id}
                        item={tx}
                        isMasked={isMasked}
                        onPress={handleOpenItemDetail}
                        onUnpricedPress={handleOpenUnpricedModal}
                      />
                    );
                  })}
                </View>
              )}
              renderSectionFooter={({ section }) => {
                if (section.data.length === 0) {
                  return (
                    <View style={styles.emptyMonthNote}>
                      <Text style={[styles.emptyMonthNoteText, { color: tokens.textMuted }]}>
                        {Strings.stats.noFilterResult}
                      </Text>
                    </View>
                  );
                }
                return <View style={{ height: 16 }} />;
              }}
              contentContainerStyle={[styles.listContent, { paddingBottom: contentBottomPadding + 20 }]}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      ) : viewMode === 'ANALYTICS' ? (
        /* CHẾ ĐỘ PHÂN TÍCH DATA */
        <View style={{ flex: 1 }}>
          {/* THANH CHỌN THÁNG */}
          <MonthQuickJumper
            months={monthJumperItems}
            activeMonthKey={activeMonthKey}
            onSelectMonth={(key) => setActiveMonthKey(key)}
          />

          {/* BỘ CHUYỂN ĐỔI CHU KỲ: TUẦN NÀY VS CẢ THÁNG */}
          <View style={styles.periodSwitcherRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPeriodMode('WEEK');
              }}
              style={[
                styles.periodPill,
                periodMode === 'WEEK'
                  ? { backgroundColor: tokens.primary, borderColor: tokens.primary }
                  : { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
              ]}
            >
              <Text
                style={[
                  styles.periodPillText,
                  {
                    color: periodMode === 'WEEK' ? '#1B2733' : tokens.textMuted,
                    fontWeight: periodMode === 'WEEK' ? '700' : '500',
                  },
                ]}
              >
                Tuần Này
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPeriodMode('MONTH');
              }}
              style={[
                styles.periodPill,
                periodMode === 'MONTH'
                  ? { backgroundColor: tokens.primary, borderColor: tokens.primary }
                  : { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
              ]}
            >
              <Text
                style={[
                  styles.periodPillText,
                  {
                    color: periodMode === 'MONTH' ? '#1B2733' : tokens.textMuted,
                    fontWeight: periodMode === 'MONTH' ? '700' : '500',
                  },
                ]}
              >
                Cả Tháng
              </Text>
            </TouchableOpacity>
          </View>

          {activeSection && displayAnalyticsSummary ? (
            <AnalyticsDashboardView
              summary={displayAnalyticsSummary}
              transactions={displayAnalyticsTransactions}
              isMasked={isMasked}
              periodMode={periodMode}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyDesc, { color: tokens.textMuted }]}>
                Chưa có dữ liệu phân tích tháng này
              </Text>
            </View>
          )}
        </View>
      ) : (
        /* CHẾ ĐỘ 3: TẠP CHÍ TÀI CHÍNH ANIME DIGEST */
        <View style={{ flex: 1 }}>
          <AnimeMagazineView
            monthlyIncome={monthlyIncome}
            monthlySpent={currentMonthSpent}
            remainingDays={remainingDays}
            savingsRate={currentSavingsRate}
            isInline
          />
        </View>
      )}

      {/* 5. SHEET CHI TIẾT THÁNG */}
      <MonthDetailBottomSheet
        visible={detailVisible}
        summary={selectedMonthSummary}
        transactions={selectedMonthTxs}
        isMasked={isMasked}
        onClose={() => setDetailVisible(false)}
      />

      {/* 6. SHEET CHI TIẾT GIAO DỊCH KHI CHẠM Ô ẢNH */}
      {selectedTx && (
        <DayDetailBottomSheet
          visible={txDetailVisible}
          dateStr={selectedTx.occurred_at.split('T')[0]}
          transactions={[selectedTx]}
          isPrivacyHidden={isMasked}
          onClose={() => setTxDetailVisible(false)}
          onSelectTransaction={() => {}}
          onTakePhotoForDay={() => {
            setTxDetailVisible(false);
            if (onNavigateToCamera) onNavigateToCamera();
          }}
        />
      )}

      {/* 7. MODAL NHẬP GIÁ NHANH CHO KHOẢN CHƯA CÓ GIÁ */}
      <Modal
        visible={unpricedModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUnpricedModalVisible(false)}
      >
        <View style={styles.unpricedModalOverlay}>
          <View style={[styles.unpricedModalCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
            <Text style={[styles.unpricedModalTitle, { color: tokens.text }]}>Bổ sung giá tiền</Text>
            <Text style={[styles.unpricedModalSubtitle, { color: tokens.textMuted }]}>
              {targetUnpricedTx?.description || targetUnpricedTx?.category || 'Món đồ'}
            </Text>

            <TextInput
              value={inputPriceStr}
              onChangeText={setInputPriceStr}
              placeholder="Ví dụ: 45000"
              placeholderTextColor={tokens.textMuted}
              keyboardType="numeric"
              autoFocus
              style={[
                styles.unpricedInput,
                {
                  backgroundColor: tokens.surfaceAlt,
                  borderColor: tokens.border,
                  color: tokens.text,
                },
              ]}
            />

            <View style={styles.unpricedBtnRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setUnpricedModalVisible(false)}
                style={[styles.unpricedCancelBtn, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
              >
                <Text style={[styles.unpricedCancelText, { color: tokens.textSub }]}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSaveUnpriced}
                style={[styles.unpricedSaveBtn, { backgroundColor: tokens.primary }]}
              >
                <Text style={styles.unpricedSaveText}>Lưu giá</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* 8. BÁO CÁO TẠP CHÍ ANIME MAGAZINE (3 KPI THẾ HỆ MỚI) */}
      <AnimeMagazineReportSheet
        visible={showMagazine}
        onClose={() => setShowMagazine(false)}
        monthlyIncome={displayAnalyticsSummary?.totalIncome || 15000000}
        monthlySpent={displayAnalyticsSummary?.totalSpent || 0}
        remainingDays={getDaysRemainingInMonth()}
        savingsRate={
          displayAnalyticsSummary && displayAnalyticsSummary.totalIncome > 0
            ? Math.max(
                0,
                Math.round(
                  ((displayAnalyticsSummary.totalIncome - displayAnalyticsSummary.totalSpent) /
                    displayAnalyticsSummary.totalIncome) *
                    100
                )
              )
            : 0
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtnBorderless: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginLeft: 8,
  },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
    padding: 3,
    borderRadius: radii.full,
    borderWidth: 3,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: radii.full,
  },
  segmentBtnActive: {
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#F4B93B',
  },
  segmentText: {
    fontSize: 12.5,
    fontFamily: Platform.select({
      ios: 'Nunito-Bold',
      android: 'Nunito_700Bold',
      default: 'system-ui',
    }),
  },
  filterStripWrapper: {
    paddingVertical: 7,
    borderBottomWidth: 2,
    borderBottomColor: '#2B2118',
  },
  filterStripContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
  },
  filterChipActive: {
    backgroundColor: '#F4B93B',
    borderColor: '#2B2118',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.select({
      ios: 'Nunito-Bold',
      android: 'Nunito_700Bold',
      default: 'system-ui',
    }),
    color: '#2B2118',
  },
  listContent: {
    paddingTop: 4,
  },
  rowGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  placeholderCell: {
    flex: 1,
    aspectRatio: 3 / 4,
    margin: 2.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: 60,
  },
  emptyIconBox: {
    width: 44,
    height: 44,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  emptyCtaButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: radii.full,
    borderWidth: 3,
    borderColor: '#2B2118',
    backgroundColor: '#F4B93B',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  emptyCtaText: {
    color: '#2B2118',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Platform.select({
      ios: 'Nunito-ExtraBold',
      android: 'Nunito_800ExtraBold',
      default: 'system-ui',
    }),
  },
  emptyMonthNote: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyMonthNoteText: {
    fontSize: 12,
    fontWeight: '500',
  },
  unpricedModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  unpricedModalCard: {
    width: '100%',
    borderRadius: radii.lg,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  unpricedModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  unpricedModalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 16,
  },
  unpricedInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 18,
    fontVariant: ['tabular-nums'],
  },
  unpricedBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  unpricedCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  unpricedCancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  unpricedSaveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: radii.full,
  },
  unpricedSaveText: {
    color: '#1B2733',
    fontSize: 13,
    fontWeight: '700',
  },
  periodSwitcherRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  periodPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  periodPillText: {
    fontSize: 12,
  },
  houseHeroWrapper: {
    marginTop: 10,
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
  },
  roomDetailCard: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#2B2118',
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 3 },
  },
  roomDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  roomBadgePill: {
    backgroundColor: '#F4B93B',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  roomBadgeText: {
    color: '#2B2118',
    fontWeight: '800',
    fontSize: 13,
  },
  roomSubtitleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  roomContentBox: {
    gap: 6,
  },
  roomMetricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#85735E',
    textTransform: 'uppercase',
  },
  roomMetricValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  roomHintText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  roomActionBtn: {
    marginTop: 10,
    backgroundColor: '#2B2118',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  roomActionBtnText: {
    color: '#FFFBF1',
    fontWeight: '800',
    fontSize: 13,
  },
});
