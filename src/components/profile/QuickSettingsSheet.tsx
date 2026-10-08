import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Clock, ShieldCheck, User, X } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BlockLayout, Spacing } from '../../constants/layout';
import { Strings } from '../../constants/strings';
import { Block } from '../common/Block';
import { BlockButton } from '../common/BlockButton';
import { QRDeeplinkTestModal } from '../dev/QRDeeplinkTestModal';

interface QuickSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
}

export const QuickSettingsSheet: React.FC<QuickSettingsSheetProps> = ({
  visible,
  onClose,
  onOpenProfile,
}) => {
  const [showQRDevModal, setShowQRDevModal] = React.useState(false);
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
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.titleText}>{Strings.home.quickSettings}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
                  <X size={18} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              <View style={styles.contentBody}>
                {/* 1. Múi giờ & Giờ bắt đầu ngày */}
                <Block variant="dark" style={styles.itemBlock} contentStyle={styles.itemInner}>
                  <View style={styles.itemLeft}>
                    <Clock size={18} color={Colors.primaryYellow} strokeWidth={2.2} />
                    <View>
                      <Text style={styles.itemTitle}>Giờ bắt đầu ngày mới</Text>
                      <Text style={styles.itemSub}>00:00 (Múi giờ Asia/Ho_Chi_Minh)</Text>
                    </View>
                  </View>
                </Block>

                {/* 2. Quản lý mục tiêu cá nhân */}
                <Block variant="dark" style={styles.itemBlock} contentStyle={styles.itemInner}>
                  <View style={styles.itemLeft}>
                    <User size={18} color={Colors.greenSafe} strokeWidth={2.2} />
                    <View>
                      <Text style={styles.itemTitle}>Hồ sơ & Mục tiêu</Text>
                      <Text style={styles.itemSub}>Chỉnh ngân sách ngày, hạn mức tuần</Text>
                    </View>
                  </View>
                </Block>

                {/* 3. Dev Tool: Thử nghiệm Deeplink VietQR (Giai đoạn S) */}
                <TouchableOpacity
                  onPress={() => setShowQRDevModal(true)}
                  activeOpacity={0.8}
                >
                  <Block variant="dark" style={styles.itemBlock} contentStyle={styles.itemInner}>
                    <View style={styles.itemLeft}>
                      <ShieldCheck size={18} color={Colors.primaryYellow} strokeWidth={2.2} />
                      <View>
                        <Text style={[styles.itemTitle, { color: Colors.primaryYellow }]}>
                          🛠️ Thử nghiệm Deeplink (Giai đoạn S)
                        </Text>
                        <Text style={styles.itemSub}>Test mở Techcombank Mobile & đo vòng đời</Text>
                      </View>
                    </View>
                  </Block>
                </TouchableOpacity>
              </View>

              <BlockButton
                title="Mở hồ sơ chi tiết"
                variant="primary"
                size="md"
                fullWidth
                onPress={() => {
                  onClose();
                  onOpenProfile();
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Dev Deeplink Modal */}
      {showQRDevModal && (
        <QRDeeplinkTestModal
          visible={showQRDevModal}
          onClose={() => setShowQRDevModal(false)}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: Colors.bgDark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: BlockLayout.borderWidth,
    borderBottomWidth: 0,
    borderColor: '#000000',
    padding: Spacing.md,
    gap: Spacing.md,
    ...BlockLayout.shadowBlock,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentBody: {
    gap: Spacing.sm,
  },
  itemBlock: {
    width: '100%',
  },
  itemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  itemSub: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '600',
  },
});
