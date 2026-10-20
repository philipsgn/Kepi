import React, { useState, useRef } from 'react';
import {
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Camera, ChevronRight, Sparkles, X, Clock, Tag } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Strings } from '../../constants/strings';
import { formatVND, maskMoney } from '../../utils/currency';
import { Transaction } from '../../types/database';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { Button } from '../common/Button';
import { getCategoryConfig } from '../../constants/categories';

interface DayDetailBottomSheetProps {
  visible: boolean;
  dateStr: string;
  transactions: Transaction[];
  isPrivacyHidden?: boolean;
  onClose: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onTakePhotoForDay: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 56, 340);
const CARD_SPACING = 14;

/**
 * Sheet Đáy Chi Tiết Khoảnh Khắc Ngày — Locket Photo Carousel
 * Thay thế hoàn toàn giao diện danh sách dòng cũ bằng trải nghiệm vuốt ngắm thẻ ảnh Locket lớn.
 */
export const DayDetailBottomSheet: React.FC<DayDetailBottomSheetProps> = ({
  visible,
  dateStr,
  transactions,
  isPrivacyHidden = false,
  onClose,
  onSelectTransaction,
  onTakePhotoForDay,
}) => {
  const { tokens, isDark } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const dayExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const formattedDateTitle = dateStr
    ? `Khoảnh khắc ngày ${dateStr.split('-').reverse().join('/')}`
    : 'Khoảnh khắc trong ngày';

  const formatTxTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh',
      }).format(d);
    } catch {
      return '';
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
    if (index !== activeIndex && index >= 0 && index < transactions.length) {
      setActiveIndex(index);
      Haptics.selectionAsync();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.sheetContainer,
                {
                  backgroundColor: tokens.surface,
                  borderColor: tokens.border,
                },
              ]}
            >
              {/* THANH KÉO TRÊN CÙNG */}
              <View style={[styles.dragPill, { backgroundColor: tokens.border }]} />

              {/* HEADER SHEET */}
              <View style={[styles.headerRow, { borderBottomColor: tokens.border }]}>
                <View style={styles.headerTitleCol}>
                  <Text style={[styles.headerTitleText, { color: tokens.text }]}>
                    {formattedDateTitle}
                  </Text>
                  <Text style={[styles.headerSubText, { color: tokens.textMuted }]}>
                    {Strings.home.dayTotalSpent(maskMoney(formatVND(dayExpense), isPrivacyHidden))} •{' '}
                    {transactions.length} khoảnh khắc
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtnBorderless}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Đóng"
                >
                  <X size={20} color={tokens.text} strokeWidth={2.6} />
                </TouchableOpacity>
              </View>

              {/* LOCKET PHOTO CAROUSEL / EMPTY STATE */}
              {transactions.length > 0 ? (
                <View style={styles.carouselSection}>
                  <ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled={false}
                    snapToInterval={CARD_WIDTH + CARD_SPACING}
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselContainer}
                    onMomentumScrollEnd={handleScroll}
                  >
                    {transactions.map((tx, idx) => {
                      const isIncome = tx.type === 'INCOME';
                      const photo = tx.photo_url || tx.thumbnail_url;
                      const displayAmount = maskMoney(formatVND(tx.amount), isPrivacyHidden);
                      const catConfig = getCategoryConfig(tx.category);
                      const CatIcon = catConfig.Icon;
                      const timeStr = formatTxTime(tx.created_at);

                      return (
                        <TouchableOpacity
                          key={tx.id}
                          activeOpacity={0.92}
                          onPress={() => onSelectTransaction(tx)}
                          style={[
                            styles.locketCard,
                            {
                              width: CARD_WIDTH,
                              backgroundColor: tokens.surfaceAlt,
                              borderColor: tokens.border,
                            },
                          ]}
                        >
                          {/* KHUNG ẢNH LOCKET */}
                          <View
                            style={[
                              styles.imageContainer,
                              {
                                backgroundColor: isDark ? '#141A20' : '#EDE8DC',
                                borderColor: tokens.border,
                              },
                            ]}
                          >
                            {photo ? (
                              <Image
                                source={{ uri: photo }}
                                style={styles.photoLarge}
                                contentFit="cover"
                                cachePolicy="disk"
                              />
                            ) : (
                              <View style={styles.fallbackPhotoBox}>
                                <View
                                  style={[
                                    styles.fallbackIconRing,
                                    { backgroundColor: isDark ? '#232D38' : '#FAF6EC' },
                                  ]}
                                >
                                  <CatIcon size={36} color={tokens.primary} strokeWidth={1.8} />
                                </View>
                                <Text style={[styles.fallbackCaption, { color: tokens.textMuted }]}>
                                  Khoảnh khắc không ảnh
                                </Text>
                              </View>
                            )}

                            {/* BADGE THỜI GIAN TRÊN GÓC ẢNH */}
                            <View style={styles.timeBadgeOverlay}>
                              <Clock size={11} color="#FFFFFF" strokeWidth={2.4} />
                              <Text style={styles.timeBadgeText}>{timeStr || 'Ghi chép'}</Text>
                            </View>

                            {/* BADGE LOẠI GIAO DỊCH */}
                            <View
                              style={[
                                styles.typeBadgeOverlay,
                                {
                                  backgroundColor: isIncome ? 'rgba(126, 159, 128, 0.85)' : 'rgba(200, 109, 81, 0.85)',
                                },
                              ]}
                            >
                              <Text style={styles.typeBadgeText}>
                                {isIncome ? 'Thu nhập' : 'Chi tiêu'}
                              </Text>
                            </View>
                          </View>

                          {/* THÔNG TIN CHI TIẾT TRÊN THẺ (SỐ TIỀN, MỤC, NOTE) */}
                          <View style={styles.cardInfoBody}>
                            {/* DÒNG SỐ TIỀN TO BẢN */}
                            <View style={styles.amountRow}>
                              <Text
                                style={[
                                  styles.amountValue,
                                  {
                                    color: isIncome ? tokens.success : tokens.text,
                                  },
                                ]}
                              >
                                {isIncome ? '+' : '-'}{displayAmount}
                              </Text>
                            </View>

                            {/* DÒNG DANH MỤC & TAG */}
                            <View style={styles.metaRow}>
                              <View
                                style={[
                                  styles.catPill,
                                  {
                                    backgroundColor: tokens.surface,
                                    borderColor: tokens.border,
                                  },
                                ]}
                              >
                                <CatIcon size={13} color={tokens.primary} strokeWidth={2.2} />
                                <Text style={[styles.catPillText, { color: tokens.text }]}>
                                  {catConfig.shortLabel || catConfig.label}
                                </Text>
                              </View>
                            </View>

                            {/* GHI CHÚ / NOTE */}
                            <View style={styles.noteBox}>
                              <Text
                                style={[
                                  styles.noteText,
                                  {
                                    color: tx.description ? tokens.text : tokens.textMuted,
                                    fontStyle: tx.description ? 'normal' : 'italic',
                                  },
                                ]}
                                numberOfLines={2}
                              >
                                {tx.description || 'Không có ghi chú thêm'}
                              </Text>
                            </View>

                            {/* CHỈ BÁO XEM CHI TIẾT */}
                            <View style={styles.tapHintRow}>
                              <Text style={[styles.tapHintText, { color: tokens.textMuted }]}>
                                Chạm để xem chi tiết
                              </Text>
                              <ChevronRight size={13} color={tokens.textMuted} strokeWidth={2.2} />
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* CHỈ BÁO TRANG (PAGINATION) NẾU CÓ NHIỀU HƠN 1 ẢNH */}
                  {transactions.length > 1 && (
                    <View style={styles.paginationRow}>
                      <View
                        style={[
                          styles.pageCounterPill,
                          {
                            backgroundColor: tokens.surfaceAlt,
                            borderColor: tokens.border,
                          },
                        ]}
                      >
                        <Text style={[styles.pageCounterText, { color: tokens.text }]}>
                          {activeIndex + 1} / {transactions.length}
                        </Text>
                      </View>
                      <View style={styles.dotsRow}>
                        {transactions.map((_, dotIdx) => (
                          <View
                            key={dotIdx}
                            style={[
                              styles.dotItem,
                              {
                                backgroundColor:
                                  dotIdx === activeIndex ? tokens.primary : tokens.border,
                                width: dotIdx === activeIndex ? 14 : 5,
                              },
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Sparkles size={32} color={tokens.primary} strokeWidth={1.8} />
                  <Text style={[styles.emptyTitle, { color: tokens.text }]}>
                    Ngày này chưa có khoảnh khắc
                  </Text>
                  <Text style={[styles.emptyText, { color: tokens.textMuted }]}>
                    Hãy chụp lại một món ăn, cốc cà phê hoặc chi tiêu để lưu giữ kỷ niệm.
                  </Text>
                </View>
              )}

              {/* NÚT CHỤP THÊM CHO NGÀY NÀY */}
              <View style={styles.bottomCtaRow}>
                <Button
                  title={Strings.home.takeMoreForDay}
                  variant="primary"
                  size="md"
                  fullWidth
                  icon={<Camera size={16} color="#1B2733" strokeWidth={2.4} />}
                  onPress={() => {
                    onClose();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onTakePhotoForDay();
                  }}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: '90%',
  },
  dragPill: {
    width: 38,
    height: 4.5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitleText: {
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSubText: {
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 3,
  },
  closeBtnBorderless: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  carouselSection: {
    paddingVertical: 14,
  },
  carouselContainer: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    gap: CARD_SPACING,
  },
  locketCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.15,
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
  },
  photoLarge: {
    width: '100%',
    height: '100%',
  },
  fallbackPhotoBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fallbackIconRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  fallbackCaption: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeBadgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  typeBadgeOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  cardInfoBody: {
    padding: 14,
    gap: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 14,
    borderWidth: 1,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  noteBox: {
    paddingVertical: 2,
  },
  noteText: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '500',
  },
  tapHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    paddingTop: 2,
  },
  tapHintText: {
    fontSize: 11,
    fontWeight: '500',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 12,
  },
  pageCounterPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  pageCounterText: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dotItem: {
    height: 5,
    borderRadius: 2.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomCtaRow: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
});
