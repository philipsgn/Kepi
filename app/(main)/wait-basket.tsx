import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Clock,
  Hourglass,
  Leaf,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../src/constants/colors';
import { BlockLayout, Spacing } from '../../src/constants/layout';
import { Strings } from '../../src/constants/strings';

// Custom Blocky Components
import { Block } from '../../src/components/common/Block';
import { BlockButton } from '../../src/components/common/BlockButton';
import { PriceTag } from '../../src/components/common/PriceTag';
import { AutumnCelebration } from '../../src/components/common/AutumnCelebration';

// Stores & Services
import { useWaitBasketStore } from '../../src/store/waitBasketStore';
import { useBudgetStore } from '../../src/store/budgetStore';
import { cancelItemReminders } from '../../src/services/notifications';
import { formatCompactVND, formatVND } from '../../src/utils/currency';

export default function WaitBasketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, resolveItem, getPendingTotalAmount } = useWaitBasketStore();
  const { recordSavedMoney, recordExpense } = useBudgetStore();

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrateAmount, setCelebrateAmount] = useState(0);

  const pendingItems = items.filter((i) => i.status === 'WAITING');
  const skippedItems = items.filter((i) => i.status === 'SKIPPED');
  const totalPending = getPendingTotalAmount();

  const handleSkipItem = async (itemId: string, itemName: string, amount: number) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await cancelItemReminders(itemId);
    await resolveItem(itemId, 'SKIPPED');
    recordSavedMoney(amount);

    setCelebrateAmount(amount);
    setShowCelebration(true);
  };

  const handleBuyItem = async (itemId: string, itemName: string, amount: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await cancelItemReminders(itemId);
    await resolveItem(itemId, 'BOUGHT');
    recordExpense(amount);

    Alert.alert(
      Strings.waitBasket.movedToBought,
      `Đã ghi nhận khoản chi "${itemName}" (${formatVND(amount)}).`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AutumnCelebration
        visible={showCelebration}
        savedAmount={celebrateAmount}
        onFinish={() => setShowCelebration(false)}
      />

      {/* 1. TOP HEADER KHỐI VUÔNG */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>{Strings.waitBasket.title}</Text>
          <Text style={styles.headerSubTitle}>{Strings.waitBasket.subtitle}</Text>
        </View>

        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. HERO BLOCK: TỔNG TIỀN ĐANG ĐỂ SAU */}
        <Block variant="yellow" style={styles.heroBlock} contentStyle={styles.heroBlockInner}>
          <View style={styles.heroRow}>
            <Hourglass size={18} color="#000000" strokeWidth={2.5} />
            <Text style={styles.heroLabel}>Đang cân nhắc ({pendingItems.length} món):</Text>
          </View>
          <Text style={styles.heroAmount}>{formatVND(totalPending)}</Text>
          <Text style={styles.heroNote}>
            Cứ sau 1–2 tiếng sẽ nhắc lại. Cơn thèm qua đi thì bấm "{Strings.actualPrice.skipBuy}".
          </Text>
        </Block>

        {/* 3. SECTION DANH SÁCH MÓN ĐANG CHỜ */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Danh sách để sau ({pendingItems.length})
          </Text>
        </View>

        {pendingItems.length === 0 ? (
          <Block variant="dark" style={styles.emptyBlock} contentStyle={styles.emptyContent}>
            <Leaf size={32} color={Colors.primaryYellow} strokeWidth={2} />
            <Text style={styles.emptyText}>{Strings.waitBasket.emptyList}</Text>
          </Block>
        ) : (
          pendingItems.map((item) => (
            <Block key={item.id} variant="dark" style={styles.itemBlock} contentStyle={styles.itemInner}>
              <View style={styles.itemTopRow}>
                {item.photo_url ? (
                  <Image source={{ uri: item.photo_url }} style={styles.itemThumb} resizeMode="cover" />
                ) : (
                  <View style={styles.itemThumbFallback}>
                    <ShoppingBag size={20} color={Colors.primaryYellow} strokeWidth={2} />
                  </View>
                )}

                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.item_name}
                  </Text>
                  <PriceTag amount={item.amount} color="yellow" size="md" />
                  <View style={styles.timeRow}>
                    <Clock size={12} color="#888888" strokeWidth={2} />
                    <Text style={styles.timeText}>Nhắc sau 1–2 tiếng</Text>
                  </View>
                </View>
              </View>

              {/* 2 NÚT HÀNH ĐỘNG KHỐI VUÔNG */}
              <View style={styles.actionsRow}>
                <View style={{ flex: 1 }}>
                  <BlockButton
                    title={Strings.actualPrice.skipBuy}
                    variant="primary"
                    size="sm"
                    fullWidth
                    icon={<ShieldCheck size={14} color="#000000" strokeWidth={2.5} />}
                    onPress={() => handleSkipItem(item.id, item.item_name, item.amount)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <BlockButton
                    title={Strings.actualPrice.buyAnyway}
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onPress={() => handleBuyItem(item.id, item.item_name, item.amount)}
                  />
                </View>
              </View>
            </Block>
          ))
        )}

        {/* 4. LỊCH SỬ NHỮNG MÓN ĐÃ QUYẾT ĐỊNH KHÔNG MUA */}
        {skippedItems.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                Đã giữ lại được ({skippedItems.length})
              </Text>
            </View>

            {skippedItems.slice(0, 5).map((item) => (
              <Block key={item.id} variant="cream" style={styles.historyBlock} contentStyle={styles.historyInner}>
                <CheckCircle size={18} color={Colors.greenSafe} strokeWidth={2.5} />
                <View style={styles.historyInfo}>
                  <Text style={styles.historyName}>{item.item_name}</Text>
                  <Text style={styles.historySub}>Đã quyết định không mua</Text>
                </View>
                <Text style={styles.historyAmount}>+{formatVND(item.amount)}</Text>
              </Block>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 3,
    borderBottomColor: '#000000',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.surfaceDark,
    borderWidth: BlockLayout.borderWidth,
    borderColor: Colors.borderBlack,
    justifyContent: 'center',
    alignItems: 'center',
    ...BlockLayout.shadowSm,
  },
  headerTitleCol: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  headerSubTitle: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  heroBlock: {
    width: '100%',
  },
  heroBlockInner: {
    padding: Spacing.md,
    gap: 4,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroLabel: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  heroAmount: {
    color: '#000000',
    fontSize: 26,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    marginVertical: 4,
  },
  heroNote: {
    color: 'rgba(0, 0, 0, 0.75)',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  sectionHeaderRow: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: -0.2,
  },
  emptyBlock: {
    width: '100%',
  },
  emptyContent: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  itemBlock: {
    width: '100%',
  },
  itemInner: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  itemTopRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  itemThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
  },
  itemThumbFallback: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 4,
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  historySection: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  historyBlock: {
    width: '100%',
    marginBottom: Spacing.xs,
  },
  historyInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  historySub: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: 11,
    fontWeight: '600',
  },
  historyAmount: {
    color: Colors.greenSafe,
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
});
