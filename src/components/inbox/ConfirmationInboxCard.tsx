import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Check,
  Clock,
  Edit3,
  QrCode,
  Receipt,
  Tag,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { formatVND } from '../../utils/currency';
import { ConfirmationInboxItem } from '../../hooks/useConfirmationInbox';

interface ConfirmationInboxCardProps {
  item: ConfirmationInboxItem;
  onConfirm: (item: ConfirmationInboxItem, overrides?: { amount?: number; category?: string; note?: string }) => void;
  onDismiss: (item: ConfirmationInboxItem) => void;
}

const CATEGORY_OPTIONS = [
  'Ăn uống',
  'Cà phê',
  'Mua sắm',
  'Di chuyển',
  'Gia đình',
  'Khác',
];

function getRelativeTimeStr(isoString: string): string {
  try {
    const elapsedMs = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(elapsedMs / (60 * 1000));
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 24);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Hôm qua';
    return `${days} ngày trước`;
  } catch {
    return 'Gần đây';
  }
}

export const ConfirmationInboxCard: React.FC<ConfirmationInboxCardProps> = ({
  item,
  onConfirm,
  onDismiss,
}) => {
  const { isDark } = useTheme();
  const privacyMode = useAuthStore((state) => state.profile?.privacy_mode);

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedAmountStr, setEditedAmountStr] = useState(item.amount.toString());
  const [editedCategory, setEditedCategory] = useState(item.category);
  const [editedNote, setEditedNote] = useState(item.description || item.title);

  const relativeTime = getRelativeTimeStr(item.createdAt);

  const getSourceIcon = () => {
    switch (item.source) {
      case 'QR':
        return <QrCode size={13} color={Colors.primaryYellow} strokeWidth={2.4} />;
      case 'WAIT':
        return <Clock size={13} color={Colors.accentOrange} strokeWidth={2.4} />;
      case 'SCREENSHOT':
        return <Receipt size={13} color={Colors.greenSafe} strokeWidth={2.4} />;
      default:
        return <Tag size={13} color={Colors.primaryYellow} strokeWidth={2.4} />;
    }
  };

  const getSourceLabel = () => {
    switch (item.source) {
      case 'QR':
        return 'Quét mã VietQR';
      case 'WAIT':
        return 'Giỏ chờ 24h';
      case 'SCREENSHOT':
        return 'Biên lai chuyển khoản';
      default:
        return 'Chi tiêu';
    }
  };

  const handlePressSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const parsedAmount = parseInt(editedAmountStr.replace(/\D/g, ''), 10);
    const validAmount = !isNaN(parsedAmount) && parsedAmount > 0 ? parsedAmount : item.amount;

    onConfirm(item, {
      amount: validAmount,
      category: editedCategory,
      note: editedNote,
    });
  };

  const handlePressDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onDismiss(item);
  };

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: isDark ? '#141D2A' : '#FFFFFF',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(22, 34, 49, 0.08)',
        },
      ]}
    >
      {/* CARD HEADER: SOURCE BADGE & RELATIVE TIME */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.sourceBadge,
            {
              backgroundColor: isDark ? 'rgba(229, 152, 68, 0.15)' : 'rgba(229, 152, 68, 0.12)',
            },
          ]}
        >
          {getSourceIcon()}
          <Text style={styles.sourceBadgeText}>{getSourceLabel()}</Text>
        </View>

        {item.isOverdue && (
          <View
            style={[
              styles.overdueBadge,
              {
                backgroundColor: isDark ? 'rgba(200, 109, 81, 0.18)' : '#FDF0EC',
                borderColor: 'rgba(200, 109, 81, 0.35)',
              },
            ]}
          >
            <Text style={[styles.overdueBadgeText, { color: isDark ? '#F5B09E' : '#C86D51' }]}>
              Chưa xác nhận (&gt;24h)
            </Text>
          </View>
        )}

        <View style={styles.headerRight}>
          <Text style={[styles.timeText, { color: isDark ? '#7E91A4' : '#8A99A8' }]}>
            {relativeTime}
          </Text>
          <TouchableOpacity
            style={styles.editToggleBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setIsEditing(!isEditing);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Edit3
              size={14}
              color={isEditing ? Colors.primaryYellow : isDark ? '#8C9DAC' : '#65778B'}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* CARD BODY: THUMBNAIL (IF ANY) + INFO */}
      <View style={styles.bodyRow}>
        {item.photoUrl && (
          <Image
            source={{ uri: item.photoUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
            blurRadius={privacyMode ? 14 : 0}
          />
        )}

        <View style={styles.infoCol}>
          <Text
            style={[styles.itemTitle, { color: isDark ? '#FAF6EC' : '#141D26' }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          {!isEditing ? (
            <Text style={styles.amountDisplay}>
              {formatVND(item.amount)}
            </Text>
          ) : (
            <View style={styles.amountInputRow}>
              <TextInput
                style={[
                  styles.amountInput,
                  {
                    color: isDark ? '#FAF6EC' : '#141D26',
                    borderColor: isDark ? 'rgba(229, 152, 68, 0.5)' : Colors.primaryYellow,
                    backgroundColor: isDark ? '#0F1621' : '#F5EFEB',
                  },
                ]}
                keyboardType="numeric"
                value={editedAmountStr}
                onChangeText={(t) => setEditedAmountStr(t.replace(/\D/g, ''))}
                placeholder="Nhập số tiền"
                placeholderTextColor={isDark ? '#5A6E82' : '#9EAEBD'}
              />
              <Text style={[styles.currencySuffix, { color: isDark ? '#8C9DAC' : '#65778B' }]}>
                đ
              </Text>
            </View>
          )}

          {/* Category Chip */}
          {!isEditing ? (
            <View style={styles.categoryRow}>
              <View
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F0EBE1',
                  },
                ]}
              >
                <Tag size={11} color={isDark ? '#CBD5E1' : '#576574'} strokeWidth={2} />
                <Text style={[styles.categoryPillText, { color: isDark ? '#CBD5E1' : '#576574' }]}>
                  {item.category}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>

      {/* EXPANDED INLINE EDIT SECTION */}
      {isEditing && (
        <View
          style={[
            styles.editSection,
            {
              borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            },
          ]}
        >
          <Text style={[styles.editLabel, { color: isDark ? '#8C9DAC' : '#65778B' }]}>
            Chọn danh mục:
          </Text>
          <View style={styles.chipGrid}>
            {CATEGORY_OPTIONS.map((cat) => {
              const isSelected = editedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setEditedCategory(cat);
                  }}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: isSelected
                        ? Colors.primaryYellow
                        : isDark
                        ? '#0F1621'
                        : '#EFEAE1',
                      borderColor: isSelected
                        ? Colors.primaryYellow
                        : isDark
                        ? 'rgba(255, 255, 255, 0.12)'
                        : 'rgba(0, 0, 0, 0.08)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      {
                        color: isSelected ? '#FFFFFF' : isDark ? '#FAF6EC' : '#141D26',
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.editLabel, { color: isDark ? '#8C9DAC' : '#65778B', marginTop: 10 }]}>
            Ghi chú / Nơi nhận:
          </Text>
          <TextInput
            style={[
              styles.noteInput,
              {
                color: isDark ? '#FAF6EC' : '#141D26',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                backgroundColor: isDark ? '#0F1621' : '#F5EFEB',
              },
            ]}
            value={editedNote}
            onChangeText={setEditedNote}
            placeholder="Ghi chú món đồ..."
            placeholderTextColor={isDark ? '#5A6E82' : '#9EAEBD'}
          />
        </View>
      )}

      {/* ACTION BUTTONS (LƯU & BỎ) */}
      <View
        style={[
          styles.actionRow,
          {
            borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          },
        ]}
      >
        {/* NÚT BỎ QUA */}
        <TouchableOpacity
          style={[
            styles.dismissBtn,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2EDE4',
            },
          ]}
          onPress={handlePressDismiss}
          activeOpacity={0.8}
        >
          <X size={15} color={isDark ? '#8C9DAC' : '#65778B'} strokeWidth={2.4} />
          <Text style={[styles.dismissBtnText, { color: isDark ? '#8C9DAC' : '#65778B' }]}>
            Bỏ qua
          </Text>
        </TouchableOpacity>

        {/* NÚT LƯU VÀO SỔ */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            {
              backgroundColor: Colors.primaryYellow,
            },
          ]}
          onPress={handlePressSave}
          activeOpacity={0.85}
        >
          <Check size={16} color="#FFFFFF" strokeWidth={2.8} />
          <Text style={styles.saveBtnText}>Lưu vào sổ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 5,
  },
  sourceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primaryYellow,
  },
  overdueBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 6,
  },
  overdueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  editToggleBtn: {
    padding: 2,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  infoCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  amountDisplay: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.accentOrange,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  currencySuffix: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '500',
  },
  editSection: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
  },
  editLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 11,
  },
  noteInput: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  dismissBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  dismissBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: Colors.primaryYellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
