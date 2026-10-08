import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Bell,
  CheckCircle2,
  Compass,
  Moon,
  Sparkles,
  Sun,
  Wind,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ThemeMode, radii, spacing } from '../../theme/tokens';
import {
  Button,
  Card,
  Chip,
  EmptyState,
  GroupedList,
  GroupedRow,
  PriceTag,
  ProgressBar,
  SegmentedControl,
} from '../common';

export interface ComponentGalleryModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ComponentGalleryModal: React.FC<ComponentGalleryModalProps> = ({
  visible,
  onClose,
}) => {
  const { tokens, themeMode, setThemeMode, isDark } = useTheme();
  const [segmentedIdx, setSegmentedIdx] = useState(0);
  const [selectedChip, setSelectedChip] = useState('an-uong');
  const [toggleState, setToggleState] = useState(true);

  const themeSegments = [
    { key: 'light', label: 'Sáng', icon: <Sun size={14} color={tokens.text} /> },
    { key: 'dark', label: 'Tối', icon: <Moon size={14} color={tokens.text} /> },
    { key: 'cool', label: 'Mát', icon: <Wind size={14} color={tokens.text} /> },
  ];

  const currentThemeIdx =
    themeMode === 'light' ? 0 : themeMode === 'dark' ? 1 : 2;

  const handleThemeChange = (idx: number) => {
    const modes: ThemeMode[] = ['light', 'dark', 'cool'];
    setThemeMode(modes[idx]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor: tokens.background,
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: tokens.border }]}>
          <View>
            <Text style={[styles.headerTitle, { color: tokens.text }]}>
              Thư viện Linh kiện (Design System)
            </Text>
            <Text style={[styles.headerSubtitle, { color: tokens.textMuted }]}>
              {isDark ? 'Chế độ Tối (Dark Slate)' : 'Chế độ Sáng (Warm Cream)'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: tokens.surfaceAlt }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color={tokens.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Theme Switcher */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              1. CHUYỂN ĐỔI CHẾ ĐỘ MÀU (INSTANT TOGGLE)
            </Text>
            <SegmentedControl
              items={themeSegments}
              selectedIndex={currentThemeIdx}
              onChange={(idx) => handleThemeChange(idx)}
            />
          </View>

          {/* 2. Cards */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              2. CARD CONTAINER (20PX RADIUS, 1PX BORDER)
            </Text>
            <Card style={styles.sampleCard}>
              <Text style={[styles.cardTitle, { color: tokens.text }]}>
                Thẻ Bề Mặt Chuẩn (Surface Card)
              </Text>
              <Text style={[styles.cardSubtext, { color: tokens.textMuted }]}>
                Bề mặt ấm, viền hairline 1px tinh tế, không bóng đổ gắt.
              </Text>
            </Card>

            <Card variant="alt" style={styles.sampleCard}>
              <Text style={[styles.cardTitle, { color: tokens.text }]}>
                Thẻ Phụ (Surface Alt)
              </Text>
              <Text style={[styles.cardSubtext, { color: tokens.textMuted }]}>
                Dành cho các khối thông tin nhóm, phân cách nhẹ nhàng.
              </Text>
            </Card>
          </View>

          {/* 3. Buttons */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              3. BUTTONS (PRIMARY GOLD, SECONDARY, GHOST, DANGER)
            </Text>
            <View style={styles.buttonCol}>
              <Button
                variant="primary"
                onPress={() => {}}
                icon={<CheckCircle2 size={18} color="#1B2733" />}
              >
                Nút Chính Vàng Nắng (Primary)
              </Button>
              <Button variant="secondary" onPress={() => {}}>
                Nút Phụ Viền Mảnh (Secondary)
              </Button>
              <Button variant="ghost" onPress={() => {}}>
                Nút Trong Suốt (Ghost)
              </Button>
              <Button variant="danger" onPress={() => {}}>
                Nút Cảnh Báo / Xoá (Danger)
              </Button>
            </View>
          </View>

          {/* 4. Chips */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              4. CHIPS / PILLS (PILL 999PX, BORDERLINE)
            </Text>
            <View style={styles.chipRow}>
              <Chip
                label="Ăn uống & Cà phê"
                selected={selectedChip === 'an-uong'}
                onPress={() => setSelectedChip('an-uong')}
                statusDotColor={tokens.primary}
              />
              <Chip
                label="Mua sắm"
                selected={selectedChip === 'mua-sam'}
                onPress={() => setSelectedChip('mua-sam')}
              />
              <Chip
                label="Cố định"
                selected={selectedChip === 'co-dinh'}
                onPress={() => setSelectedChip('co-dinh')}
                badgeCount={3}
              />
            </View>
          </View>

          {/* 5. Progress Bars */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              5. PROGRESS BAR (8PX PILL, ANIMATED SPRING)
            </Text>
            <View style={styles.progressItem}>
              <View style={styles.progressLabelRow}>
                <Text style={[styles.progressLabel, { color: tokens.text }]}>
                  Hạn mức ngày: 45% (An toàn)
                </Text>
                <Text style={[styles.progressValue, { color: tokens.textMuted }]}>
                  135.000 / 300.000đ
                </Text>
              </View>
              <ProgressBar progress={0.45} />
            </View>

            <View style={styles.progressItem}>
              <View style={styles.progressLabelRow}>
                <Text style={[styles.progressLabel, { color: tokens.danger }]}>
                  Vượt hạn mức: 112% (Cảnh báo)
                </Text>
                <Text style={[styles.progressValue, { color: tokens.danger }]}>
                  336.000 / 300.000đ
                </Text>
              </View>
              <ProgressBar progress={1.12} />
            </View>
          </View>

          {/* 6. Price Tags */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              6. PRICE TAGS (TRANSLUCENT PILL, TABULAR NUMS)
            </Text>
            <View style={styles.priceRow}>
              <PriceTag amount={45000} variant="dark" />
              <PriceTag amount={120000} variant="accent" />
              <PriceTag amount={500000} variant="green" />
              <PriceTag amount={25000} variant="surface" />
            </View>
          </View>

          {/* 7. Segmented Control */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              7. SEGMENTED CONTROL (SPRING ANIMATION)
            </Text>
            <SegmentedControl
              items={['Hôm nay', 'Tuần này', 'Tháng này']}
              selectedIndex={segmentedIdx}
              onChange={(idx) => setSegmentedIdx(idx)}
            />
          </View>

          {/* 8. Grouped List & Rows */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              8. GROUPED LIST & INSET ROWS (PROFILE / SETTINGS STYLE)
            </Text>
            <GroupedList
              header="Cài đặt thông báo & dữ liệu"
              footer="Dữ liệu đồng bộ an toàn trên thiết bị của bạn."
            >
              <GroupedRow
                title="Thông báo chi tiêu"
                subtitle="Nhắc nhở lúc 20:00 mỗi tối"
                icon={<Bell size={18} color={tokens.primary} />}
                rightElement={
                  <Switch
                    value={toggleState}
                    onValueChange={setToggleState}
                    trackColor={{ false: tokens.border, true: tokens.primary }}
                    thumbColor="#FFFFFF"
                  />
                }
                showDivider
              />
              <GroupedRow
                title="Quản lý chi phí cố định"
                subtitle="3 khoản đang hoạt động"
                icon={<Compass size={18} color={tokens.success} />}
                showChevron
                onPress={() => {}}
                showDivider
              />
              <GroupedRow
                title="Xoá toàn bộ dữ liệu mẫu"
                isDestructive
                onPress={() => {}}
              />
            </GroupedList>
          </View>

          {/* 9. Empty State */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              9. EMPTY STATE (POETIC & MINIMAL)
            </Text>
            <Card>
              <EmptyState
                icon={<Sparkles size={24} color={tokens.primary} />}
                title="Chưa có món chi nào hôm nay"
                description="Hà Nội se lạnh, bạn đã ghé quán cà phê quen chưa?"
                actionLabel="Ghi nhanh ngay"
                onAction={() => {}}
              />
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  section: {
    marginBottom: spacing.lg + 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  sampleCard: {
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 13,
    lineHeight: 18,
  },
  buttonCol: {
    gap: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  progressItem: {
    marginBottom: spacing.sm + 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  priceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});
