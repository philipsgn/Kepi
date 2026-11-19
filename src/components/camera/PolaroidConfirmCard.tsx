import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Camera, Image as ImageIcon } from 'lucide-react-native';

export interface PolaroidConfirmCardProps {
  photoUri?: string | null;
  title?: string;
  itemName?: string;
  amount: number;
  isExpense?: boolean;
  onSnapAgain: () => void;
  onViewGallery: () => void;
}

export const PolaroidConfirmCard: React.FC<PolaroidConfirmCardProps> = ({
  photoUri,
  title,
  itemName = 'Món chi tiêu',
  amount,
  isExpense = true,
  onSnapAgain,
  onViewGallery,
}) => {
  const formattedAmount = (amount || 0).toLocaleString('vi-VN');
  const defaultTitle = isExpense ? 'Đã lưu và treo ảnh' : 'Đã ghi khoản thu';
  const displayTitle = title || defaultTitle;
  const prefix = isExpense ? '−' : '+';

  const handleSnapAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSnapAgain();
  };

  const handleViewGallery = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewGallery();
  };

  return (
    <View style={styles.container}>
      {/* KHUNG POLAROID CHÍNH NGHIÊNG -3° */}
      <View style={styles.polarCard}>
        {/* Khung ảnh Polaroid nhỏ bên trái */}
        <View style={styles.pframe}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.thumbnail} />
          ) : (
            <View style={styles.placeholderThumbnail}>
              <Camera size={26} color="#85735E" strokeWidth={2.4} />
            </View>
          )}
        </View>

        {/* Thông tin bên phải */}
        <View style={styles.pinfo}>
          <Text style={styles.pinfoTitle}>{displayTitle}</Text>
          <Text style={styles.pinfoSub}>
            {itemName} · {prefix}{formattedAmount} đ
          </Text>
        </View>
      </View>

      {/* 2 NÚT HÀNH ĐỘNG 1:1 PROTOTYPE */}
      <View style={styles.pact}>
        <TouchableOpacity
          style={styles.btnAgain}
          activeOpacity={0.85}
          onPress={handleSnapAgain}
        >
          <Camera size={16} color="#2B2118" strokeWidth={2.8} />
          <Text style={styles.btnAgainText}>Chụp tiếp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSee}
          activeOpacity={0.85}
          onPress={handleViewGallery}
        >
          <ImageIcon size={16} color="#FFFBF1" strokeWidth={2.8} />
          <Text style={styles.btnSeeText}>Xem ở phòng ảnh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    width: '100%',
    paddingHorizontal: 4,
  },
  polarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  pframe: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 10,
    paddingTop: 5,
    paddingHorizontal: 5,
    paddingBottom: 14,
    transform: [{ rotate: '-3deg' }],
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: 4,
    backgroundColor: '#F6EEDC',
  },
  placeholderThumbnail: {
    width: 68,
    height: 68,
    borderRadius: 4,
    backgroundColor: '#F6EEDC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  pinfoTitle: {
    fontFamily: 'Baloo2',
    fontWeight: '800',
    fontSize: 18,
    lineHeight: 22,
    color: '#2B2118',
  },
  pinfoSub: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 13,
    color: '#85735E',
  },
  pact: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  btnAgain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 14,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  btnAgainText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 13,
    color: '#2B2118',
  },
  btnSee: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    backgroundColor: '#2B2118',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 14,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  btnSeeText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 13,
    color: '#FFFBF1',
  },
});
