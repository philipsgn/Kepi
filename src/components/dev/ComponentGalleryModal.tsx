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
  Camera,
  CheckCircle2,
  Coffee,
  Compass,
  Moon,
  Receipt,
  ShieldCheck,
  Sparkles,
  Store,
  Sun,
  Target,
  Wind,
  X,
  Zap,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ThemeMode, radii, spacing } from '../../theme/tokens';
import {
  Block,
  BlockButton,
  BlockChip,
  Button,
  Card,
  Chip,
  DiscreteHealthBar,
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
    { key: 'light', label: 'Vàng Kem Bơ', icon: <Sun size={18} strokeWidth={2.6} color={tokens.text} /> },
    { key: 'dark', label: 'Dark Mint', icon: <Moon size={18} strokeWidth={2.6} color={tokens.text} /> },
    { key: 'cool', label: 'Fresh Mint', icon: <Wind size={18} strokeWidth={2.6} color={tokens.text} /> },
  ];

  const currentThemeIdx =
    themeMode === 'light' ? 0 : themeMode === 'dark' ? 1 : 2;

  const handleThemeChange = (idx: number) => {
    const modes: ThemeMode[] = ['light', 'dark', 'cool'];
    setThemeMode(modes[idx]);
  };

  const getThemeTitle = () => {
    switch (themeMode) {
      case 'light':
        return 'Theme 1: Vàng Kem Bơ (Hà Nội Thu Đông)';
      case 'dark':
        return 'Theme 2: Dark Mint (Xám Than & Mint Đậm)';
      case 'cool':
      default:
        return 'Theme 3: Fresh Blue-Mint (Bạc Hà Sương Mai)';
    }
  };

  const getThemeSubtitle = () => {
    switch (themeMode) {
      case 'light':
        return '#FAF6EC · #E59844 · #7E9F80 · #C86D51 (WCAG 2.1 AAA/AA)';
      case 'dark':
        return '#0E1620 · #2DD4BF · #94A3B8 · #F8FAFC (WCAG 2.1 AAA/AA)';
      case 'cool':
      default:
        return '#F0FDF4 · #059669 · #38BDF8 · #064E3B (WCAG 2.1 AAA/AA)';
    }
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
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.headerTitle, { color: tokens.text }]}>
              Thư viện Linh kiện (Design System)
            </Text>
            <Text style={[styles.headerSubtitle, { color: tokens.textMuted }]}>
              {getThemeTitle()}
            </Text>
            <Text style={[styles.headerBadge, { color: tokens.primary }]}>
              {getThemeSubtitle()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={20} color={tokens.text} strokeWidth={2.6} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Theme Switcher */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              1. CHUYỂN ĐỔI CHẾ ĐỘ MÀU (3 THEMES ĐỘC LẬP)
            </Text>
            <SegmentedControl
              items={themeSegments}
              selectedIndex={currentThemeIdx}
              onChange={(idx) => handleThemeChange(idx)}
            />
          </View>

          {/* 2. Color Palette & WCAG Compliance */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              2. BẢNG MÀU & ĐỘ TƯƠNG PHẢN WCAG 2.1 AA/AAA
            </Text>
            <Card style={styles.paletteCard}>
              <View style={styles.paletteRow}>
                <View style={[styles.swatch, { backgroundColor: tokens.bg, borderColor: tokens.border }]}>
                  <Text style={[styles.swatchLabel, { color: tokens.text }]}>Nền</Text>
                  <Text style={[styles.swatchHex, { color: tokens.textMuted }]}>{tokens.bg}</Text>
                </View>
                <View style={[styles.swatch, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
                  <Text style={[styles.swatchLabel, { color: tokens.text }]}>Thẻ</Text>
                  <Text style={[styles.swatchHex, { color: tokens.textMuted }]}>{tokens.surface}</Text>
                </View>
                <View style={[styles.swatch, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
                  <Text style={[styles.swatchLabel, { color: tokens.text }]}>Phụ</Text>
                  <Text style={[styles.swatchHex, { color: tokens.textMuted }]}>{tokens.surfaceAlt}</Text>
                </View>
                <View style={[styles.swatch, { backgroundColor: tokens.primary }]}>
                  <Text style={[styles.swatchLabel, { color: tokens.textOnPrimary }]}>Chính</Text>
                  <Text style={[styles.swatchHex, { color: tokens.textOnPrimary }]}>{tokens.primary}</Text>
                </View>
              </View>

              <View style={[styles.paletteRow, { marginTop: 8 }]}>
                <View style={[styles.swatch, { backgroundColor: tokens.text }]}>
                  <Text style={[styles.swatchLabel, { color: tokens.bg }]}>Chữ chính</Text>
                  <Text style={[styles.swatchHex, { color: tokens.bg }]}>{tokens.text}</Text>
                </View>
                <View style={[styles.swatch, { backgroundColor: tokens.textSub }]}>
                  <Text style={[styles.swatchLabel, { color: '#FFFFFF' }]}>Chữ phụ</Text>
                  <Text style={[styles.swatchHex, { color: '#FFFFFF' }]}>{tokens.textSub}</Text>
                </View>
                <View style={[styles.swatch, { backgroundColor: tokens.success }]}>
                  <Text style={[styles.swatchLabel, { color: '#FFFFFF' }]}>An toàn</Text>
                  <Text style={[styles.swatchHex, { color: '#FFFFFF' }]}>{tokens.success}</Text>
                </View>
                <View style={[styles.swatch, { backgroundColor: tokens.danger }]}>
                  <Text style={[styles.swatchLabel, { color: '#FFFFFF' }]}>Cảnh báo</Text>
                  <Text style={[styles.swatchHex, { color: '#FFFFFF' }]}>{tokens.danger}</Text>
                </View>
              </View>

              <View style={[styles.complianceBadgeRow, { borderTopColor: tokens.border }]}>
                <ShieldCheck size={16} color={tokens.success} strokeWidth={2.6} />
                <Text style={[styles.complianceText, { color: tokens.text }]}>
                  100% Cặp chữ/nền đạt chuẩn WCAG 2.1 AA (Tỷ lệ tương phản ≥ 4.5:1)
                </Text>
              </View>
            </Card>
          </View>

          {/* 3. Cards Preview */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              3. CARDS PREVIEW (SURFACE, ALT, PRIMARY SOFT, GLOW & BLOCK)
            </Text>
            <Card style={styles.sampleCard}>
              <Text style={[styles.cardTitle, { color: tokens.text }]}>
                Thẻ Bề Mặt Chuẩn (Surface Card)
              </Text>
              <Text style={[styles.cardSubtext, { color: tokens.textMuted }]}>
                Bề mặt ấm phẳng, viền hairline 1px tinh tế, không bóng đổ gắt.
              </Text>
            </Card>

            <Card variant="alt" style={styles.sampleCard}>
              <Text style={[styles.cardTitle, { color: tokens.text }]}>
                Thẻ Bề Mặt Phụ (Surface Alt)
              </Text>
              <Text style={[styles.cardSubtext, { color: tokens.textMuted }]}>
                Dành cho các khối thông tin nhóm, phân cách mềm mại.
              </Text>
            </Card>

            <Card variant="primarySoft" glow style={styles.sampleCard}>
              <Text style={[styles.cardTitle, { color: tokens.text }]}>
                Thẻ Nhấn Rực Rỡ & Viền Phát Sáng (Glow Card)
              </Text>
              <Text style={[styles.cardSubtext, { color: tokens.textSub }]}>
                Sử dụng dải màu nhấn primarySoft và bóng phát sáng ánh kim rực rỡ.
              </Text>
            </Card>

            <Block style={styles.sampleCard}>
              <Text style={[styles.cardTitle, { color: tokens.text }]}>
                Khối Tactile Block (Bo góc 20px)
              </Text>
              <Text style={[styles.cardSubtext, { color: tokens.textMuted }]}>
                Phong cách khối hộp hiện đại, viền sắc nét, tương thích 100%.
              </Text>
            </Block>
          </View>

          {/* 4. Buttons Preview */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              4. BUTTONS PREVIEW (PRIMARY GRADIENT, SECONDARY, GHOST, DANGER, BLOCK)
            </Text>
            <View style={styles.buttonCol}>
              <Button
                variant="primary"
                onPress={() => {}}
                icon={<CheckCircle2 size={18} color={tokens.textOnPrimary} strokeWidth={2.6} />}
              >
                {themeMode === 'light'
                  ? 'Nút Chính Vàng Nắng Thu (Primary)'
                  : themeMode === 'dark'
                  ? 'Nút Chính Dark Mint (Primary)'
                  : 'Nút Chính Fresh Blue-Mint (Primary)'}
              </Button>

              <Button
                variant="secondary"
                onPress={() => {}}
                icon={<Sparkles size={18} color={tokens.text} strokeWidth={2.6} />}
              >
                Nút Phụ Viền Mảnh (Secondary)
              </Button>

              <Button variant="ghost" onPress={() => {}}>
                Nút Trong Suốt (Ghost Button)
              </Button>

              <Button
                variant="danger"
                onPress={() => {}}
                icon={<X size={18} color={tokens.danger} strokeWidth={2.6} />}
              >
                Nút Cảnh Báo / Xóa (Danger)
              </Button>

              <BlockButton
                label="Nút Khối Tactile (BlockButton)"
                onPress={() => {}}
                variant="primary"
              />
            </View>
          </View>

          {/* 5. Chips Preview */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              5. CHIPS / PILLS PREVIEW (PILL 999PX & BLOCKCHIP)
            </Text>
            <View style={styles.chipRow}>
              <Chip
                label="Ăn uống"
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
              <Chip
                label="An toàn"
                selected={selectedChip === 'an-toan'}
                onPress={() => setSelectedChip('an-toan')}
                statusDotColor={tokens.success}
              />
              <BlockChip
                label="BlockChip Tactile"
                selected={selectedChip === 'block-chip'}
                onPress={() => setSelectedChip('block-chip')}
              />
            </View>
          </View>

          {/* 6. Pure Floating Bold Vector Icons Showcase */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              6. VECTOR ICONS NỔI TRẦN (100% BOXLESS, STROKEWIDTH 2.4 - 2.8)
            </Text>
            <Card style={styles.iconsShowcaseCard}>
              <Text style={[styles.iconShowcaseDesc, { color: tokens.textSub }]}>
                Toàn bộ icons nổi trần tự nhiên (Zero Border & Boxless), in đậm nét strokeWidth 2.6:
              </Text>
              <View style={styles.floatingIconsGrid}>
                <View style={styles.iconShowcaseItem}>
                  <Camera size={22} color={tokens.primary} strokeWidth={2.6} />
                  <Text style={[styles.iconItemLabel, { color: tokens.textMuted }]}>Camera</Text>
                </View>
                <View style={styles.iconShowcaseItem}>
                  <Sparkles size={22} color={tokens.primary} strokeWidth={2.6} />
                  <Text style={[styles.iconItemLabel, { color: tokens.textMuted }]}>Sparkles</Text>
                </View>
                <View style={styles.iconShowcaseItem}>
                  <Receipt size={22} color={tokens.accent} strokeWidth={2.6} />
                  <Text style={[styles.iconItemLabel, { color: tokens.textMuted }]}>Biên lai</Text>
                </View>
                <View style={styles.iconShowcaseItem}>
                  <Store size={22} color={tokens.primary} strokeWidth={2.6} />
                  <Text style={[styles.iconItemLabel, { color: tokens.textMuted }]}>VietQR</Text>
                </View>
                <View style={styles.iconShowcaseItem}>
                  <ShieldCheck size={22} color={tokens.success} strokeWidth={2.6} />
                  <Text style={[styles.iconItemLabel, { color: tokens.textMuted }]}>Bảo mật</Text>
                </View>
                <View style={styles.iconShowcaseItem}>
                  <Coffee size={22} color={tokens.primary} strokeWidth={2.6} />
                  <Text style={[styles.iconItemLabel, { color: tokens.textMuted }]}>Cà phê</Text>
                </View>
                <View style={styles.iconShowcaseItem}>
                  <Target size={22} color={tokens.primary} strokeWidth={2.6} />
                  <Text style={[styles.iconItemLabel, { color: tokens.textMuted }]}>Mục tiêu</Text>
                </View>
                <View style={styles.iconShowcaseItem}>
                  <Zap size={22} color={tokens.warning} strokeWidth={2.6} />
                  <Text style={[styles.iconItemLabel, { color: tokens.textMuted }]}>Tốc độ</Text>
                </View>
              </View>
            </Card>
          </View>

          {/* 7. Progress & Health Bars */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              7. THANH TIẾN ĐỘ & SINH LỰC HP BAR
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

            <View style={[styles.progressItem, { marginTop: 4 }]}>
              <Text style={[styles.progressLabel, { color: tokens.text, marginBottom: 8 }]}>
                Sinh lực ví (Discrete Health Bar):
              </Text>
              <DiscreteHealthBar spent={25} totalBudget={100} />
            </View>
          </View>

          {/* 8. Price Tags */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              8. PRICE TAGS (TRANSLUCENT PILL, TABULAR NUMS)
            </Text>
            <View style={styles.priceRow}>
              <PriceTag amount={45000} variant="dark" />
              <PriceTag amount={120000} variant="accent" />
              <PriceTag amount={500000} variant="green" />
              <PriceTag amount={25000} variant="surface" />
            </View>
          </View>

          {/* 9. Segmented Control */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              9. SEGMENTED CONTROL (SPRING ANIMATION)
            </Text>
            <SegmentedControl
              items={['Hôm nay', 'Tuần này', 'Tháng này']}
              selectedIndex={segmentedIdx}
              onChange={(idx) => setSegmentedIdx(idx)}
            />
          </View>

          {/* 10. Grouped List & Rows */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              10. GROUPED LIST & INSET ROWS (PROFILE / SETTINGS STYLE)
            </Text>
            <GroupedList
              header="Cài đặt thông báo & dữ liệu"
              footer="Dữ liệu đồng bộ an toàn trên thiết bị của bạn."
            >
              <GroupedRow
                title="Thông báo chi tiêu"
                subtitle="Nhắc nhở lúc 20:00 mỗi tối"
                icon={<Bell size={20} color={tokens.primary} strokeWidth={2.6} />}
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
                icon={<Compass size={20} color={tokens.success} strokeWidth={2.6} />}
                showChevron
                onPress={() => {}}
                showDivider
              />
              <GroupedRow
                title="Xóa toàn bộ dữ liệu mẫu"
                isDestructive
                onPress={() => {}}
              />
            </GroupedList>
          </View>

          {/* 11. Empty State */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
              11. EMPTY STATE (POETIC & MINIMAL)
            </Text>
            <Card>
              <EmptyState
                icon={<Sparkles size={24} color={tokens.primary} strokeWidth={2.6} />}
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
    fontWeight: '600',
    marginTop: 2,
  },
  headerBadge: {
    fontSize: 10.5,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
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
  paletteCard: {
    padding: spacing.sm + 4,
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 6,
  },
  swatch: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  swatchHex: {
    fontSize: 8.5,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  complianceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  complianceText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
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
  iconsShowcaseCard: {
    padding: spacing.md,
  },
  iconShowcaseDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  floatingIconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  iconShowcaseItem: {
    width: '22%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconItemLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 4,
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
