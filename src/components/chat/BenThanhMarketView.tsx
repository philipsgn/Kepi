import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTransactionStore } from '../../store/transactionStore';
import { formatVND } from '../../utils/currency';
import { BenThanhMarketBannerWebView } from './BenThanhMarketBannerWebView';

export interface BenThanhMarketViewProps {
  onBack: () => void;
}

/**
 * Màn Hình Chợ Bến Thành Toàn Màn Hình RPG (Quyết định 211)
 * - 100% Fullscreen edge-to-edge không viền banner, không card chữ, không thanh chip đáy, không nút "Ra phố".
 * - Đi ra tự nhiên bằng Cổng Trước (Cửa Số 1) hoặc Cổng Sau (Cửa Bắc) ngay trong lòng chợ.
 * - Chỉ giữ 1 nút tròn nhỏ [←] bán trong suốt góc trên trái để thoát nhanh dự phòng.
 */
export const BenThanhMarketView: React.FC<BenThanhMarketViewProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { transactions } = useTransactionStore();

  const marketStats = useMemo(() => {
    const confirmed = transactions.filter((t) => (t.status === 'CONFIRMED' || !t.status) && t.type !== 'INCOME');
    let shoppingTotal = 0;
    let foodTotal = 0;
    let visitsCount = 0;

    confirmed.forEach((tx) => {
      const cat = String(tx.category || '').toLowerCase();
      if (cat.includes('mua') || cat.includes('shopping') || cat.includes('quần')) {
        shoppingTotal += tx.amount || 0;
      } else if (cat.includes('ăn') || cat.includes('uống') || cat.includes('food') || cat.includes('cafe')) {
        foodTotal += tx.amount || 0;
      }
      if ((tx.lat != null && tx.lng != null) || Boolean(tx.location_name)) {
        visitsCount += 1;
      }
    });

    return {
      shoppingTotalText: formatVND(shoppingTotal),
      foodTotalText: formatVND(foodTotal),
      visitsCount,
    };
  }, [transactions]);

  return (
    <View style={styles.fullscreenContainer}>
      <BenThanhMarketBannerWebView
        active={true}
        shoppingTotalText={marketStats.shoppingTotalText}
        foodTotalText={marketStats.foodTotalText}
        visitsCount={marketStats.visitsCount}
        onExitToMap={onBack}
      />

      <TouchableOpacity
        style={[styles.floatingBackBtn, { top: Math.max(insets.top, 10) + 6 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onBack();
        }}
        activeOpacity={0.8}
        accessibilityLabel="Quay lại"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ArrowLeft size={18} color="#2B2118" strokeWidth={2.8} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#3A2D25',
  },
  floatingBackBtn: {
    position: 'absolute',
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: 'rgba(255, 251, 241, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 4,
    zIndex: 20,
  },
});
