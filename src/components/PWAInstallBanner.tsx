import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Share2, X } from 'lucide-react-native';

const STORAGE_KEY = 'pigfly_pwa_banner_dismissed';

export function PWAInstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    try {
      const isIOS =
        typeof navigator !== 'undefined' &&
        /iPhone|iPad|iPod/i.test(navigator.userAgent || '');
      
      const isStandalone =
        (typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(display-mode: standalone)').matches) ||
        (typeof navigator !== 'undefined' && (navigator as any).standalone === true);

      const dismissed =
        typeof window !== 'undefined' &&
        window.localStorage &&
        window.localStorage.getItem(STORAGE_KEY) === 'true';

      if (isIOS && !isStandalone && !dismissed) {
        setVisible(true);
      }
    } catch {
      // Ignored on platforms without window/navigator
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, 'true');
      }
    } catch {}
  };

  if (!visible) return null;

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.iconWrapper}>
        <Share2 size={18} color="#E59844" strokeWidth={2.4} />
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.title}>Cài Đặt PigFly Lên iPhone</Text>
        <Text style={styles.description}>
          Chạm nút <Text style={styles.highlight}>Chia sẻ ⎋</Text> và chọn <Text style={styles.highlight}>'Thêm vào MH chính' ➕</Text> để dùng mượt mà toàn màn hình.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleDismiss}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <X size={16} color="#A0AEC0" strokeWidth={2.4} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#161F2E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 152, 68, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    zIndex: 9999,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(229, 152, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textWrapper: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    color: '#FAF6EC',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    color: '#CBD5E1',
    fontSize: 11.5,
    lineHeight: 16,
  },
  highlight: {
    color: '#E59844',
    fontWeight: '600',
  },
  closeButton: {
    padding: 6,
  },
});
