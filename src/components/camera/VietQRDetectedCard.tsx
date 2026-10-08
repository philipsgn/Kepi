import React, { useEffect, useState } from 'react';
import {
  Alert,
  Clipboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  PenLine,
  ScanLine,
  Smartphone,
  Sparkles,
  Store,
  Tag,
  X,
  Zap,
  Bell,
  ImagePlus,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { VietQRPayload } from '../../utils/qr/emvParser';
import {
  getBankByBin,
  isBankAutofillSupported,
  SUPPORTED_BANKS,
} from '../../utils/qr/bankDeeplink';
import { isBankNoAutofill } from '../../services/bankCapabilityService';
import { ProceedPayOptions } from '../../hooks/useVietQRScanner';
import { useTheme } from '../../theme/ThemeContext';
import { useBudgetStore } from '../../store/budgetStore';
import { STORAGE_KEY_QR_DEFAULT_BANK } from '../profile/QRPaySettingsCard';

interface VietQRDetectedCardProps {
  payload: VietQRPayload;
  onDismiss: () => void;
  onProceedPay: (
    amount: number,
    bankAppId: string,
    note?: string,
    options?: ProceedPayOptions
  ) => void;
  onManualRecord: (amount?: number, payee?: string) => void;
  onOpenUploadReceipt?: () => void;
}

const POPULAR_BANK_IDS = [
  'mb',
  'tcb',
  'vcb',
  'bidv',
  'icb',
  'acb',
  'ocb',
  'vpb',
  'tpb',
  'vba',
  'cake',
  'timo',
  'vib-2',
  'shb',
  'lpb',
  'seab',
  'hdb',
];
const ALL_BANK_IDS = Object.keys(SUPPORTED_BANKS);
const ORDERED_PAY_BANKS = [
  ...POPULAR_BANK_IDS,
  ...ALL_BANK_IDS.filter((id) => !POPULAR_BANK_IDS.includes(id)),
];

export const VietQRDetectedCard: React.FC<VietQRDetectedCardProps> = ({
  payload,
  onDismiss,
  onProceedPay,
  onManualRecord,
  onOpenUploadReceipt,
}) => {
  const { isDark, tokens } = useTheme();
  const { todayBudget, todaySpent } = useBudgetStore();

  // Dynamic amount vs Static input
  const [inputAmount, setInputAmount] = useState<string>(
    payload.amount ? payload.amount.toString() : ''
  );

  // Selected payment bank (defaults to saved preferred bank or 'tcb')
  const [selectedBankId, setSelectedBankId] = useState<string>('tcb');
  const [isNoAutofill, setIsNoAutofill] = useState<boolean>(false);
  const [showBankPicker, setShowBankPicker] = useState<boolean>(false);
  const [copiedType, setCopiedType] = useState<
    'amount' | 'note' | 'account' | 'full' | null
  >(null);

  const remainingToday = Math.max(0, todayBudget - todaySpent);
  const currentAmountNum = parseInt(inputAmount.replace(/\D/g, ''), 10) || 0;
  const isOverBudget = currentAmountNum > remainingToday && currentAmountNum > 0;

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY_QR_DEFAULT_BANK);
        if (saved && SUPPORTED_BANKS[saved]) {
          setSelectedBankId(saved);
        } else {
          // If no default preference, check payee bank or fallback
          const matched = getBankByBin(payload.bankBin);
          if (matched && SUPPORTED_BANKS[matched.appId]) {
            setSelectedBankId(matched.appId);
          }
        }
      } catch {}
    })();
  }, [payload.bankBin]);

  useEffect(() => {
    let active = true;
    (async () => {
      const isNo = await isBankNoAutofill(selectedBankId);
      if (active) setIsNoAutofill(isNo);
    })();
    return () => {
      active = false;
    };
  }, [selectedBankId]);

  const bankMeta = SUPPORTED_BANKS[selectedBankId] || SUPPORTED_BANKS.tcb;
  const isAutofill = isBankAutofillSupported(selectedBankId);
  const payeeBankMeta = getBankByBin(payload.bankBin);

  const isStatic = payload.kind === 'STATIC';

  // Manual explicit copy handlers
  const handleCopyAmount = () => {
    if (currentAmountNum <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Clipboard.setString(currentAmountNum.toString());
    setCopiedType('amount');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyAccount = () => {
    if (!payload.accountRef) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Clipboard.setString(payload.accountRef);
    setCopiedType('account');
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Launch bank app and create PENDING transaction
  const handleOpenBankApp = () => {
    if (currentAmountNum <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Chưa có số tiền', 'Vui lòng nhập số tiền bạn muốn chuyển.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onProceedPay(currentAmountNum, selectedBankId, payload.note, {
      isNoAutofill,
    });
  };

  // Tier 3: User wants to open banking app manually without automated scheme
  const handleManualSelfPay = () => {
    if (currentAmountNum <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Chưa có số tiền', 'Vui lòng nhập số tiền bạn muốn chuyển.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onProceedPay(currentAmountNum, selectedBankId, payload.note, {
      isManualSelfPay: true,
    });
  };

  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN');
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
      {/* Header bar: Payee & Dismiss */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.bankIconCircle, { backgroundColor: isDark ? '#222E3F' : '#F0E8D8' }]}>
            <Store size={16} color={tokens.primary} strokeWidth={2.4} />
          </View>
          <View style={styles.headerTitles}>
            <Text
              style={[styles.payeeNameText, { color: isDark ? '#FAF6EC' : '#141D26' }]}
              numberOfLines={1}
            >
              {payload.payeeName || 'Điểm Chấp Nhận VietQR'}
            </Text>
            <Text style={[styles.bankSubText, { color: isDark ? '#8A99AC' : '#6F7E8F' }]}>
              {payeeBankMeta ? payeeBankMeta.shortName : 'Tài khoản thụ hưởng'} · NAPAS 247
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn} activeOpacity={0.8}>
          <X size={18} color={isDark ? '#8A99AC' : '#556578'} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* Amount Display or Input */}
      {isStatic ? (
        <View style={styles.staticInputBlock}>
          <Text style={[styles.inputLabel, { color: isDark ? '#A2B3C7' : '#5E6F82' }]}>
            Mã chưa có số tiền. Nhập số tiền chuyển:
          </Text>
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: isDark ? '#0F1622' : '#FFFFFF',
                borderColor: isDark ? '#263445' : '#DCE2E8',
              },
            ]}
          >
            <TextInput
              style={[
                styles.amountInputField,
                { color: isDark ? '#FAF6EC' : '#141D26' },
              ]}
              value={inputAmount ? formatVND(parseInt(inputAmount, 10)) : ''}
              onChangeText={(text) => setInputAmount(text.replace(/\D/g, ''))}
              placeholder="0 đ"
              placeholderTextColor="#888888"
              keyboardType="number-pad"
              autoFocus
            />
          </View>
        </View>
      ) : (
        <View style={styles.amountDisplayBlock}>
          <View style={styles.amountLeft}>
            <Text style={[styles.amountLabel, { color: isDark ? '#8A99AC' : '#6F7E8F' }]}>
              Số tiền thanh toán
            </Text>
            <Text
              style={[
                styles.amountValueText,
                { color: isDark ? '#FAF6EC' : '#141D26' },
              ]}
            >
              {formatVND(currentAmountNum)} <Text style={styles.currencySymbol}>đ</Text>
            </Text>
          </View>

          {/* Dual-Engine Mode Badge */}
          {isNoAutofill ? (
            <View
              style={[
                styles.tierBadge,
                {
                  backgroundColor: isDark ? 'rgba(229, 152, 68, 0.14)' : 'rgba(229, 152, 68, 0.12)',
                  borderColor: 'rgba(229, 152, 68, 0.35)',
                },
              ]}
            >
              <ScanLine size={11} color={tokens.primary} strokeWidth={2.4} />
              <Text style={[styles.tierBadgeText, { color: tokens.primary }]}>
                Chưa hỗ trợ điền sẵn
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.tierBadge,
                {
                  backgroundColor: 'rgba(126, 159, 128, 0.15)',
                  borderColor: 'rgba(126, 159, 128, 0.4)',
                },
              ]}
            >
              <Sparkles size={11} color={Colors.greenSafe} strokeWidth={2.4} />
              <Text style={[styles.tierBadgeText, { color: Colors.greenSafe }]}>
                Thử điền sẵn
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Gentle Over-budget Warning */}
      {isOverBudget && (
        <View
          style={[
            styles.budgetWarningBox,
            {
              backgroundColor: isDark ? 'rgba(200, 109, 81, 0.16)' : 'rgba(200, 109, 81, 0.10)',
              borderColor: isDark ? 'rgba(200, 109, 81, 0.45)' : 'rgba(200, 109, 81, 0.35)',
            },
          ]}
        >
          <AlertTriangle size={13} color={Colors.redOver} strokeWidth={2.4} style={{ marginRight: 6 }} />
          <Text style={[styles.budgetWarningText, { color: isDark ? '#F5B09B' : Colors.redOver }]}>
            Vượt hạn mức hôm nay một chút (còn lại {formatVND(remainingToday)} đ)
          </Text>
        </View>
      )}

      {/* Suggested category and note info */}
      <View style={styles.metaRow}>
        <View style={[styles.chipCategory, { backgroundColor: isDark ? '#202B3B' : '#ECE5D6' }]}>
          <Tag size={12} color={tokens.primary} strokeWidth={2.2} style={{ marginRight: 4 }} />
          <Text style={[styles.chipCategoryText, { color: isDark ? '#D2DEEC' : '#495768' }]}>
            {payload.suggestedCategory === 'an_uong' ? 'Ăn uống & Cà phê' : 'Mua sắm'}
          </Text>
        </View>
        {payload.note ? (
          <Text
            style={[styles.noteText, { color: isDark ? '#8A99AC' : '#6F7E8F' }]}
            numberOfLines={1}
          >
            "{payload.note}"
          </Text>
        ) : null}
      </View>

      {/* Quick Bank Switcher Bar */}
      <View style={styles.payWithBankBar}>
        <Text style={[styles.payWithLabel, { color: isDark ? '#8A99AC' : '#6F7E8F' }]}>
          Trả bằng app:
        </Text>
        <TouchableOpacity
          style={[
            styles.bankPickerPill,
            {
              backgroundColor: isDark ? '#1C2736' : '#ECE5D6',
              borderColor: isDark ? '#2B3B4E' : '#D5CBBB',
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowBankPicker(!showBankPicker);
          }}
          activeOpacity={0.75}
        >
          <Text style={[styles.bankPickerPillText, { color: isDark ? '#FAF6EC' : '#141D26' }]}>
            {bankMeta.shortName}
          </Text>
          <ChevronDown size={13} color={isDark ? '#8A99AC' : '#5E6F82'} />
        </TouchableOpacity>
      </View>

      {/* Collapsible Bank Options List */}
      {showBankPicker && (
        <View style={styles.bankPickerDropdown}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bankListScroll}>
            {ORDERED_PAY_BANKS.map((bId) => {
              const bMeta = SUPPORTED_BANKS[bId];
              if (!bMeta) return null;
              const isSelected = bId === selectedBankId;
              const isBAutofill = isBankAutofillSupported(bId);

              return (
                <TouchableOpacity
                  key={bId}
                  style={[
                    styles.bankChip,
                    isSelected
                      ? { backgroundColor: tokens.primary, borderColor: tokens.primary }
                      : {
                          backgroundColor: isDark ? '#182230' : '#FFFFFF',
                          borderColor: isDark ? '#2C3A4D' : '#DCE2E8',
                        },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedBankId(bId);
                    setShowBankPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.bankChipText,
                      { color: isSelected ? '#000000' : isDark ? '#FAF6EC' : '#141D26' },
                    ]}
                  >
                    {bMeta.shortName}
                  </Text>
                  {isBAutofill && (
                    <View
                      style={[
                        styles.dotAutofill,
                        { backgroundColor: isSelected ? '#000000' : Colors.greenSafe },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* DUAL-ENGINE NOTICE BLOCK */}
      {isNoAutofill ? (
        <View
          style={[
            styles.noticeContainer,
            {
              backgroundColor: isDark ? 'rgba(200, 109, 81, 0.14)' : 'rgba(200, 109, 81, 0.08)',
              borderColor: isDark ? 'rgba(200, 109, 81, 0.40)' : 'rgba(200, 109, 81, 0.28)',
              flexDirection: 'column',
              alignItems: 'stretch',
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <AlertTriangle size={14} color={Colors.redOver} strokeWidth={2.2} style={{ marginRight: 6, marginTop: 1 }} />
            <Text style={[styles.noticeText, { color: isDark ? '#F5B09B' : Colors.redOver, flex: 1 }]}>
              {bankMeta.shortName} chưa hỗ trợ điền sẵn. Quét lại mã trong app ngân hàng hoặc chụp màn hình rồi tải lên.
            </Text>
          </View>
          {onOpenUploadReceipt && (
            <TouchableOpacity
              onPress={onOpenUploadReceipt}
              style={[
                styles.uploadReceiptShortcutBtn,
                {
                  backgroundColor: isDark ? 'rgba(229, 152, 68, 0.18)' : '#FAF1E3',
                  borderColor: isDark ? 'rgba(229, 152, 68, 0.4)' : '#E6D3B8',
                },
              ]}
              activeOpacity={0.8}
            >
              <ImagePlus size={13} color={tokens.primary} strokeWidth={2.2} />
              <Text style={[styles.uploadReceiptShortcutText, { color: tokens.primary }]}>
                Tải ảnh biên lai lên Kepi
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View
          style={[
            styles.noticeContainer,
            {
              backgroundColor: 'rgba(126, 159, 128, 0.12)',
              borderColor: 'rgba(126, 159, 128, 0.28)',
            },
          ]}
        >
          <Zap size={14} color={Colors.greenSafe} strokeWidth={2.4} style={{ marginRight: 6, marginTop: 1 }} />
          <Text style={[styles.noticeText, { color: isDark ? '#A9D1AA' : '#3E6641' }]}>
            Kepi sẽ gửi thông tin để thử điền sẵn vào {bankMeta.shortName}. Bạn luôn xác nhận chuyển trong app ngân hàng.
          </Text>
        </View>
      )}

      {/* Explicit Manual Copy Buttons (Only copied when user taps) */}
      <View style={styles.copyButtonsContainer}>
        {/* Copy Amount */}
        {currentAmountNum > 0 && (
          <TouchableOpacity
            style={[
              styles.copyPillBtn,
              { backgroundColor: isDark ? '#1C2736' : '#EFE8D9' },
            ]}
            onPress={handleCopyAmount}
            activeOpacity={0.7}
          >
            {copiedType === 'amount' ? (
              <>
                <Check size={12} color={Colors.greenSafe} strokeWidth={2.4} />
                <Text style={[styles.copyPillText, { color: Colors.greenSafe }]}>Đã chép số tiền</Text>
              </>
            ) : (
              <>
                <Copy size={12} color={tokens.primary} strokeWidth={2.2} />
                <Text style={[styles.copyPillText, { color: isDark ? '#D2DEEC' : '#334455' }]}>
                  Chép số tiền
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Copy Account */}
        {payload.accountRef ? (
          <TouchableOpacity
            style={[
              styles.copyPillBtn,
              { backgroundColor: isDark ? '#1C2736' : '#EFE8D9' },
            ]}
            onPress={handleCopyAccount}
            activeOpacity={0.7}
          >
            {copiedType === 'account' ? (
              <>
                <Check size={12} color={Colors.greenSafe} strokeWidth={2.4} />
                <Text style={[styles.copyPillText, { color: Colors.greenSafe }]}>Đã chép STK</Text>
              </>
            ) : (
              <>
                <Copy size={12} color={tokens.primary} strokeWidth={2.2} />
                <Text style={[styles.copyPillText, { color: isDark ? '#D2DEEC' : '#334455' }]}>
                  Chép STK
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Primary Action Button */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={[
            styles.payPrimaryBtn,
            { backgroundColor: tokens.primary },
          ]}
          onPress={handleOpenBankApp}
          activeOpacity={0.85}
        >
          <ExternalLink size={16} color="#000000" strokeWidth={2.4} />
          <Text style={styles.payPrimaryBtnText}>
            Mở {bankMeta.shortName}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tier 3: Self-pay button & Manual entry */}
      <View style={styles.subLinksRow}>
        <TouchableOpacity
          onPress={handleManualSelfPay}
          style={styles.subLinkItem}
          activeOpacity={0.7}
        >
          <Smartphone size={13} color={isDark ? '#A2B3C7' : '#5E6F82'} />
          <Text style={[styles.subLinkText, { color: isDark ? '#A2B3C7' : '#5E6F82' }]}>
            Tự mở app ngân hàng
          </Text>
        </TouchableOpacity>

        <Text style={[styles.subLinkDivider, { color: isDark ? '#405060' : '#CCD5DE' }]}>•</Text>

        <TouchableOpacity
          onPress={() => onManualRecord(currentAmountNum, payload.payeeName)}
          style={styles.subLinkItem}
          activeOpacity={0.7}
        >
          <PenLine size={12} color={isDark ? '#A2B3C7' : '#5E6F82'} />
          <Text style={[styles.subLinkText, { color: isDark ? '#A2B3C7' : '#5E6F82' }]}>
            Ghi tay vào sổ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  bankIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitles: {
    flex: 1,
  },
  payeeNameText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  bankSubText: {
    fontSize: 12,
    marginTop: 1,
  },
  dismissBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountDisplayBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  amountLeft: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  amountValueText: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  staticInputBlock: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  amountInputField: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    padding: 0,
    fontVariant: ['tabular-nums'],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  chipCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipCategoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  },
  payWithBankBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  payWithLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  bankPickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  bankPickerPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bankPickerDropdown: {
    marginBottom: 10,
  },
  bankListScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  bankChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  bankChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dotAutofill: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  budgetWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 8,
  },
  budgetWarningText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  copyButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  copyPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonsRow: {
    marginBottom: 8,
  },
  payPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    gap: 8,
  },
  payPrimaryBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    gap: 10,
  },
  subLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  subLinkText: {
    fontSize: 12,
    fontWeight: '500',
  },
  subLinkDivider: {
    fontSize: 12,
  },
  uploadReceiptShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  uploadReceiptShortcutText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
