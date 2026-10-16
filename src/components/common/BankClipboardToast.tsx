import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Camera, X, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { clipboardBankWatcher } from '../../services/clipboardBankWatcher';
import { ParsedBankNotification } from '../../utils/bankNotificationParser';
import { formatVND } from '../../utils/currency';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { FastCategorySheet } from '../cards/FastCategorySheet';

export interface BankClipboardToastProps {
  onSnapshot?: (detected: ParsedBankNotification) => void;
  onFastLog?: (detected: ParsedBankNotification) => void;
}

export const BankClipboardToast: React.FC<BankClipboardToastProps> = ({
  onSnapshot,
  onFastLog,
}) => {
  const insets = useSafeAreaInsets();
  const { tokens, isDark } = useTheme();
  const [detected, setDetected] = useState<ParsedBankNotification | null>(null);
  const [showInternalFastSheet, setShowInternalFastSheet] = useState(false);

  useEffect(() => {
    clipboardBankWatcher.init();
    const unsubscribe = clipboardBankWatcher.subscribe((parsed) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDetected(parsed);
    });
    return unsubscribe;
  }, []);

  if (!detected) return null;

  // Luồng 1: Bấm [📸 Chụp Locket]
  const handleSnapshotPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const event = detected;
    setDetected(null);
    if (onSnapshot) {
      onSnapshot(event);
    }
  };

  // Luồng 2: Bấm [⚡ Ghi Nhanh]
  const handleFastLogPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onFastLog) {
      const event = detected;
      setDetected(null);
      onFastLog(event);
    } else {
      setShowInternalFastSheet(true);
    }
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDetected(null);
  };

  const isExpense = detected.type === 'EXPENSE';
  const amountPrefix = isExpense ? '-' : '+';
  const amountColor = isExpense ? tokens.danger : tokens.success;

  return (
    <>
      <View
        style={[
          styles.container,
          {
            top: insets.top + 8,
            backgroundColor: isDark ? '#162231' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(229, 152, 68, 0.25)',
          },
        ]}
      >
        {/* THÔNG TIN NGÂN HÀNG & SỐ TIỀN */}
        <View style={styles.leftCol}>
          <View style={styles.iconWrapper}>
            <Bell size={20} color="#E59844" strokeWidth={2.6} />
          </View>

          <View style={styles.infoCol}>
            <View style={styles.titleRow}>
              <Text style={[styles.bankName, { color: tokens.text }]}>
                {detected.bankName}
              </Text>
              <Text style={[styles.amountText, { color: amountColor }]}>
                {amountPrefix}
                {formatVND(detected.amount)}
              </Text>
            </View>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.contentSub, { color: tokens.textMuted }]}
            >
              {detected.isGenericContent
                ? 'Phát hiện biến động số dư vừa sao chép'
                : (detected.content || 'Phát hiện biến động số dư vừa sao chép')}
            </Text>
          </View>
        </View>

        {/* 2 NÚT HÀNH ĐỘNG VƯỢT BẬC */}
        <View style={styles.rightActions}>
          {/* Nút 1: Chụp Locket */}
          <TouchableOpacity
            style={[styles.snapshotBtn, { backgroundColor: '#E59844' }]}
            onPress={handleSnapshotPress}
            activeOpacity={0.82}
          >
            <Camera size={13} color="#0E1620" strokeWidth={2.8} />
            <Text style={styles.snapshotBtnText}>Chụp</Text>
          </TouchableOpacity>

          {/* Nút 2: Ghi Nhanh */}
          <TouchableOpacity
            style={[
              styles.fastLogBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              },
            ]}
            onPress={handleFastLogPress}
            activeOpacity={0.82}
          >
            <Zap size={13} color={tokens.primary} strokeWidth={2.8} />
            <Text style={[styles.fastLogBtnText, { color: tokens.text }]}>Nhanh</Text>
          </TouchableOpacity>

          {/* Nút Đóng */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleDismiss}
            hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
          >
            <X size={16} color={tokens.textMuted} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </View>

      {/* INTERNAL FALLBACK FAST CATEGORY SHEET NẾU KHÔNG CÓ CALLBACK NGOÀI */}
      {showInternalFastSheet && (
        <FastCategorySheet
          visible={showInternalFastSheet}
          bankEvent={detected}
          onClose={() => {
            setShowInternalFastSheet(false);
            setDetected(null);
          }}
          onSuccess={() => {
            setShowInternalFastSheet(false);
            setDetected(null);
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 99999,
    borderRadius: radii.xl,
    borderWidth: 1.2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 10,
  },
  leftCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  iconWrapper: {
    marginRight: 8,
  },
  infoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bankName: {
    fontSize: 13,
    fontWeight: '700',
  },
  amountText: {
    fontSize: 13.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  contentSub: {
    fontSize: 11,
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  snapshotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radii.full,
    shadowColor: '#E59844',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  snapshotBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0E1620',
  },
  fastLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    paddingHorizontal: 8,
    paddingVertical: 5.5,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  fastLogBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 3,
    marginLeft: 2,
  },
});
