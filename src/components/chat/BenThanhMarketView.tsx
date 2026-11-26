import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, DoorOpen, ShoppingBag, Sparkles, Utensils } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { useTransactionStore } from '../../store/transactionStore';
import { formatVND } from '../../utils/currency';
import { BenThanhMarketBannerWebView } from './BenThanhMarketBannerWebView';

export interface BenThanhMarketViewProps {
  onBack: () => void;
}

const MARKET_ZONES = [
  {
    id: 0,
    label: 'Cửa Số 1',
    stallName: 'Cửa Số 1 · Welcome to Ben Thanh Market',
    desc: 'Cổng sắt xếp kem xám, bảng đèn LED rực sáng, quầy đồng hồ WATCH và 2 chú bảo vệ thân thiện.',
    kind: 'gate',
  },
  {
    id: 1,
    label: 'Sạp Liên Sài Gòn',
    stallName: 'Sạp Liên Sài Gòn & Ngọc Hoa · Mái Vòm Vàng',
    desc: 'Gian hàng trà, cà phê, bánh kẹo đặc sản dưới mái vòm bê tông vàng, giếng trời đỏ nâu và đèn mây tre đan.',
    kind: 'shopping',
  },
  {
    id: 2,
    label: 'Khu Ăn Uống',
    stallName: 'Cổng Vòm Khu Ăn Uống · Quầy Chữ L Sạp 1044',
    desc: 'Cổng vòm cong chữ đỏ biểu tượng, quầy gạch trắng trưng bày dừa tươi và hàng ghế đẩu inox sáng bóng.',
    kind: 'food',
  },
  {
    id: 3,
    label: 'Bánh Cuốn & Bánh Bèo',
    stallName: 'Sạp Bánh Cuốn 50k · Bún Bò Huế · Bánh Bèo 20k',
    desc: 'Nồi hơi tráng bánh cuốn bốc khói, mặt bàn đá mài vàng xếp đầy dĩa bánh bèo và nem chua lá chuối.',
    kind: 'food',
  },
] as const;

export const BenThanhMarketView: React.FC<BenThanhMarketViewProps> = ({ onBack }) => {
  const { tokens, mode } = useTheme();
  const isHeocon = mode === 'heocon' || !mode;
  const screenBg = isHeocon ? '#F6EEDC' : tokens.bg || '#FFF5F7';
  const { transactions } = useTransactionStore();
  const [selectedZone, setSelectedZone] = useState<number>(0);

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

  const activeZone = MARKET_ZONES[selectedZone] || MARKET_ZONES[0];

  const handleSelectZone = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedZone(idx);
  };

  return (
    <View style={[styles.container, { backgroundColor: screenBg }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack();
          }}
          activeOpacity={0.8}
          accessibilityLabel="Quay lại Quán quen"
        >
          <ArrowLeft size={18} color="#2B2118" strokeWidth={2.8} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Chợ Bến Thành</Text>

        <TouchableOpacity
          style={styles.exitChip}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack();
          }}
          activeOpacity={0.8}
        >
          <DoorOpen size={14} color="#2B2118" strokeWidth={2.2} />
          <Text style={styles.exitChipText}>Ra phố</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BenThanhMarketBannerWebView
          active={true}
          shoppingTotalText={marketStats.shoppingTotalText}
          foodTotalText={marketStats.foodTotalText}
          visitsCount={marketStats.visitsCount}
          selectedZone={selectedZone}
          onExitToMap={onBack}
          onSelectZoneFromCanvas={(z) => setSelectedZone(z)}
        />

        <View style={styles.chipsRow}>
          {MARKET_ZONES.map((z) => {
            const isActive = selectedZone === z.id;
            const IconComp =
              z.id === 0 ? DoorOpen : z.id === 1 ? ShoppingBag : z.id === 2 ? Utensils : Sparkles;
            return (
              <TouchableOpacity
                key={z.id}
                style={[styles.zoneChip, isActive && styles.zoneChipActive]}
                onPress={() => handleSelectZone(z.id)}
                activeOpacity={0.85}
              >
                <IconComp size={14} color={isActive ? '#2B2118' : '#6A5B4D'} strokeWidth={2.2} />
                <Text style={[styles.zoneChipText, isActive && styles.zoneChipTextActive]}>{z.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.zoneCard}>
          <Text style={styles.zoneTitle}>{activeZone.stallName}</Text>
          <Text style={styles.zoneDesc}>{activeZone.desc}</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Mua sắm</Text>
            <Text style={styles.statVal}>{marketStats.shoppingTotalText}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Ăn uống</Text>
            <Text style={styles.statVal}>{marketStats.foodTotalText}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={[styles.statCol, { alignItems: 'flex-end' }]}>
            <Text style={styles.statLabel}>Điểm đã ghé</Text>
            <Text style={styles.statVal}>{marketStats.visitsCount} quán</Text>
          </View>
        </View>
      </ScrollView>
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
    paddingTop: 6,
    paddingBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 22,
    letterSpacing: 0.3,
    color: '#2B2118',
  },
  exitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    backgroundColor: '#FFE08A',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  exitChipText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 12,
    color: '#2B2118',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  zoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
  },
  zoneChipActive: {
    backgroundColor: '#FFE08A',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  zoneChipText: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 12,
    color: '#6A5B4D',
  },
  zoneChipTextActive: {
    color: '#2B2118',
    fontWeight: '800',
  },
  zoneCard: {
    backgroundColor: '#FFFBF1',
    borderWidth: 3,
    borderColor: '#2B2118',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  zoneTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 16,
    color: '#2B2118',
    marginBottom: 4,
  },
  zoneDesc: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 19,
    color: '#5E4E40',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF1',
    borderWidth: 3,
    borderColor: '#2B2118',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 11,
    color: '#8A7A6A',
    marginBottom: 2,
  },
  statVal: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 15,
    color: '#2B2118',
    fontVariant: ['tabular-nums'],
  },
  statDivider: {
    width: 2,
    height: 28,
    backgroundColor: '#E8DAC2',
    marginHorizontal: 10,
  },
});
