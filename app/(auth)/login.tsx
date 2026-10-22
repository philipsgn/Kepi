import React, { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Palette,
  User,
  Check,
  Dices,
  Calendar,
  ChevronDown,
  Power,
  AlertCircle,
  X,
} from 'lucide-react-native';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/theme/ThemeContext';

const CUTE_NICKNAMES = [
  'Cốm Non',
  'Bé Bơ',
  'Heo Mập',
  'Bé Gạo',
  'Mây Mây',
  'Cà Phê',
  'Trà Xanh',
  'Đậu Đậu',
  'Hạt Dẻ',
  'Bánh Bao',
];

const CURRENT_YEAR = new Date().getFullYear();
// Dải năm sinh mở rộng không giới hạn (từ năm hiện tại lùi về 1920)
const BIRTH_YEARS = Array.from(
  { length: CURRENT_YEAR - 1920 + 1 },
  (_, i) => CURRENT_YEAR - i
);

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithNickname, checkNicknameAvailable, isLoading } = useAuthStore();
  const { mode, setMode, activeTheme, tokens, isDark } = useTheme();

  // Khởi tạo biệt danh: Để trống hoàn toàn từ đầu theo yêu cầu
  const [nickname, setNickname] = useState<string>('');

  // Khảo sát Năm Sinh: Để trống null từ đầu theo yêu cầu
  const [selectedBirthYear, setSelectedBirthYear] = useState<number | null>(null);
  const [showYearPickerModal, setShowYearPickerModal] = useState<boolean>(false);

  // Trạng thái kiểm tra tên duy nhất
  const [isCheckingName, setIsCheckingName] = useState<boolean>(false);
  const [isNameDuplicate, setIsNameDuplicate] = useState<boolean>(false);
  const [suggestedNames, setSuggestedNames] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const debounceTimerRef = useRef<any>(null);

  // Đổi Theme xoay vòng 1-chạm: Cool Mint 🌿 ⇄ Light Pink/Cream 🌸 ⇄ Dark Mint 🌙
  const handleCycleTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextMode = mode === 'cool' ? 'light' : mode === 'light' ? 'dark' : 'cool';
    setMode(nextMode);
  };

  // Sinh 3 gợi ý tên khi bị trùng
  const generateSuggestions = (base: string) => {
    const clean = base.trim();
    const num1 = Math.floor(Math.random() * 89) + 10;
    const num2 = Math.floor(Math.random() * 900) + 100;
    return [`${clean} ${num1}`, `${clean} #${num2}`, `${clean}_pig`];
  };

  // Kiểm tra tên realtime khi người dùng dừng gõ 350ms
  useEffect(() => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setIsNameDuplicate(false);
      setSuggestedNames([]);
      setValidationError(null);
      return;
    }

    setValidationError(null);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    setIsCheckingName(true);
    debounceTimerRef.current = setTimeout(async () => {
      const isAvailable = await checkNicknameAvailable(trimmed);
      setIsCheckingName(false);
      if (!isAvailable) {
        setIsNameDuplicate(true);
        setSuggestedNames(generateSuggestions(trimmed));
      } else {
        setIsNameDuplicate(false);
        setSuggestedNames([]);
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [nickname]);

  // Đổi ngẫu nhiên một biệt danh dễ thương khi người dùng chủ động bấm xúc xắc
  const handleShuffleName = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const filtered = CUTE_NICKNAMES.filter((n) => n !== nickname);
    const nextName = filtered[Math.floor(Math.random() * filtered.length)] || 'Cốm Non';
    setNickname(nextName);
    setValidationError(null);
  };

  // KÍCH HOẠT NÚT NGUỒN TRƠN
  const handleStartPress = async () => {
    if (isLoading || isSubmitting) return;

    const trimmedName = nickname.trim();

    // 1. Kiểm tra nếu chưa nhập tên
    if (!trimmedName) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setValidationError('Vui lòng nhập biệt danh của bạn');
      return;
    }

    // 2. Kiểm tra nếu tên đang bị trùng
    if (isNameDuplicate) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setValidationError('Tên này đã có bạn dùng, vui lòng đổi tên khác');
      return;
    }

    // 3. Kiểm tra nếu chưa chọn năm sinh
    if (selectedBirthYear === null) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setValidationError('Vui lòng chọn năm sinh của bạn');
      setShowYearPickerModal(true);
      return;
    }

    // Hợp lệ: Kích hoạt nút nguồn
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsSubmitting(true);
    setValidationError(null);

    setTimeout(async () => {
      const res = await signInWithNickname(trimmedName, selectedBirthYear);
      if (res.success) {
        router.replace('/(main)');
      } else {
        setIsSubmitting(false);
      }
    }, 120);
  };

  const calculatedAge = selectedBirthYear ? CURRENT_YEAR - selectedBirthYear : null;

  // Màu gradient nền động theo từng Theme
  const bgGradientColors: [string, string, ...string[]] =
    mode === 'dark'
      ? ['#0E1620', '#16202C', '#0B131D']
      : mode === 'light'
      ? ['#FEE2E2', '#FDF2F8', '#FFF1F2'] // Hồng phấn ngọt ngào
      : ['#EAF7F2', '#D5F2E6', '#F0FDF4']; // Xanh Mint tươi mát

  return (
    <LinearGradient
      colors={bgGradientColors}
      locations={[0, 0.5, 1]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ================= TOP HEADER: NÚT ĐỔI THEME TRƠN NỔI TRẦN ================= */}
            <View style={styles.topHeaderRow}>
              <TouchableOpacity
                onPress={handleCycleTheme}
                style={styles.themeButtonBare}
                activeOpacity={0.7}
                hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                accessibilityLabel="Đổi Theme giao diện"
              >
                <Palette
                  size={22}
                  color={mode === 'dark' ? '#2DD4BF' : mode === 'light' ? '#E11D48' : '#059669'}
                  strokeWidth={2.6}
                />
              </TouchableOpacity>
            </View>

            {/* ================= HERO BRANDING & MASCOT 3D ĐỒNG BỘ APP ICON ================= */}
            <View style={styles.heroSection}>
              {/* Icon Chú Heo Pigpo 3D Clay Chibi chính thức */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={styles.mascot3DWrapper}
              >
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.mascot3DImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              <Text style={[styles.brandTitle, { color: tokens.text }]}>Pigpo</Text>

              {/* Tag Con Nhộng: Tiết kiệm • Duy trì • Sinh lời bền vững */}
              <View
                style={[
                  styles.subQuoteContainer,
                  {
                    backgroundColor:
                      mode === 'dark'
                        ? 'rgba(45, 212, 191, 0.08)'
                        : mode === 'light'
                        ? 'rgba(244, 63, 94, 0.06)'
                        : 'rgba(5, 150, 105, 0.06)',
                    borderColor:
                      mode === 'dark'
                        ? 'rgba(45, 212, 191, 0.15)'
                        : mode === 'light'
                        ? 'rgba(244, 63, 94, 0.12)'
                        : 'rgba(5, 150, 105, 0.12)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.subQuoteText,
                    {
                      color:
                        mode === 'dark'
                          ? 'rgba(45, 212, 191, 0.75)'
                          : mode === 'light'
                          ? 'rgba(190, 24, 93, 0.7)'
                          : 'rgba(5, 150, 105, 0.7)',
                    },
                  ]}
                >
                  Tiết kiệm • Duy trì • Sinh lời bền vững
                </Text>
              </View>
            </View>

            {/* ================= KHUNG CARD FORM TỐI GIẢN (SINGLE CLEAN CARD) ================= */}
            <View style={styles.formContainer}>
              <View
                style={[
                  styles.formCard,
                  {
                    backgroundColor: isDark ? '#16202C' : '#FFFFFF',
                    shadowColor: tokens.shadowColor,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.03)',
                  },
                ]}
              >
                {/* 1. TÊN BIỆT DANH CỦA BẠN: */}
                <View style={styles.formFieldBlock}>
                  <Text style={[styles.fieldLabel, { color: tokens.textMuted }]}>
                    TÊN BIỆT DANH CỦA BẠN:
                  </Text>

                  <View
                    style={[
                      styles.inputBox,
                      {
                        backgroundColor: isDark ? '#1E2C3D' : '#F8FAF9',
                        borderColor: isNameDuplicate
                          ? '#EF4444'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : '#E2E8F0',
                      },
                    ]}
                  >
                    <User
                      size={18}
                      color={mode === 'dark' ? '#2DD4BF' : mode === 'light' ? '#FB7185' : '#059669'}
                      strokeWidth={2.4}
                      style={{ marginRight: 10 }}
                    />

                    <TextInput
                      style={[styles.nameInput, { color: tokens.text }]}
                      placeholder="Nhập biệt danh"
                      placeholderTextColor={
                        isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(15, 47, 36, 0.22)'
                      }
                      value={nickname}
                      onChangeText={(t) => {
                        setNickname(t);
                        if (validationError) setValidationError(null);
                      }}
                      maxLength={25}
                      autoCapitalize="words"
                      returnKeyType="done"
                    />

                    {isCheckingName ? (
                      <ActivityIndicator
                        size="small"
                        color={tokens.primary}
                        style={{ marginRight: 6 }}
                      />
                    ) : isNameDuplicate ? (
                      <AlertCircle size={18} color="#EF4444" style={{ marginRight: 6 }} />
                    ) : nickname.trim().length > 0 ? (
                      <Check
                        size={18}
                        color="#10B981"
                        strokeWidth={2.8}
                        style={{ marginRight: 8 }}
                      />
                    ) : null}

                    {/* Nút Xúc Xắc Trơn Nổi Trần */}
                    <TouchableOpacity
                      onPress={handleShuffleName}
                      style={styles.shuffleButtonBare}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityLabel="Đổi tên ngẫu nhiên"
                    >
                      <Dices
                        size={18}
                        color={
                          mode === 'dark' ? '#2DD4BF' : mode === 'light' ? '#FB7185' : '#D97706'
                        }
                        strokeWidth={2.6}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* GỢI Ý KHI TRÙNG TÊN */}
                  {isNameDuplicate && (
                    <View style={styles.duplicateWarningBox}>
                      <Text style={styles.duplicateWarningText}>
                        Tên này đã có bạn dùng, thử chọn nhanh gợi ý:
                      </Text>
                      <View style={styles.suggestionRow}>
                        {suggestedNames.map((sug) => (
                          <TouchableOpacity
                            key={sug}
                            style={styles.suggestionChip}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setNickname(sug);
                            }}
                          >
                            <Text style={styles.suggestionChipText}>{sug}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                {/* 2. NĂM SINH & TUỔI: */}
                <View style={[styles.formFieldBlock, { marginTop: 14 }]}>
                  <Text style={[styles.fieldLabel, { color: tokens.textMuted }]}>
                    NĂM SINH & TUỔI:
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.inputBox,
                      {
                        backgroundColor: isDark ? '#1E2C3D' : '#F8FAF9',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                      },
                    ]}
                    activeOpacity={0.75}
                    onPress={() => {
                      if (validationError) setValidationError(null);
                      setShowYearPickerModal(true);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Calendar
                        size={18}
                        color={
                          mode === 'dark' ? '#2DD4BF' : mode === 'light' ? '#FB7185' : '#059669'
                        }
                        strokeWidth={2.4}
                        style={{ marginRight: 10 }}
                      />
                      {selectedBirthYear ? (
                        <Text style={[styles.birthYearText, { color: tokens.text }]}>
                          Năm sinh: {selectedBirthYear} ({calculatedAge} tuổi)
                        </Text>
                      ) : (
                        <Text
                          style={[
                            styles.birthYearPlaceholder,
                            {
                              color: isDark
                                ? 'rgba(255, 255, 255, 0.22)'
                                : 'rgba(15, 47, 36, 0.22)',
                            },
                          ]}
                        >
                          Chọn năm sinh
                        </Text>
                      )}
                    </View>

                    <ChevronDown size={18} color={tokens.textSub} strokeWidth={2.4} />
                  </TouchableOpacity>
                </View>

                {/* CẢNH BÁO XÁC THỰC RÕ RÀNG */}
                {validationError && (
                  <View style={styles.validationErrorBox}>
                    <AlertCircle size={15} color="#EF4444" style={{ marginRight: 6 }} />
                    <Text style={styles.validationErrorText}>{validationError}</Text>
                  </View>
                )}
              </View>

              {/* 3. NÚT NGUỒN TRƠN NỔI TRẦN (PURE FLOATING POWER BUTTON) */}
              <View style={styles.powerSection}>
                <TouchableOpacity
                  onPress={handleStartPress}
                  disabled={isLoading || isSubmitting}
                  activeOpacity={0.75}
                  style={styles.powerButtonBare}
                  hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                  accessibilityLabel="Bật ví bắt đầu trải nghiệm"
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="large" color="#10B981" />
                  ) : (
                    <Power
                      size={44}
                      color={
                        mode === 'dark'
                          ? '#2DD4BF'
                          : mode === 'light'
                          ? '#FB7185'
                          : '#059669'
                      }
                      strokeWidth={2.8}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* ================= CHÂN TRANG: CA DAO LỤC BÁT THUẦN VIỆT (KHÔNG NGOẶC KÉP) ================= */}
            <View style={styles.footerSection}>
              <View style={styles.verseBox}>
                <Text style={[styles.verseLine, { color: tokens.textSub }]}>
                  Heo kia chẳng vỗ thời to
                </Text>
                <Text style={[styles.verseLine, { color: tokens.textSub }]}>
                  Từng xu góp lại thành kho lúc nào
                </Text>
              </View>

              <Text style={[styles.copyrightText, { color: tokens.textMuted }]}>
                Pigpo © 2026 – Tiết kiệm, duy trì, sinh lời bền vững
              </Text>
            </View>

            {/* ================= MODAL CHỌN NĂM SINH DẠNG POP-UP NHỎ GỌN Ở GIỮA ================= */}
            <Modal
              visible={showYearPickerModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowYearPickerModal(false)}
            >
              <Pressable
                style={styles.modalCenterOverlay}
                onPress={() => setShowYearPickerModal(false)}
              >
                <Pressable
                  style={[
                    styles.modalPopupCard,
                    {
                      backgroundColor: isDark ? '#16202C' : '#FFFFFF',
                      shadowColor: tokens.shadowColor,
                    },
                  ]}
                  onPress={(e) => e.stopPropagation()}
                >
                  <FlatList
                    data={BIRTH_YEARS}
                    keyExtractor={(item) => String(item)}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 4 }}
                    renderItem={({ item }) => {
                      const isSelected = item === selectedBirthYear;
                      const age = CURRENT_YEAR - item;
                      return (
                        <TouchableOpacity
                          style={[
                            styles.yearItemPopup,
                            isSelected && {
                              backgroundColor:
                                mode === 'dark'
                                  ? 'rgba(45, 212, 191, 0.16)'
                                  : mode === 'light'
                                  ? 'rgba(244, 63, 94, 0.12)'
                                  : 'rgba(5, 150, 105, 0.12)',
                            },
                          ]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedBirthYear(item);
                            setValidationError(null);
                            setShowYearPickerModal(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.yearTextPopup,
                              { color: tokens.text },
                              isSelected && {
                                color:
                                  mode === 'dark'
                                    ? '#2DD4BF'
                                    : mode === 'light'
                                    ? '#E11D48'
                                    : '#059669',
                                fontWeight: '700',
                              },
                            ]}
                          >
                            Năm {item} ({age} tuổi)
                          </Text>
                          {isSelected && (
                            <Check
                              size={16}
                              color={
                                mode === 'dark'
                                  ? '#2DD4BF'
                                  : mode === 'light'
                                  ? '#E11D48'
                                  : '#059669'
                              }
                              strokeWidth={2.8}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    }}
                  />
                </Pressable>
              </Pressable>
            </Modal>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },

  /* TOP HEADER ROW: NÚT THEME TRƠN NỔI TRẦN */
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 2,
  },
  themeButtonBare: {
    backgroundColor: 'transparent',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* HERO BRANDING: MASCOT 3D ĐỒNG BỘ APP ICON */
  heroSection: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 12,
  },
  mascot3DWrapper: {
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot3DImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 6,
  },
  subQuoteContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  subQuoteText: {
    fontSize: 12.5,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  /* KHUNG FORM CARD TỐI GIẢN */
  formContainer: {
    width: '100%',
    paddingVertical: 6,
  },
  formCard: {
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  formFieldBlock: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '400',
    letterSpacing: 0.4,
    marginBottom: 4,
    opacity: 0.75,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1.5,
  },
  nameInput: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    padding: 0,
  },
  shuffleButtonBare: {
    backgroundColor: 'transparent',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  birthYearText: {
    fontSize: 14.5,
    fontWeight: '600',
  },
  birthYearPlaceholder: {
    fontSize: 14,
    fontWeight: '400',
  },

  /* THÔNG BÁO LỖI XÁC THỰC */
  validationErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  validationErrorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },

  /* GỢI Ý KHI TRÙNG TÊN */
  duplicateWarningBox: {
    marginTop: 8,
    paddingHorizontal: 4,
    gap: 6,
  },
  duplicateWarningText: {
    fontSize: 11.5,
    color: '#EF4444',
    fontWeight: '600',
  },
  suggestionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  suggestionChip: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  suggestionChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EF4444',
  },

  /* NÚT NGUỒN TRƠN NỔI TRẦN */
  powerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 6,
  },
  powerButtonBare: {
    backgroundColor: 'transparent',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* CHÂN TRANG: CA DAO (KHÔNG NGOẶC KÉP) */
  footerSection: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  verseBox: {
    alignItems: 'center',
    marginBottom: 6,
  },
  verseLine: {
    fontSize: 13.5,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  copyrightText: {
    fontSize: 11,
    fontWeight: '500',
  },

  /* MODAL POPUP NHỎ GỌN Ở GIỮA */
  modalCenterOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalPopupCard: {
    width: '82%',
    maxHeight: 340,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 6,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  yearItemPopup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  yearTextPopup: {
    fontSize: 14.5,
    fontWeight: '500',
  },
});
