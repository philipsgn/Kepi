import React, { useState, useEffect, useRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg';
import {
  Mail,
  Sparkles,
  ArrowRight,
  ChevronRight,
  RotateCcw,
  Edit2,
  CheckCircle2,
} from 'lucide-react-native';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/authStore';

/**
 * BIỂU TƯỢNG MONOGRAM KEPI CHỮ 'K' THỤY ĐIỂN TỐI GIẢN (SWISS MINIMALIST)
 * Kết hợp giữa ống kính máy ảnh / khung ngắm và chiếc lá vàng thu nhỏ
 */
function KepiMonogram({ size = 56 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      {/* Vòng hào quang sáng mờ nền */}
      <Circle cx="28" cy="28" r="26" fill="rgba(229, 152, 68, 0.08)" />

      {/* Cột dọc ống kính camera (Trắng kem) */}
      <Rect x="15" y="12" width="6.5" height="32" rx="3.25" fill="#FAF6EC" />

      {/* Nét chéo trên hướng ống kính (Vàng Nắng Thu) */}
      <Line
        x1="22"
        y1="27"
        x2="39"
        y2="13"
        stroke="#E59844"
        strokeWidth="6.5"
        strokeLinecap="round"
      />

      {/* Nét chéo dưới tạo chân chữ K (Trắng kem) */}
      <Line
        x1="23.5"
        y1="27"
        x2="39"
        y2="43"
        stroke="#FAF6EC"
        strokeWidth="6.5"
        strokeLinecap="round"
      />

      {/* Điểm sáng ngàm vàng thu nhỏ */}
      <Circle cx="40" cy="12" r="3" fill="#E59844" />
    </Svg>
  );
}

/**
 * ICON GOOGLE ĐƠN SẮC ĐỒNG BỘ MÀU APP (MONOCHROME GOOGLE 'G')
 */
function MonochromeGoogleIcon({
  size = 20,
  color = '#E59844',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill={color}
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill={color}
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill={color}
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill={color}
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const {
    signInWithEmail,
    verifyEmailOtp,
    signInWithGoogle,
    continueAsGuest,
    resetOtpState,
    otpSent,
    otpEmail,
    isLoading,
    hasCompletedBudgetSetup,
  } = useAuthStore();

  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [countdown, setCountdown] = useState(60);
  const otpInputRef = useRef<TextInput>(null);

  // Đếm ngược 60s gửi lại OTP
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (otpSent && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpSent, countdown]);

  // Focus ô OTP khi chuyển sang step 2
  useEffect(() => {
    if (otpSent) {
      setCountdown(60);
      setOtpInput('');
      setTimeout(() => otpInputRef.current?.focus(), 300);
    }
  }, [otpSent]);

  // Gửi OTP 6 số qua email
  const handleSendOtp = async () => {
    const trimmed = emailInput.trim();
    if (!trimmed || !trimmed.includes('@')) {
      Alert.alert('Lời nhắc', 'Vui lòng nhập đúng định dạng email.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const res = await signInWithEmail(trimmed);
    if (!res.success) {
      Alert.alert('Thông báo', res.error || 'Không thể gửi mã xác nhận lúc này.');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // Xác thực OTP 6 số
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpInput).trim();
    if (code.length !== 6) {
      Alert.alert('Lời nhắc', 'Mã xác nhận gồm đủ 6 chữ số.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const res = await verifyEmailOtp(code);
    if (res.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (hasCompletedBudgetSetup) {
        router.replace('/(main)');
      } else {
        router.replace('/(auth)/budget-setup');
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Xác thực thất bại', res.error || 'Mã xác nhận không đúng hoặc đã hết hạn.');
    }
  };

  // Đăng nhập Google
  const handleGoogleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const res = await signInWithGoogle();
    if (!res.success) {
      Alert.alert('Google Sign-In', res.error || 'Đang mở phiên đăng nhập Google...');
    }
  };

  // Trải nghiệm Khách (100% Offline Local - 0 byte Cloud)
  const handleGuestEntry = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await continueAsGuest();
    router.replace('/(main)');
  };

  // Gửi lại OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCountdown(60);
    await signInWithEmail(otpEmail || emailInput.trim());
  };

  return (
    <LinearGradient
      colors={['#0B1017', '#131922', '#1C1714']}
      locations={[0, 0.45, 1]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ================= HERO BRANDING ================= */}
            <View style={styles.heroSection}>
              <View style={styles.monogramWrapper}>
                <KepiMonogram size={56} />
              </View>
              <Text style={styles.brandTitle}>Kepi</Text>
              <Text style={styles.tagline}>KEEP WHAT MATTERS</Text>
            </View>

            {/* ================= KHUNG HÀNH ĐỘNG CHÍNH ================= */}
            <View style={styles.actionContainer}>
              {!otpSent ? (
                <>
                  {/* NÚT GOOGLE ĐƠN SẮC */}
                  <TouchableOpacity
                    style={styles.googleButton}
                    activeOpacity={0.8}
                    onPress={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <MonochromeGoogleIcon size={20} color="#E59844" />
                    <Text style={styles.googleButtonText}>Tiếp tục với Google</Text>
                  </TouchableOpacity>

                  {/* THANH PHÂN CÁCH TỐI GIẢN */}
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>hoặc</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* HÀNG NHẬP EMAIL LIỀN KHỐI (INLINE ACTION) */}
                  <View style={styles.inlineEmailRow}>
                    <Mail size={18} color="#7A847A" style={styles.mailIcon} />
                    <TextInput
                      style={styles.emailTextInput}
                      placeholder="Nhập email của bạn..."
                      placeholderTextColor="#5A646E"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={emailInput}
                      onChangeText={setEmailInput}
                      onSubmitEditing={handleSendOtp}
                      returnKeyType="send"
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      style={[
                        styles.inlineSendBtn,
                        !emailInput.trim() && styles.inlineSendBtnDisabled,
                      ]}
                      activeOpacity={0.8}
                      onPress={handleSendOtp}
                      disabled={isLoading || !emailInput.trim()}
                    >
                      <ArrowRight size={18} color="#0E1620" />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                /* ================= STEP 2: XÁC THỰC MÃ OTP 6 CHỮ SỐ ================= */
                <View style={styles.otpCard}>
                  <Text style={styles.otpHeaderTitle}>Mã xác nhận 6 số</Text>
                  <Text style={styles.otpSubText} numberOfLines={1}>
                    Đã gửi tới {otpEmail}
                  </Text>

                  {/* 6 Ô SỐ NHẬP OTP */}
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => otpInputRef.current?.focus()}
                    style={styles.otpDigitsContainer}
                  >
                    {[0, 1, 2, 3, 4, 5].map((index) => {
                      const char = otpInput[index] || '';
                      const isFocused = otpInput.length === index;
                      return (
                        <View
                          key={index}
                          style={[
                            styles.otpBox,
                            char ? styles.otpBoxFilled : null,
                            isFocused ? styles.otpBoxFocused : null,
                          ]}
                        >
                          <Text style={styles.otpBoxText}>{char}</Text>
                        </View>
                      );
                    })}
                  </TouchableOpacity>

                  {/* ẨN TEXTINPUT NHẬN SỐ */}
                  <TextInput
                    ref={otpInputRef}
                    style={styles.hiddenInput}
                    value={otpInput}
                    onChangeText={(val) => {
                      const clean = val.replace(/[^0-9]/g, '').slice(0, 6);
                      setOtpInput(clean);
                      if (clean.length === 6) {
                        handleVerifyOtp(clean);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                  />

                  {/* HÀNG HÀNH ĐỘNG OTP */}
                  <View style={styles.otpActionsRow}>
                    <TouchableOpacity
                      style={styles.resendBtn}
                      activeOpacity={0.7}
                      onPress={handleResendOtp}
                      disabled={countdown > 0}
                    >
                      <RotateCcw size={13} color={countdown > 0 ? '#5A646E' : '#E59844'} />
                      <Text
                        style={[
                          styles.resendBtnText,
                          countdown > 0 && styles.resendBtnTextDisabled,
                        ]}
                      >
                        {countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi lại mã'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.changeEmailBtn}
                      activeOpacity={0.7}
                      onPress={() => {
                        resetOtpState();
                        setOtpInput('');
                      }}
                    >
                      <Edit2 size={13} color="#7A847A" />
                      <Text style={styles.changeEmailText}>Đổi email</Text>
                    </TouchableOpacity>
                  </View>

                  {/* NÚT XÁC NHẬN OTP */}
                  <TouchableOpacity
                    style={[
                      styles.verifyBtn,
                      otpInput.length !== 6 && styles.verifyBtnDisabled,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => handleVerifyOtp()}
                    disabled={otpInput.length !== 6 || isLoading}
                  >
                    <CheckCircle2 size={18} color="#0E1620" />
                    <Text style={styles.verifyBtnText}>Xác nhận</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* ================= CHÂN TRANG: NÚT KHÁCH TỐI GIẢN ================= */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={styles.guestPill}
                activeOpacity={0.75}
                onPress={handleGuestEntry}
                disabled={isLoading}
              >
                <Sparkles size={14} color="#E59844" />
                <Text style={styles.guestPillText}>Dùng thử dạng Khách</Text>
                <ChevronRight size={14} color="#7A847A" />
              </TouchableOpacity>
            </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },

  /* HERO BRANDING */
  heroSection: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 24,
  },
  monogramWrapper: {
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FAF6EC',
    letterSpacing: -1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E59844',
    letterSpacing: 2.8,
  },

  /* ACTION CONTAINER */
  actionContainer: {
    width: '100%',
    paddingVertical: 12,
  },

  /* NÚT GOOGLE ĐƠN SẮC */
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    backgroundColor: '#141A22',
    borderWidth: 1.5,
    borderColor: 'rgba(229, 152, 68, 0.3)',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FAF6EC',
    letterSpacing: 0.2,
  },

  /* DIVIDER */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    fontSize: 12,
    color: '#5A646E',
    fontWeight: '500',
  },

  /* INLINE EMAIL ROW */
  inlineEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    backgroundColor: '#141A22',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingLeft: 16,
    paddingRight: 6,
  },
  mailIcon: {
    marginRight: 10,
  },
  emailTextInput: {
    flex: 1,
    fontSize: 15,
    color: '#FAF6EC',
    paddingVertical: 0,
  },
  inlineSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E59844',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineSendBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },

  /* OTP SECTION */
  otpCard: {
    backgroundColor: '#141A22',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 152, 68, 0.2)',
    alignItems: 'center',
  },
  otpHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FAF6EC',
    marginBottom: 4,
  },
  otpSubText: {
    fontSize: 13,
    color: '#7A847A',
    marginBottom: 18,
  },
  otpDigitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: '#E59844',
    backgroundColor: 'rgba(229, 152, 68, 0.08)',
  },
  otpBoxFocused: {
    borderColor: '#E59844',
  },
  otpBoxText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FAF6EC',
    fontVariant: ['tabular-nums'],
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  otpActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  resendBtnText: {
    fontSize: 12,
    color: '#E59844',
    fontWeight: '600',
  },
  resendBtnTextDisabled: {
    color: '#5A646E',
  },
  changeEmailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  changeEmailText: {
    fontSize: 12,
    color: '#7A847A',
    fontWeight: '500',
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E59844',
    width: '100%',
    gap: 8,
  },
  verifyBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  verifyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0E1620',
  },

  /* BOTTOM SECTION */
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  guestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  guestPillText: {
    fontSize: 13,
    color: '#FAF6EC',
    fontWeight: '500',
  },
});
