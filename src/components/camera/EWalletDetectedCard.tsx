import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ExternalLink,
  PenLine,
  Smartphone,
  Sparkles,
  Wallet,
  X,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { EWalletDetectionResult } from '../../utils/qr/walletDeeplink';
import { useTheme } from '../../theme/ThemeContext';
import { useBudgetStore } from '../../store/budgetStore';

interface EWalletDetectedCardProps {
  wallet: EWalletDetectionResult;
  onDismiss: () => void;
  onProceedPay: (amount: number, note?: string) => void;
  onManualRecord: () => void;
}

const QUICK_AMOUNTS = [30000, 45000, 60000, 100000];

export const EWalletDetectedCard: React.FC<EWalletDetectedCardProps> = ({
  wallet,
  onDismiss,
  onProceedPay,
  onManualRecord,
}) => {
  const { isDark, tokens } = useTheme();
  const { todayBudget, todaySpent } = useBudgetStore();

  const [inputAmount, setInputAmount] = useState<string>(
    wallet.detectedAmount ? wallet.detectedAmount.toString() : ''
  );
  const [note, setNote] = useState<string>('');

  const remainingToday = Math.max(0, todayBudget - todaySpent);
  const currentAmountNum = parseInt(inputAmount.replace(/\D/g, ''), 10) || 0;
  const isOverBudget = currentAmountNum > remainingToday && currentAmountNum > 0;

  const isZaloPay = wallet.walletType === 'ZALOPAY';
  const brandName = wallet.walletName || (isZaloPay ? 'ZaloPay' : 'MoMo');
  const brandColor = wallet.brandColor || (isZaloPay ? '#0068FF' : '#A50064');

  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN');
  };

  const handleQuickChipPress = (amt: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputAmount(amt.toString());
  };

  const handleLaunchWallet = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onProceedPay(currentAmountNum, note.trim() || undefined);
  };

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: isDark ? 'rgba(18, 24, 34, 0.96)' : 'rgba(255, 253, 248, 0.98)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(22, 34, 49, 0.12)',
        },
      ]}
    >
      {/* 1. Header Bar: E-Wallet Identity & Dismiss Button */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.walletIconCircle,
              {
                backgroundColor: isDark
                  ? isZaloPay
                    ? 'rgba(0, 104, 255, 0.18)'
                    : 'rgba(165, 0, 100, 0.18)'
                  : isZaloPay
                  ? '#EBF3FF'
                  : '#FFF0F7',
              },
            ]}
          >
            <Smartphone size={17} color={brandColor} strokeWidth={2.4} />
          </View>
          <View style={styles.headerTitles}>
            <View style={styles.badgeRow}>
              <Text
                style={[styles.payeeNameText, { color: isDark ? '#FAF6EC' : '#141D26' }]}
                numberOfLines={1}
              >
                {wallet.payeeName || `Mã thanh toán ${brandName}`}
              </Text>
              <View
                style={[
                  styles.brandBadge,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.05)',
                  },
                ]}
              >
                <Text style={[styles.brandBadgeText, { color: brandColor }]}>
                  {brandName}
                </Text>
              </View>
            </View>
            <Text style={[styles.subText, { color: isDark ? '#8A99AC' : '#6F7E8F' }]}>
              Ví Điện Tử Việt Nam · Whitelist An Toàn
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onDismiss();
          }}
          style={[styles.dismissBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <X size={16} color={isDark ? '#FAF6EC' : '#141D26'} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* 2. Amount Input Section */}
      <View
        style={[
          styles.amountBox,
          {
            backgroundColor: isDark ? 'rgba(25, 34, 48, 0.7)' : 'rgba(245, 240, 230, 0.7)',
            borderColor: isOverBudget
              ? Colors.redOver
              : isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.06)',
          },
        ]}
      >
        <Text style={[styles.amountLabel, { color: isDark ? '#8A99AC' : '#6F7E8F' }]}>
          Số tiền thanh toán:
        </Text>
        <View style={styles.amountInputRow}>
          <TextInput
            style={[
              styles.amountInput,
              { color: isDark ? '#FAF6EC' : '#141D26' },
            ]}
            placeholder="0"
            placeholderTextColor={isDark ? '#4E5F73' : '#A0AEC0'}
            keyboardType="numeric"
            value={inputAmount ? formatVND(currentAmountNum) : ''}
            onChangeText={(text) => {
              const numeric = text.replace(/\D/g, '');
              setInputAmount(numeric);
            }}
          />
          <Text style={[styles.currencyUnit, { color: isDark ? '#FAF6EC' : '#141D26' }]}>
            đ
          </Text>
        </View>

        {/* Quick Amount Chips */}
        <View style={styles.quickChipsRow}>
          {QUICK_AMOUNTS.map((amt) => {
            const isSelected = currentAmountNum === amt;
            return (
              <TouchableOpacity
                key={amt}
                style={[
                  styles.quickChip,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? tokens.primary
                        : tokens.primary
                      : isDark
                      ? 'rgba(255,255,255,0.06)'
                      : '#FFFFFF',
                    borderColor: isSelected
                      ? tokens.primary
                      : isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.08)',
                  },
                ]}
                onPress={() => handleQuickChipPress(amt)}
              >
                <Text
                  style={[
                    styles.quickChipText,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : isDark
                        ? '#FAF6EC'
                        : '#141D26',
                    },
                  ]}
                >
                  +{amt / 1000}k
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Budget Warning */}
        {isOverBudget && (
          <View style={styles.overBudgetRow}>
            <AlertTriangle size={13} color={Colors.redOver} strokeWidth={2.4} />
            <Text style={styles.overBudgetText}>
              Vượt ngân sách hôm nay ({formatVND(remainingToday)} đ)
            </Text>
          </View>
        )}
      </View>

      {/* 3. Safety & Handoff Notice Banner */}
      <View
        style={[
          styles.noticeBox,
          {
            backgroundColor: isDark
              ? 'rgba(229, 152, 68, 0.12)'
              : 'rgba(229, 152, 68, 0.10)',
            borderColor: 'rgba(229, 152, 68, 0.25)',
          },
        ]}
      >
        <ShieldCheck size={14} color="#E59844" strokeWidth={2.4} />
        <Text
          style={[
            styles.noticeText,
            { color: isDark ? '#FAF6EC' : '#5A462B' },
          ]}
        >
          Sẽ mở {brandName} để bạn thanh toán. Giao dịch sẽ lưu vào Hộp xác nhận để bạn chốt sổ khi quay lại Kepi.
        </Text>
      </View>

      {/* 4. Action Buttons */}
      <View style={styles.actionButtonsCol}>
        <TouchableOpacity
          style={[
            styles.mainPayButton,
            { backgroundColor: brandColor },
          ]}
          onPress={handleLaunchWallet}
          activeOpacity={0.85}
        >
          <ExternalLink size={17} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.mainPayButtonText}>
            Mở {brandName} {currentAmountNum > 0 ? `(${formatVND(currentAmountNum)} đ)` : ''}
          </Text>
        </TouchableOpacity>

        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(0, 0, 0, 0.04)',
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onManualRecord();
            }}
          >
            <PenLine size={14} color={isDark ? '#FAF6EC' : '#141D26'} strokeWidth={2} />
            <Text
              style={[
                styles.secondaryBtnText,
                { color: isDark ? '#FAF6EC' : '#141D26' },
              ]}
            >
              Ghi tay vào Kepi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(0, 0, 0, 0.04)',
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onDismiss();
            }}
          >
            <X size={14} color={isDark ? '#8A99AC' : '#6F7E8F'} strokeWidth={2} />
            <Text
              style={[
                styles.secondaryBtnText,
                { color: isDark ? '#8A99AC' : '#6F7E8F' },
              ]}
            >
              Bỏ qua
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  walletIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitles: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  payeeNameText: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 15,
    marginRight: 6,
  },
  brandBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  brandBadgeText: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 11,
  },
  subText: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 12,
    marginTop: 2,
  },
  dismissBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  amountBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  amountLabel: {
    fontFamily: 'BeVietnamPro-Medium',
    fontSize: 12,
    marginBottom: 4,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountInput: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 26,
    fontVariant: ['tabular-nums'],
    padding: 0,
    minWidth: 60,
  },
  currencyUnit: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 18,
    marginLeft: 4,
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickChipText: {
    fontFamily: 'BeVietnamPro-Medium',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  overBudgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  overBudgetText: {
    color: Colors.redOver,
    fontSize: 12,
    fontFamily: 'BeVietnamPro-Medium',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  noticeText: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 11.5,
    flex: 1,
    lineHeight: 16,
  },
  actionButtonsCol: {
    gap: 8,
  },
  mainPayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  mainPayButtonText: {
    color: '#FFFFFF',
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 15,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  secondaryBtnText: {
    fontFamily: 'BeVietnamPro-Medium',
    fontSize: 13,
  },
});
