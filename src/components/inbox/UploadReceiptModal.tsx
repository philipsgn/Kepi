import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  Check,
  EyeOff,
  ImagePlus,
  Info,
  Receipt,
  Sparkles,
  Tag,
  X,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeContext';
import { formatVND } from '../../utils/currency';
import { useTransactionStore } from '../../store/transactionStore';
import { useAuthStore } from '../../store/authStore';
import { TransactionType } from '../../types/database';
import { trackEvent } from '../../services/analytics';

interface UploadReceiptModalProps {
  visible: boolean;
  initialPhotoUri?: string | null;
  onClose: () => void;
  onSave: (params: {
    photoUri: string | null;
    amount: number;
    category: string;
    description: string;
    type: TransactionType;
    occurredAt?: string;
  }) => void;
  onBatchUploaded?: (items: {
    photoUri: string;
    amount: number;
    category: string;
    description: string;
    occurredAt?: string;
  }[]) => void;
}

const CATEGORIES = [
  'Ăn uống',
  'Cà phê',
  'Mua sắm',
  'Di chuyển',
  'Gia đình',
  'Khác',
];

const FIXED_QUICK_CHIPS = [30000, 50000, 100000, 200000, 500000];

export const UploadReceiptModal: React.FC<UploadReceiptModalProps> = ({
  visible,
  initialPhotoUri,
  onClose,
  onSave,
  onBatchUploaded,
}) => {
  const { isDark, tokens } = useTheme();
  const transactions = useTransactionStore((state) => state.transactions);
  const privacyMode = useAuthStore((state) => state.profile?.privacy_mode);

  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(initialPhotoUri || null);
  const [photoCreationTime, setPhotoCreationTime] = useState<string | null>(null);
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Ăn uống');
  const [description, setDescription] = useState<string>('');
  const [txType, setTxType] = useState<TransactionType>('EXPENSE');
  const [savePhotoWithExpense, setSavePhotoWithExpense] = useState<boolean>(true);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState<boolean>(false);

  const openTimeRef = useRef<number>(Date.now());

  // Kiểm tra lời nhắc quyền riêng tư lần đầu tiên
  useEffect(() => {
    AsyncStorage.getItem('receipt_privacy_acknowledged_v1')
      .then((val) => {
        if (!val) {
          setShowPrivacyNotice(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleAcknowledgePrivacy = async () => {
    setShowPrivacyNotice(false);
    await AsyncStorage.setItem('receipt_privacy_acknowledged_v1', 'true').catch(() => {});
  };

  // Cảnh báo trùng: cùng số tiền trong vòng ±10 phút hoặc cùng URI ảnh
  const duplicateWarning = useMemo(() => {
    const rawNumber = parseInt(amountStr.replace(/\D/g, ''), 10);
    if (!rawNumber || rawNumber <= 0) return null;
    const now = Date.now();
    const found = transactions.find((tx) => {
      if (selectedPhotoUri && tx.photo_url && tx.photo_url === selectedPhotoUri) {
        return true;
      }
      if (tx.amount !== rawNumber) return false;
      const createdTime = new Date(tx.created_at).getTime();
      return Math.abs(now - createdTime) <= 10 * 60 * 1000;
    });

    if (found) {
      const minutesAgo = Math.max(1, Math.round((now - new Date(found.created_at).getTime()) / 60000));
      return {
        tx: found,
        minutesAgo,
      };
    }
    return null;
  }, [amountStr, selectedPhotoUri, transactions]);

  useEffect(() => {
    if (duplicateWarning) {
      trackEvent('duplicate_warned', { triggered: true });
    }
  }, [duplicateWarning]);

  // Kiểm tra ảnh chụp quá 7 ngày trước (vượt giới hạn ghi bù)
  const isOldPhoto = useMemo(() => {
    if (!photoCreationTime) return false;
    const created = new Date(photoCreationTime).getTime();
    return Date.now() - created > 7 * 24 * 3600 * 1000;
  }, [photoCreationTime]);

  // Lấy các mức giá người dùng hay dùng nhất từ lịch sử giao dịch (Top 3)
  const historyChips = useMemo(() => {
    const frequencyMap = new Map<number, number>();
    for (const tx of transactions.slice(0, 30)) {
      if (tx.amount > 0 && !FIXED_QUICK_CHIPS.includes(tx.amount)) {
        frequencyMap.set(tx.amount, (frequencyMap.get(tx.amount) || 0) + 1);
      }
    }
    return Array.from(frequencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([amt]) => amt);
  }, [transactions]);

  // Khởi tạo và nhớ ngữ cảnh gần nhất khi mở modal
  useEffect(() => {
    if (visible) {
      openTimeRef.current = Date.now();

      if (initialPhotoUri) {
        setSelectedPhotoUri(initialPhotoUri);
      }

      // Lấy danh mục và nơi nhận từ giao dịch gần nhất nếu người dùng chưa nhập
      const latestTx = transactions[0];
      if (latestTx) {
        setSelectedCategory(latestTx.category || 'Ăn uống');
        setDescription(latestTx.description ? `Trả ${latestTx.description}` : 'Chuyển khoản');
      } else {
        setSelectedCategory('Ăn uống');
        setDescription('Chuyển khoản');
      }

      // Tự động bật bàn phím số với ô số tiền rỗng để người dùng gõ ngay
      setAmountStr('');
      setTxType('EXPENSE');
      setSavePhotoWithExpense(true);
    }
  }, [visible, initialPhotoUri, transactions]);

  // Tiền xử lý ảnh: thu nhỏ & xóa siêu dữ liệu EXIF trên máy
  const processImageCleanExif = async (uri: string): Promise<string> => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1280 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch {
      return uri;
    }
  };

  const handlePickImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Nếu chọn 1 ảnh: nạp vào sheet xem lại ngay lập tức
        if (result.assets.length === 1) {
          const asset = result.assets[0];
          const cleanedUri = await processImageCleanExif(asset.uri);
          setSelectedPhotoUri(cleanedUri);
          const rawTime = (asset as any).creationTime || (asset as any).exif?.DateTimeOriginal;
          if (rawTime) {
            setPhotoCreationTime(new Date(rawTime).toISOString());
          }
        } else {
          // Nếu chọn nhiều ảnh (2 - 10 ảnh): đưa các ảnh còn lại vào hàng đợi Hộp xác nhận
          const cleanedFirst = await processImageCleanExif(result.assets[0].uri);
          setSelectedPhotoUri(cleanedFirst);

          const batchList = await Promise.all(
            result.assets.slice(1).map(async (a, idx) => {
              const rawTime = (a as any).creationTime || (a as any).exif?.DateTimeOriginal;
              return {
                photoUri: await processImageCleanExif(a.uri),
                amount: 50000,
                category: selectedCategory,
                description: `Biên lai ${idx + 2}`,
                occurredAt: rawTime ? new Date(rawTime).toISOString() : new Date().toISOString(),
              };
            })
          );

          if (onBatchUploaded) {
            onBatchUploaded(batchList);
          }
        }
      }
    } catch {
      Alert.alert('Không thể mở thư viện ảnh', 'Vui lòng kiểm tra quyền truy cập ảnh của Ví Locket.');
    }
  };

  const executeSave = (chosenDate?: string) => {
    const rawNumber = parseInt(amountStr.replace(/\D/g, ''), 10);
    if (isNaN(rawNumber) || rawNumber <= 0) {
      Alert.alert('Chưa nhập số tiền', 'Vui lòng nhập số tiền bạn đã thanh toán.');
      return;
    }

    const timeToSaveMs = Date.now() - openTimeRef.current;
    trackEvent('time_to_save', { duration_ms: timeToSaveMs });
    trackEvent('receipt_saved', {
      has_photo: savePhotoWithExpense && !!selectedPhotoUri,
      type: txType,
      category: selectedCategory,
      duration_ms: timeToSaveMs,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onSave({
      photoUri: savePhotoWithExpense && selectedPhotoUri ? selectedPhotoUri : null,
      amount: rawNumber,
      category: selectedCategory,
      description: description.trim() || (txType === 'INCOME' ? 'Khoản thu nhập' : 'Biên lai chuyển khoản'),
      type: txType,
      occurredAt: chosenDate || photoCreationTime || new Date().toISOString(),
    });

    // Reset state & close
    setSelectedPhotoUri(null);
    setAmountStr('');
    onClose();
  };

  const handleSave = () => {
    const rawNumber = parseInt(amountStr.replace(/\D/g, ''), 10);
    if (isNaN(rawNumber) || rawNumber <= 0) {
      Alert.alert('Chưa nhập số tiền', 'Vui lòng nhập số tiền bạn đã thanh toán.');
      return;
    }

    if (isOldPhoto && photoCreationTime) {
      const formattedDate = new Date(photoCreationTime).toLocaleDateString('vi-VN');
      Alert.alert(
        'Ảnh chụp từ ngày trước',
        `Biên lai này được chụp vào ngày ${formattedDate} (> 7 ngày trước). Bạn muốn ghi vào ngày nào?`,
        [
          { text: 'Ngày hôm nay', onPress: () => executeSave(new Date().toISOString()) },
          { text: `Ngày chụp (${formattedDate})`, onPress: () => executeSave(photoCreationTime) },
          { text: 'Hủy', style: 'cancel' },
        ]
      );
      return;
    }

    executeSave();
  };

  const handleClose = () => {
    const durationMs = Date.now() - openTimeRef.current;
    trackEvent('receipt_dismissed', { duration_ms: durationMs });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedPhotoUri(null);
    onClose();
  };

  const formatChipLabel = (num: number) => {
    if (num >= 1000000) return `${num / 1000000} củ`;
    if (num >= 1000) return `${num / 1000}k`;
    return `${num}đ`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: isDark ? '#141D2A' : '#FAF6EC',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(22, 34, 49, 0.10)',
            },
          ]}
        >
          {/* HEADER */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerTitleRow}>
              <View
                style={[
                  styles.headerIconCircle,
                  {
                    backgroundColor: isDark ? 'rgba(229, 152, 68, 0.15)' : 'rgba(229, 152, 68, 0.12)',
                  },
                ]}
              >
                <Receipt size={18} color={Colors.primaryYellow} strokeWidth={2.4} />
              </View>
              <Text style={[styles.headerTitle, { color: isDark ? '#FAF6EC' : '#141D26' }]}>
                Ghi chi tiêu từ biên lai
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              style={[
                styles.closeBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={18} color={isDark ? '#8C9DAC' : '#65778B'} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* LỜI NHẮC QUYỀN RIÊNG TƯ 1 LẦN (FIRST-TIME PRIVACY NOTICE) */}
            {showPrivacyNotice && (
              <View
                style={[
                  styles.privacyNoticeBox,
                  {
                    backgroundColor: isDark ? 'rgba(229, 152, 68, 0.12)' : '#FFF9EE',
                    borderColor: 'rgba(229, 152, 68, 0.35)',
                  },
                ]}
              >
                <Info size={16} color={Colors.primaryYellow} strokeWidth={2.2} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.privacyNoticeText, { color: isDark ? '#FAF6EC' : '#3E2A12' }]}>
                    Ảnh biên lai có thể chứa số tài khoản người nhận. Bạn có thể tắt công tắc "Lưu ảnh kèm khoản" bất kỳ lúc nào nếu muốn giữ riêng tư.
                  </Text>
                  <TouchableOpacity onPress={handleAcknowledgePrivacy} style={styles.privacyAcknowledgeBtn}>
                    <Text style={styles.privacyAcknowledgeText}>Đã hiểu</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* CẢNH BÁO TRÙNG KHOẢN CHI */}
            {duplicateWarning && (
              <View
                style={[
                  styles.duplicateWarningBox,
                  {
                    backgroundColor: isDark ? 'rgba(200, 109, 81, 0.15)' : '#FDF0EC',
                    borderColor: 'rgba(200, 109, 81, 0.35)',
                  },
                ]}
              >
                <AlertTriangle size={16} color="#C86D51" strokeWidth={2.2} />
                <Text style={[styles.duplicateWarningText, { color: isDark ? '#F5B09E' : '#9E3A20' }]}>
                  Khoản {formatVND(duplicateWarning.tx.amount)} vừa được ghi cách đây {duplicateWarning.minutesAgo} phút ({duplicateWarning.tx.description}). Bạn có chắc muốn ghi thêm?
                </Text>
              </View>
            )}

            {/* 1. PHOTO PREVIEW / CHANGE PHOTO */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handlePickImage}
              style={[
                styles.photoFrame,
                {
                  borderColor: selectedPhotoUri
                    ? Colors.primaryYellow
                    : isDark
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(22, 34, 49, 0.15)',
                  backgroundColor: isDark ? '#0F1621' : '#F2ECE1',
                },
              ]}
            >
              {selectedPhotoUri ? (
                <View style={styles.previewContainer}>
                  <Image
                    source={{ uri: selectedPhotoUri }}
                    style={styles.previewImage}
                    resizeMode="contain"
                    blurRadius={privacyMode ? 18 : 0}
                  />
                  {privacyMode && (
                    <View style={styles.privacyBlurBadge}>
                      <EyeOff size={12} color="#FFFFFF" strokeWidth={2.2} />
                      <Text style={styles.privacyBlurText}>Đã làm mờ (Ẩn tiền)</Text>
                    </View>
                  )}
                  <View style={styles.changePhotoBadge}>
                    <ImagePlus size={13} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.changePhotoText}>Đổi / Chọn ảnh</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyPhotoState}>
                  <ImagePlus size={32} color={Colors.primaryYellow} strokeWidth={2} />
                  <Text style={[styles.emptyPhotoTitle, { color: isDark ? '#FAF6EC' : '#141D26' }]}>
                    Chạm để chọn ảnh biên lai giao dịch
                  </Text>
                  <Text style={[styles.emptyPhotoSub, { color: isDark ? '#7E91A4' : '#8A99A8' }]}>
                    Ảnh màn hình Techcombank, Vietcombank, Momo...
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* 2. CHỌN LOẠI (CHI / THU) */}
            <View style={styles.typeSelectorRow}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setTxType('EXPENSE');
                }}
                style={[
                  styles.typeTab,
                  txType === 'EXPENSE' && {
                    backgroundColor: isDark ? 'rgba(200, 109, 81, 0.25)' : '#F5E6E1',
                    borderColor: Colors.warningCoral,
                  },
                ]}
              >
                <ArrowUpRight size={14} color={txType === 'EXPENSE' ? Colors.warningCoral : isDark ? '#7E91A4' : '#8A99A8'} strokeWidth={2.4} />
                <Text
                  style={[
                    styles.typeTabText,
                    { color: txType === 'EXPENSE' ? Colors.warningCoral : isDark ? '#7E91A4' : '#8A99A8' },
                  ]}
                >
                  Khoản Chi
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setTxType('INCOME');
                }}
                style={[
                  styles.typeTab,
                  txType === 'INCOME' && {
                    backgroundColor: isDark ? 'rgba(126, 159, 128, 0.25)' : '#E8F2E9',
                    borderColor: Colors.greenSafe,
                  },
                ]}
              >
                <ArrowDownLeft size={14} color={txType === 'INCOME' ? Colors.greenSafe : isDark ? '#7E91A4' : '#8A99A8'} strokeWidth={2.4} />
                <Text
                  style={[
                    styles.typeTabText,
                    { color: txType === 'INCOME' ? Colors.greenSafe : isDark ? '#7E91A4' : '#8A99A8' },
                  ]}
                >
                  Khoản Thu
                </Text>
              </TouchableOpacity>
            </View>

            {/* 3. SỐ TIỀN & CHIP GIÁ THÔNG MINH */}
            <View style={styles.inputSection}>
              <Text style={[styles.fieldLabel, { color: isDark ? '#8C9DAC' : '#65778B' }]}>
                Số tiền ({txType === 'EXPENSE' ? 'đã chi' : 'đã nhận'}):
              </Text>
              <View
                style={[
                  styles.amountInputRow,
                  {
                    backgroundColor: isDark ? '#0F1621' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(229, 152, 68, 0.5)' : Colors.primaryYellow,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.amountInput,
                    {
                      color: isDark ? '#FAF6EC' : '#141D26',
                    },
                  ]}
                  keyboardType="numeric"
                  value={amountStr ? parseInt(amountStr, 10).toLocaleString('vi-VN') : ''}
                  onChangeText={(t) => setAmountStr(t.replace(/\D/g, ''))}
                  placeholder="Nhập số tiền..."
                  placeholderTextColor={isDark ? '#5A6E82' : '#9EAEBD'}
                  autoFocus={true}
                />
                <Text style={styles.amountUnit}>đ</Text>
              </View>

              {/* CHIP GIÁ: CỐ ĐỊNH + LỊCH SỬ THƯỜNG DÙNG */}
              <View style={styles.quickChipsRow}>
                {FIXED_QUICK_CHIPS.map((amt) => (
                  <TouchableOpacity
                    key={`fixed-${amt}`}
                    style={[
                      styles.quickChip,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#EFEAE1',
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setAmountStr(amt.toString());
                    }}
                  >
                    <Text style={[styles.quickChipText, { color: isDark ? '#CBD5E1' : '#334155' }]}>
                      {formatChipLabel(amt)}
                    </Text>
                  </TouchableOpacity>
                ))}

                {historyChips.map((amt) => (
                  <TouchableOpacity
                    key={`history-${amt}`}
                    style={[
                      styles.quickChipHistory,
                      {
                        backgroundColor: isDark ? 'rgba(229, 152, 68, 0.18)' : '#FFF2DE',
                        borderColor: Colors.primaryYellow,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setAmountStr(amt.toString());
                    }}
                  >
                    <Sparkles size={11} color={Colors.primaryYellow} strokeWidth={2.4} style={{ marginRight: 3 }} />
                    <Text style={[styles.quickChipText, { color: isDark ? '#FAF6EC' : '#141D26', fontWeight: '700' }]}>
                      {formatChipLabel(amt)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 4. DANH MỤC 1-CHẠM */}
            <View style={styles.inputSection}>
              <Text style={[styles.fieldLabel, { color: isDark ? '#8C9DAC' : '#65778B' }]}>
                Danh mục:
              </Text>
              <View style={styles.catGrid}>
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setSelectedCategory(cat);
                      }}
                      style={[
                        styles.catButton,
                        {
                          backgroundColor: isSelected
                            ? Colors.primaryYellow
                            : isDark
                            ? '#0F1621'
                            : '#EFEAE1',
                          borderColor: isSelected
                            ? Colors.primaryYellow
                            : isDark
                            ? 'rgba(255, 255, 255, 0.10)'
                            : 'rgba(0, 0, 0, 0.08)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.catButtonText,
                          {
                            color: isSelected ? '#FFFFFF' : isDark ? '#FAF6EC' : '#141D26',
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 5. GHI CHÚ / NƠI NHẬN */}
            <View style={styles.inputSection}>
              <Text style={[styles.fieldLabel, { color: isDark ? '#8C9DAC' : '#65778B' }]}>
                Mô tả / Nơi nhận:
              </Text>
              <TextInput
                style={[
                  styles.descInput,
                  {
                    color: isDark ? '#FAF6EC' : '#141D26',
                    backgroundColor: isDark ? '#0F1621' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.10)',
                  },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="VD: Cà phê trứng, Ăn trưa phố cổ..."
                placeholderTextColor={isDark ? '#5A6E82' : '#9EAEBD'}
              />
            </View>

            {/* 6. CÔNG TẮC LƯU ẢNH KÈM KHOẢN (MẶC ĐỊNH BẬT) */}
            <View
              style={[
                styles.switchRow,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F2EDE4',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                },
              ]}
            >
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.switchTitle, { color: isDark ? '#FAF6EC' : '#141D26' }]}>
                  Lưu ảnh kèm khoản
                </Text>
                <Text style={[styles.switchSubtitle, { color: isDark ? '#8C9DAC' : '#65778B' }]}>
                  Đã tự động xóa EXIF. Làm mờ khi bật chế độ "Ẩn tiền".
                </Text>
              </View>
              <Switch
                value={savePhotoWithExpense}
                onValueChange={(val) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setSavePhotoWithExpense(val);
                }}
                trackColor={{ false: '#3A4452', true: Colors.primaryYellow }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>

          {/* 7. ACTION BUTTONS: [GHI KHOẢN ĐÃ CHI] & [BỎ] */}
          <View style={styles.footerAction}>
            <TouchableOpacity
              style={[
                styles.dismissButton,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E8E2D6',
                },
              ]}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={[styles.dismissText, { color: isDark ? '#8C9DAC' : '#65778B' }]}>
                Bỏ qua
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveSubmitBtn}
              onPress={handleSave}
              activeOpacity={0.88}
            >
              <Check size={18} color="#FFFFFF" strokeWidth={2.8} />
              <Text style={styles.saveSubmitText}>Ghi khoản đã chi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '92%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
  },
  privacyNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  privacyNoticeText: {
    fontSize: 11,
    lineHeight: 15,
  },
  privacyAcknowledgeBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.primaryYellow,
    borderRadius: 6,
    marginTop: 4,
  },
  privacyAcknowledgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1B2733',
  },
  duplicateWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  duplicateWarningText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  privacyBlurBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(20, 29, 42, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  privacyBlurText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  photoFrame: {
    height: 150,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changePhotoBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(20, 29, 42, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyPhotoState: {
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 4,
  },
  emptyPhotoTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  emptyPhotoSub: {
    fontSize: 11,
    textAlign: 'center',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputSection: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  amountUnit: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.accentOrange,
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  quickChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  quickChipHistory: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
  },
  catButtonText: {
    fontSize: 12,
  },
  descInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 10,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  switchSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 10,
  },
  dismissButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveSubmitBtn: {
    flex: 2,
    backgroundColor: Colors.primaryYellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    shadowColor: Colors.primaryYellow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  saveSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
