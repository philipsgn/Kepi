import React from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg';
import { useAuthStore } from '../../src/store/authStore';

/**
 * BIỂU TƯỢNG MONOGRAM KEPI CHỮ 'K' ĐỒNG BỘ NỀN XANH MINT BAN MAI
 * Kết hợp giữa ống kính máy ảnh Xanh Rừng Đậm Phố Cổ và ngàm Vàng Nắng Thu
 */
function KepiMonogram({ size = 72 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      {/* Vòng hào quang sáng mờ nền */}
      <Circle cx="28" cy="28" r="26" fill="rgba(16, 185, 129, 0.15)" />

      {/* Cột dọc ống kính camera (Xanh Rừng Đậm Phố Cổ) */}
      <Rect x="15" y="12" width="6.5" height="32" rx="3.25" fill="#0F2F24" />

      {/* Nét chéo trên hướng ống kính (Vàng Hổ Phách Nắng Thu) */}
      <Line
        x1="22"
        y1="27"
        x2="39"
        y2="13"
        stroke="#E59844"
        strokeWidth="6.5"
        strokeLinecap="round"
      />

      {/* Nét chéo dưới tạo chân chữ K (Xanh Ngọc Bích Đậm) */}
      <Line
        x1="23.5"
        y1="27"
        x2="39"
        y2="43"
        stroke="#1B4D3E"
        strokeWidth="6.5"
        strokeLinecap="round"
      />

      {/* Điểm sáng ngàm vàng hổ phách */}
      <Circle cx="40" cy="12" r="3.5" fill="#E59844" />
    </Svg>
  );
}

/**
 * ICON GOOGLE ĐƠN SẮC MÀU HỔ PHÁCH
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
  const { signInWithGoogle, continueAsGuest, isLoading } = useAuthStore();

  // Đăng nhập Google (Tự động đồng bộ Supabase Cloud vĩnh viễn)
  const handleGoogleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const res = await signInWithGoogle();
    if (!res.success) {
      Alert.alert('Google Sign-In', res.error || 'Đang mở phiên đăng nhập Google...');
    }
  };

  // Vào ngay (Nếu lần đầu -> mở Tab thiết lập Tên & Chi tiêu nhanh; nếu đã có -> mở thẳng Camera)
  const handleInstantEntry = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await continueAsGuest();
    const isSetup = useAuthStore.getState().hasCompletedBudgetSetup;
    if (!isSetup) {
      router.replace('/(auth)/budget-setup');
    } else {
      router.replace('/(main)');
    }
  };

  return (
    <LinearGradient
      colors={['#E0F2FE', '#D1F4E0', '#F4FBF7']}
      locations={[0, 0.5, 1]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContainer}>
          {/* ================= HERO BRANDING ================= */}
          <View style={styles.heroSection}>
            <View style={styles.monogramWrapper}>
              <KepiMonogram size={72} />
            </View>
            <Text style={styles.brandTitle}>Kepi</Text>
            <Text style={styles.tagline}>KEEP WHAT MATTERS</Text>

            {/* QUOTE NGHỆ THUẬT IN NGHIÊNG NHẸ */}
            <View style={styles.quoteWrapper}>
              <Text style={styles.quoteHighlight}>
                “Góp chút nhỏ, dựng tương lai to”
              </Text>
            </View>
          </View>

          {/* ================= KHUNG HÀNH ĐỘNG 2 CỔNG ================= */}
          <View style={styles.actionContainer}>
            {/* 1. NÚT CHÍNH: TIẾP TỤC VỚI GOOGLE (TRẮNG SỨ ĐỔ BÓNG MỀM) */}
            <TouchableOpacity
              style={styles.googleButton}
              activeOpacity={0.85}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <View style={styles.googleIconCircle}>
                <MonochromeGoogleIcon size={18} color="#E59844" />
              </View>
              <Text style={styles.googleButtonText}>Tiếp tục với Google</Text>
            </TouchableOpacity>

            {/* 2. NÚT PHỤ: VÀO NGAY (XANH NGỌC ĐẬM CHỮ TRẮNG KEM CĂN GIỮA) */}
            <TouchableOpacity
              style={styles.instantButton}
              activeOpacity={0.85}
              onPress={handleInstantEntry}
              disabled={isLoading}
            >
              <Text style={styles.instantButtonText}>Vào ngay</Text>
            </TouchableOpacity>
          </View>

          {/* ================= CHÂN TRANG ================= */}
          <View style={styles.footerSection}>
            <Text style={styles.footerBrandText}>
              Kepi · Giữ gìn từng khoảnh khắc
            </Text>
          </View>
        </View>
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
  mainContainer: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },

  /* HERO BRANDING */
  heroSection: {
    alignItems: 'center',
    paddingTop: 48,
  },
  monogramWrapper: {
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 44,
    fontWeight: '800',
    color: '#0F2F24',
    letterSpacing: -1.2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
    letterSpacing: 3,
    marginBottom: 24,
  },

  /* QUOTE TRUYỀN CẢM HỨNG */
  quoteWrapper: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  quoteHighlight: {
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#0F2F24',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  /* KHUNG HÀNH ĐỘNG */
  actionContainer: {
    width: '100%',
    gap: 14,
    paddingBottom: 28,
  },

  /* NÚT GOOGLE (TRẮNG SỨ CAO CẤP) */
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(15, 47, 36, 0.08)',
    height: 56,
    gap: 12,
    shadowColor: '#0F2F24',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  googleIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(229, 152, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2F24',
    letterSpacing: 0.2,
  },

  /* NÚT VÀO NGAY (XANH NGỌC ĐẬM) */
  instantButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2F24',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#0F2F24',
    height: 56,
    shadowColor: '#0F2F24',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  instantButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FAF6EC',
    letterSpacing: 0.2,
  },

  /* CHÂN TRANG */
  footerSection: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  footerBrandText: {
    fontSize: 12,
    color: '#5A7A6E',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
