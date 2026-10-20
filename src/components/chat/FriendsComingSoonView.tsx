import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Bell, Check, Lock, ShieldCheck, Target, Users } from 'lucide-react-native';
import { Strings } from '../../constants/strings';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { useBottomInset } from '../../hooks/useBottomInset';

interface FriendsComingSoonViewProps {
  onNotifyMe?: () => void;
}

/**
 * Màn hình "Vòng Bạn Bè - Sắp Ra Mắt" cho Ngăn 2 của trang Chat — Phong cách "Ấm, tĩnh, sang"
 * Tuân thủ mục 2.2 của đặc tả docs/screens/CHAT.md
 */
export const FriendsComingSoonView: React.FC<FriendsComingSoonViewProps> = ({
  onNotifyMe,
}) => {
  const { tokens } = useTheme();
  const { contentBottomPadding } = useBottomInset();
  const [notified, setNotified] = useState(false);

  const handleNotifyPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNotified(true);
    Alert.alert(
      'Đã đăng ký nhận thông báo!',
      'Ví Locket sẽ gửi thông báo cho bạn ngay khi Vòng Bạn Bè chính thức ra mắt ở giai đoạn M2.'
    );
    if (onNotifyMe) onNotifyMe();
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: contentBottomPadding + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. KHỐI ICON NỔI TRẦN */}
      <View style={styles.iconBox}>
        <Users size={36} color={tokens.primary} strokeWidth={2.6} />
      </View>

      <Text style={[styles.title, { color: tokens.text }]}>{Strings.chat.friendsComingSoonTitle}</Text>
      <Text style={[styles.desc, { color: tokens.textMuted }]}>{Strings.chat.friendsComingSoonDesc}</Text>

      {/* 2. CÁC ĐẶC ĐIỂM NỔI BẬT */}
      <View style={[styles.featuresList, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
        <View style={styles.featureItem}>
          <View style={styles.featureIconSmall}>
            <ShieldCheck size={18} color={tokens.primary} strokeWidth={2.6} />
          </View>
          <View style={styles.featureTextCol}>
            <Text style={[styles.featureItemTitle, { color: tokens.text }]}>Hỏi bạn trước khi mua</Text>
            <Text style={[styles.featureItemDesc, { color: tokens.textMuted }]}>
              Gửi món đồ đang phân vân vào vòng bạn bè (tối đa 8 người) để bạn bấm vote Nên / Đừng mua.
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIconSmall}>
            <Target size={18} color={tokens.primary} strokeWidth={2.6} />
          </View>
          <View style={styles.featureTextCol}>
            <Text style={[styles.featureItemTitle, { color: tokens.text }]}>Mục tiêu tuần cùng nhau</Text>
            <Text style={[styles.featureItemDesc, { color: tokens.textMuted }]}>
              Cùng tham gia thử thách không mua đồ linh tinh trong 7 ngày, xếp hạng theo số ngày giữ được ví.
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIconSmall}>
            <Lock size={18} color={tokens.primary} strokeWidth={2.6} />
          </View>
          <View style={styles.featureTextCol}>
            <Text style={[styles.featureItemTitle, { color: tokens.text }]}>Bảo mật & Ẩn tiền mặc định</Text>
            <Text style={[styles.featureItemDesc, { color: tokens.textMuted }]}>
              Bạn bè chỉ thấy tên món đồ và hình ảnh, toàn bộ số tiền thực tế được che kín tuyệt đối.
            </Text>
          </View>
        </View>
      </View>

      {/* 3. NÚT ĐĂNG KÝ THÔNG BÁO */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleNotifyPress}
        disabled={notified}
        style={[
          styles.notifyBtn,
          { backgroundColor: notified ? tokens.success : tokens.primary },
        ]}
      >
        {notified ? (
          <>
            <Check size={18} color="#FFFFFF" strokeWidth={2.6} />
            <Text style={[styles.notifyBtnText, { color: '#FFFFFF' }]}>{Strings.chat.friendsNotified}</Text>
          </>
        ) : (
          <>
            <Bell size={18} color="#1B2733" strokeWidth={2.2} />
            <Text style={[styles.notifyBtnText, { color: '#1B2733' }]}>{Strings.chat.friendsNotifyBtn}</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 32,
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    fontSize: 13.5,
    fontWeight: '400',
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 320,
  },
  featuresList: {
    width: '100%',
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 18,
    marginBottom: 28,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIconSmall: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginRight: 12,
    marginTop: 2,
  },
  featureTextCol: {
    flex: 1,
  },
  featureItemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  featureItemDesc: {
    fontSize: 12.5,
    fontWeight: '400',
    lineHeight: 17,
  },
  notifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radii.md,
    width: '100%',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notifyBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
