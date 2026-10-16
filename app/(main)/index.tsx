import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import {
  Bell,
  BookOpen,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Edit3,
  Filter,
  Flame,
  Hourglass,
  ImagePlus,
  Layers,
  Leaf,
  PenLine,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  User,
  Users,
  X,
  Zap,
  ZapOff,
} from 'lucide-react-native';
import { Colors } from '../../src/constants/colors';
import { BlockLayout, Spacing } from '../../src/constants/layout';
import { Typography } from '../../src/constants/typography';
import { Strings } from '../../src/constants/strings';
import { useTheme } from '../../src/theme/ThemeContext';
import { radii, spacing } from '../../src/theme/tokens';

// Custom Components
import { Block } from '../../src/components/common/Block';
import { BlockButton } from '../../src/components/common/BlockButton';
import { BlockChip } from '../../src/components/common/BlockChip';
import { Chip } from '../../src/components/common/Chip';
import { PriceTag } from '../../src/components/common/PriceTag';
import { DiscreteHealthBar } from '../../src/components/common/DiscreteHealthBar';
import { FloatingPillTabBar } from '../../src/components/navigation/FloatingPillTabBar';
import { ShutterButton } from '../../src/components/camera/ShutterButton';
import { ModeSwitchPill, CameraMode } from '../../src/components/camera/ModeSwitchPill';
import { LocketMomentCard } from '../../src/components/camera/LocketMomentCard';
import { UndoToastBar } from '../../src/components/common/UndoToastBar';
import { BankClipboardToast } from '../../src/components/common/BankClipboardToast';
import { FastCategorySheet } from '../../src/components/cards/FastCategorySheet';
import { ParsedBankNotification } from '../../src/utils/bankNotificationParser';
import { groupTransactionsByDay } from '../../src/utils/cameraUtils';

// Views
import { JournalView } from '../../src/components/views/JournalView';
import { StatsView } from '../../src/components/views/StatsView';
import { ChatView } from '../../src/components/views/ChatView';
import { ProfileView } from '../../src/components/views/ProfileView';

// Modals & Sheets
import { ConfirmationSheet } from '../../src/components/cards/ConfirmationSheet';
import { ActualPriceSheet } from '../../src/components/cards/ActualPriceSheet';
import { MinhAvatar } from '../../src/components/coach/MinhAvatar';
import { MinhCoachModal } from '../../src/components/coach/MinhCoachModal';
import { LessonViewerModal } from '../../src/components/lessons/LessonViewerModal';
import { AutumnCelebration } from '../../src/components/common/AutumnCelebration';
import { VietQRDetectedCard } from '../../src/components/camera/VietQRDetectedCard';
import { EWalletDetectedCard } from '../../src/components/camera/EWalletDetectedCard';
import { PendingReturnPromptModal } from '../../src/components/camera/PendingReturnPromptModal';
import { ConfirmationPillBanner, ConfirmationInboxModal, UploadReceiptModal } from '../../src/components/inbox';
import { OnCameraPhotoOverlay } from '../../src/components/camera/OnCameraPhotoOverlay';
import { BankNotificationFloatingPill } from '../../src/components/camera/BankNotificationFloatingPill';
import { BankNotificationSettingsModal } from '../../src/components/profile/BankNotificationSettingsModal';
import { bankNotificationService } from '../../src/services/bankNotificationService';
import { useVietQRScanner } from '../../src/hooks/useVietQRScanner';
import { useConfirmationInbox } from '../../src/hooks/useConfirmationInbox';

// Stores & Services
import { useAuthStore } from '../../src/store/authStore';
import { useBudgetStore } from '../../src/store/budgetStore';
import { useWaitBasketStore } from '../../src/store/waitBasketStore';
import { useTransactionStore } from '../../src/store/transactionStore';
import { useAppPermissions } from '../../src/hooks/useCameraPermissions';
import { ParsedExpenseData } from '../../src/services/gemini';
import { scheduleAggressiveReminders, setupNotificationChannels, scheduleDailyExpenseReminder } from '../../src/services/notifications';
import { trackEvent } from '../../src/services/analytics';
import * as Notifications from 'expo-notifications';
import { optimizeExpensePhoto } from '../../src/services/imageOptimizer';
import { uploadExpensePhotoAsync, cleanOldPhotoCache } from '../../src/services/storage';
import { syncBudgetToLockScreen, handleLockScreenAction } from '../../src/services/lockScreenService';
import { formatCompactVND, formatVND } from '../../src/utils/currency';
import { PaymentMethod, Transaction, TransactionType } from '../../src/types/database';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MainAppScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tokens, isDark } = useTheme();
  const { user, profile, isAuthenticated, isLoading: authLoading, signOut } = useAuthStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, authLoading]);
  const {
    todayBudget,
    todaySpent,
    realBalance,
    savedMoney,
    recordExpense,
    recordIncome,
    recordSavedMoney,
  } = useBudgetStore();
  const { items: waitItems, addItem: addToWaitBasket } = useWaitBasketStore();
  const { transactions, addTransaction } = useTransactionStore();

  const { cameraGranted, canAskCameraAgain, requestCameraPermission, openAppSettings } = useAppPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  // Tab & Scroll State
  const [activeTabIndex, setActiveTabIndex] = useState<number>(2); // Default to Camera (Index 2 - Trang trung tâm)
  const horizontalPagerRef = useRef<ScrollView | null>(null);
  const verticalHistoryScrollRef = useRef<ScrollView | null>(null);

  // Camera Settings
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const lastTapRef = useRef<number>(0);

  // Modals & Sheets
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [capturedThumbUri, setCapturedThumbUri] = useState<string | null>(null);
  const [inFrameAmount, setInFrameAmount] = useState<number>(0);
  const [inFrameType, setInFrameType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [inFrameCategory, setInFrameCategory] = useState<string>('');
  const [showInFrameCategoryPicker, setShowInFrameCategoryPicker] = useState<boolean>(false);
  const [inFrameDescription, setInFrameDescription] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedExpenseData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showActualPrice, setShowActualPrice] = useState(false);
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<Transaction | null>(null);
  const [showMinhCoach, setShowMinhCoach] = useState(false);
  const [showLessons, setShowLessons] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAmount, setCelebrationAmount] = useState<number>(0);

  // Camera Mode [Chi | Thu | Định mua]
  const [cameraMode, setCameraMode] = useState<CameraMode>('EXPENSE');

  // History Grid Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Undo Toast (5s)
  const [undoToastVisible, setUndoToastVisible] = useState<boolean>(false);
  const [undoToastMessage, setUndoToastMessage] = useState<string>('');
  const [lastSavedOrDeletedTx, setLastSavedOrDeletedTx] = useState<{ action: 'ADD' | 'DELETE'; tx: Transaction } | null>(null);

  // Confirmation Inbox & Luồng 2 Quick Review
  const { totalCount: inboxCount, saveReceiptTransaction, addBatchPendingReceipts } = useConfirmationInbox();
  const [showInboxModal, setShowInboxModal] = useState<boolean>(false);
  const [showUploadReceiptModal, setShowUploadReceiptModal] = useState<boolean>(false);
  const [uploadPhotoUri, setUploadPhotoUri] = useState<string | null>(null);
  const [showBankSettingsFromCamera, setShowBankSettingsFromCamera] = useState<boolean>(false);

  // Locket Bank Snapshot & Fast Log State (Decision 69)
  const [activeBankSnapshotEvent, setActiveBankSnapshotEvent] = useState<ParsedBankNotification | null>(null);
  const [fastLogBankEvent, setFastLogBankEvent] = useState<ParsedBankNotification | null>(null);

  // CHỈ lấy các giao dịch đã CONFIRMED cho feed và ảnh mới nhất
  const confirmedTransactions = transactions.filter((t) => t.status === 'CONFIRMED' || (!t.status as any));

  const remainingToday = todayBudget - todaySpent;
  const pendingWaitCount = waitItems.filter((i) => i.status === 'WAITING').length;
  const latestTx = confirmedTransactions[0] || null;

  // VietQR Scanner & AppState Return Lifecycle Hook
  const {
    detectedPayload,
    detectedWalletPayload,
    handleBarcodeScanned,
    handleDismissCard,
    handleProceedPay,
    handleProceedWalletPay,
    activePendingTx,
    showReturnPrompt,
    handleConfirmPending,
    handleCancelPending,
    handleReportNoAutofill,
    activatePendingById,
  } = useVietQRScanner({
    isCameraActive,
    cameraMode,
    onTriggerActualPrice: (amount, payeeName) => {
      setParsedData({
        amount,
        description: payeeName || 'Khoản chi VietQR',
        category: 'an_uong',
        type: 'EXPENSE',
        confidence: 1.0,
      });
      setShowActualPrice(true);
    },
    actualPriceThreshold: 200000,
  });

  useEffect(() => {
    setupNotificationChannels();
    scheduleDailyExpenseReminder(21, 0).catch(() => {});
    cleanOldPhotoCache(30).catch(() => {});
    syncBudgetToLockScreen().catch(() => {});

    const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const actionId = response.actionIdentifier;
      const data = response.notification.request.content.data;

      // Xử lý tương tác từ thông báo biến động số dư ngân hàng
      if (actionId === 'ACTION_BANK_SNAPSHOT' && data?.bankEvent) {
        handleBankSnapshot(data.bankEvent as unknown as ParsedBankNotification);
        return;
      }
      if (actionId === 'ACTION_BANK_FAST_LOG' && data?.bankEvent) {
        handleBankFastLog(data.bankEvent as unknown as ParsedBankNotification);
        return;
      }

      if (actionId && actionId !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
        const res = await handleLockScreenAction(actionId);
        if (res.navigateTo === 'CAMERA') {
          handleTabPress(2);
        }
        return;
      }

      if (data?.type === 'BANK_DETECTED' && data?.bankEvent) {
        // Chạm trực tiếp vào banner thông báo ngân hàng -> Mở bảng chọn danh mục FastCategorySheet ngay
        handleBankFastLog(data.bankEvent as unknown as ParsedBankNotification);
      } else if (data?.type === 'LOCK_SCREEN_BUDGET') {
        handleTabPress(2);
      } else if (data?.itemId) {
        router.push('/(main)/wait-basket');
      } else if (data?.type === 'QR_PENDING_CONFIRM') {
        handleTabPress(2);
      }
    });

    const handleUrl = (url: string | null) => {
      if (!url) return;
      if (url.includes('camera') || url.includes('scan-qr')) {
        handleTabPress(2);
        return;
      }
      if (url.includes('today-budget') || url.includes('home')) {
        handleTabPress(0);
        return;
      }
      if (url.includes('qr-callback')) {
        handleTabPress(2);
        const match = url.match(/[?&]pendingId=([^&#]+)/);
        if (match && match[1]) {
          activatePendingById(decodeURIComponent(match[1]));
        }
      }
    };

    Linking.getInitialURL().then(handleUrl).catch(() => {});
    const urlSub = Linking.addEventListener('url', (event) => handleUrl(event.url));

    return () => {
      subscription.remove();
      urlSub.remove();
    };
  }, [router]);

  // Set default initial scroll position to Camera (Page 2 - Center)
  useEffect(() => {
    setTimeout(() => {
      horizontalPagerRef.current?.scrollTo({
        x: SCREEN_WIDTH * 2,
        y: 0,
        animated: false,
      });
    }, 50);
  }, []);

  const currentOffsetYRef = useRef<number>(0);

  const handleTabPress = (index: number) => {
    if (index === 2) {
      if (!isCameraActive) {
        setIsCameraActive(true);
      }
      // Luôn luôn quay về mặt kính Camera ở trang đầu (y = 0)
      verticalHistoryScrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
      if (activeTabIndex === 2 && currentOffsetYRef.current > 5) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        return;
      }
    }
    setActiveTabIndex(index);
    horizontalPagerRef.current?.scrollTo({
      x: SCREEN_WIDTH * index,
      y: 0,
      animated: true,
    });
  };

  const handleHorizontalScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (pageIndex !== activeTabIndex) {
      setActiveTabIndex(pageIndex);
    }
  };

  // Vertical scroll in Page 1 (Camera + History continuous)
  const handleVerticalScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    currentOffsetYRef.current = offsetY;
    // Tự động tắt Camera khi cuộn xuống sâu >85% màn hình để tiết kiệm pin
    if (offsetY > SCREEN_HEIGHT * 0.85 && isCameraActive) {
      setIsCameraActive(false);
    } else if (offsetY <= SCREEN_HEIGHT * 0.85 && !isCameraActive) {
      setIsCameraActive(true);
    }
  };

  const scrollToHistory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    verticalHistoryScrollRef.current?.scrollTo({
      y: SCREEN_HEIGHT,
      animated: true,
    });
  };

  const scrollToCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    verticalHistoryScrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const toggleCameraFacing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCameraFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlashMode((prev) => (prev === 'off' ? 'on' : prev === 'on' ? 'auto' : 'off'));
  };

  const handleDoubleTapViewfinder = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      toggleCameraFacing();
    }
    lastTapRef.current = now;
  };


  const handleCapturePhoto = async () => {
    if (!cameraGranted) {
      if (canAskCameraAgain) {
        const res = await requestCameraPermission();
        if (!res.granted) {
          Alert.alert(
            'Quyền truy cập Camera',
            'Ví Locket cần quyền Camera để chụp ảnh món đồ. Bạn có muốn mở Cài đặt hệ thống để cấp quyền không?',
            [
              { text: Strings.common.cancel, style: 'cancel' },
              { text: 'Mở Cài Đặt', onPress: openAppSettings },
            ]
          );
          setCapturedPhotoUri('https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80');
          setInFrameAmount(0);
          setInFrameType('EXPENSE');
          setInFrameCategory('');
          setShowInFrameCategoryPicker(false);
          setInFrameDescription('');
          return;
        }
      } else {
        openAppSettings();
        return;
      }
    }

    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
          skipProcessing: false,
        });
        if (photo?.uri) {
          const optimized = await optimizeExpensePhoto(photo.uri);
          setCapturedPhotoUri(optimized.fullUri);
          setCapturedThumbUri(optimized.thumbnailUri);
          if (activeBankSnapshotEvent) {
            setInFrameAmount(activeBankSnapshotEvent.amount);
            setInFrameType(activeBankSnapshotEvent.type);
            setInFrameCategory(activeBankSnapshotEvent.categoryId || '');
            setInFrameDescription(
              activeBankSnapshotEvent.isGenericContent ? '' : (activeBankSnapshotEvent.content || '')
            );
            setShowInFrameCategoryPicker(true);
          } else {
            setInFrameAmount(0);
            setInFrameType('EXPENSE');
            setInFrameCategory('');
            setShowInFrameCategoryPicker(false);
            setInFrameDescription('');
          }
          return;
        }
      }
    } catch (e) {
      console.log('Chụp ảnh thực tế lỗi, dùng fallback:', e);
    }

    const fallback = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80';
    setCapturedPhotoUri(fallback);
    setCapturedThumbUri(fallback);
    if (activeBankSnapshotEvent) {
      setInFrameAmount(activeBankSnapshotEvent.amount);
      setInFrameType(activeBankSnapshotEvent.type);
      setInFrameCategory(activeBankSnapshotEvent.categoryId || '');
      setInFrameDescription(
        activeBankSnapshotEvent.isGenericContent ? '' : (activeBankSnapshotEvent.content || '')
      );
      setShowInFrameCategoryPicker(true);
    } else {
      setInFrameAmount(0);
      setInFrameType('EXPENSE');
      setInFrameCategory('');
      setShowInFrameCategoryPicker(false);
      setInFrameDescription('');
    }
  };

  // Handlers for Locket Bank Snapshot & Fast Log (Decision 69)
  const handleBankSnapshot = (detected: ParsedBankNotification) => {
    setActiveBankSnapshotEvent(detected);
    setInFrameAmount(detected.amount);
    setInFrameType(detected.type);
    setInFrameCategory(detected.categoryId || '');
    setInFrameDescription(detected.isGenericContent ? '' : (detected.content || ''));
    handleTabPress(2);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleBankFastLog = (detected: ParsedBankNotification) => {
    setFastLogBankEvent(detected);
  };

  const handleSaveInFramePhoto = async () => {
    // 1. Bắt buộc người dùng phải chọn danh mục
    if (!inFrameCategory) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setShowInFrameCategoryPicker(true);
      setUndoToastMessage('Vui lòng chọn danh mục cho khoản này');
      setUndoToastVisible(true);
      return;
    }

    // 2. Bắt buộc người dùng phải nhập số tiền > 0
    if (inFrameAmount <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setUndoToastMessage('Vui lòng nhập số tiền');
      setUndoToastVisible(true);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const userId = user?.id || 'demo-user';
    const finalAmount = inFrameAmount;
    const isBank = Boolean(activeBankSnapshotEvent);
    const bankTag = activeBankSnapshotEvent?.bankCode && activeBankSnapshotEvent.bankCode !== 'OTHER'
      ? `[${activeBankSnapshotEvent.bankCode}]`
      : activeBankSnapshotEvent ? `[${activeBankSnapshotEvent.bankName}]` : '';

    const fallbackDesc = inFrameCategory
      ? `${inFrameCategory} ${bankTag}`.trim()
      : (inFrameType === 'EXPENSE' ? 'Chi tiêu bằng ảnh' : 'Thu nhập');
    const finalDesc = inFrameDescription.trim() || fallbackDesc;

    const tx = await addTransaction({
      userId,
      amount: finalAmount,
      type: inFrameType,
      category: inFrameCategory,
      description: finalDesc,
      photo_url: capturedPhotoUri,
      thumbnail_url: capturedThumbUri || capturedPhotoUri,
      payment_method: isBank ? 'BANK' : 'CASH',
      source: 'PHOTO',
      status: 'CONFIRMED',
    });

    if (capturedPhotoUri) {
      uploadExpensePhotoAsync({
        userId,
        transactionId: tx.id,
        fullPhotoUri: capturedPhotoUri,
        thumbnailUri: capturedThumbUri || undefined,
      }).catch(() => {});

      // Nếu có sự kiện thông báo ngân hàng vừa đến, tự động gắn ảnh vào giao dịch ngân hàng đó
      bankNotificationService.attachPhotoToLatestTransaction(capturedPhotoUri).catch(() => {});
    }

    setActiveBankSnapshotEvent(null);
    setLastSavedOrDeletedTx({ action: 'ADD', tx });
    setUndoToastMessage(`Đã lưu khoảnh khắc: ${formatVND(finalAmount)}`);
    setUndoToastVisible(true);
    setCapturedPhotoUri(null);
    setCapturedThumbUri(null);

    // Cuộn nhẹ xuống dòng khoảnh khắc để xem ảnh vừa chụp
    setTimeout(() => {
      verticalHistoryScrollRef.current?.scrollTo({ y: SCREEN_HEIGHT * 0.45, animated: true });
    }, 300);
  };



  const handlePickImageFromLibrary = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    trackEvent('upload_tapped');
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập ảnh',
          'Ví Locket cần quyền truy cập thư viện ảnh để bạn tải ảnh hóa đơn / biến động số dư.'
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        trackEvent('upload_images_selected', { count: result.assets.length });
        const firstAsset = result.assets[0];
        setUploadPhotoUri(firstAsset.uri);
        setShowUploadReceiptModal(true);

        if (result.assets.length > 1) {
          const remaining = result.assets.slice(1);
          await addBatchPendingReceipts(
            remaining.map((asset) => ({
              photoUri: asset.uri,
              amount: 0,
              category: 'an_uong',
              description: 'Ảnh giao dịch tải lên',
            }))
          );
          Alert.alert(
            'Đã tải nhiều ảnh',
            `Đang mở ảnh 1/${result.assets.length}. ${remaining.length} ảnh còn lại đã được chuyển vào Hộp Xác Nhận để bạn duyệt thong thả.`
          );
        }
      }
    } catch (error) {
      console.log('Lỗi chọn ảnh từ thư viện:', error);
      Alert.alert('Không thể mở ảnh', 'Vui lòng thử lại sau.');
    }
  };

  const handleOpenTextQuickRecord = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCapturedPhotoUri(null);
    setCapturedThumbUri(null);
    setParsedData({
      amount: 0,
      description: '',
      category: cameraMode === 'INCOME' ? 'thu_nhap' : 'an_uong',
      confidence: 1,
      type: cameraMode === 'INCOME' ? 'INCOME' : 'EXPENSE',
    });
    setShowConfirmation(true);
  };

  const handleConfirmBought = async (data: {
    amount: number;
    description: string;
    category: string;
    type: TransactionType;
    paymentMethod: PaymentMethod;
  }) => {
    const userId = user?.id || 'demo-user';

    const tx = await useTransactionStore.getState().addTransaction({
      userId,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      photo_url: capturedPhotoUri,
      thumbnail_url: capturedThumbUri || capturedPhotoUri,
      payment_method: data.paymentMethod,
      source: 'MANUAL',
    });

    if (capturedPhotoUri) {
      uploadExpensePhotoAsync({
        userId,
        transactionId: tx.id,
        fullPhotoUri: capturedPhotoUri,
        thumbnailUri: capturedThumbUri || undefined,
      }).catch(() => {});
    }

    if (data.type === 'INCOME') {
      Alert.alert('Thu nhập mới!', `Đã cộng +${formatVND(data.amount)} vào số dư.`);
    } else {
      Alert.alert('Đã lưu vào sổ!', `Ghi nhận chi tiêu: ${formatVND(data.amount)} (${data.description}).`);
    }

    setShowConfirmation(false);
    setCapturedPhotoUri(null);
    setCapturedThumbUri(null);

    // Kích hoạt thanh hoàn tác 5 giây thay cho alert chặn giao diện
    setLastSavedOrDeletedTx({ action: 'ADD', tx });
    setUndoToastMessage(Strings.camera.undoToast(formatVND(data.amount)));
    setUndoToastVisible(true);
  };

  const handleUndo = async () => {
    if (!lastSavedOrDeletedTx) return;
    if (lastSavedOrDeletedTx.action === 'ADD') {
      await useTransactionStore.getState().deleteTransaction(lastSavedOrDeletedTx.tx.id);
    } else if (lastSavedOrDeletedTx.action === 'DELETE') {
      await useTransactionStore.getState().addTransaction({
        userId: lastSavedOrDeletedTx.tx.user_id,
        type: lastSavedOrDeletedTx.tx.type,
        amount: lastSavedOrDeletedTx.tx.amount,
        category: lastSavedOrDeletedTx.tx.category,
        description: lastSavedOrDeletedTx.tx.description,
        photo_url: lastSavedOrDeletedTx.tx.photo_url,
        thumbnail_url: lastSavedOrDeletedTx.tx.thumbnail_url,
        payment_method: lastSavedOrDeletedTx.tx.payment_method,
        source: lastSavedOrDeletedTx.tx.source,
      });
    }
    setUndoToastVisible(false);
    setLastSavedOrDeletedTx(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleOpenActualPriceDecision = () => {
    setShowConfirmation(false);
    setShowActualPrice(true);
  };

  const handleActualPriceBuyAnyway = async () => {
    const amount = parsedData?.amount || 45000;
    const desc = parsedData?.description || 'Món đồ vừa mua';
    const cat = parsedData?.category || 'an_uong';
    const userId = user?.id || 'demo-user';

    const tx = await useTransactionStore.getState().addTransaction({
      userId,
      type: 'EXPENSE',
      amount,
      category: cat,
      description: desc,
      photo_url: capturedPhotoUri,
      thumbnail_url: capturedThumbUri || capturedPhotoUri,
      payment_method: 'BANK',
      source: 'MANUAL',
    });

    if (capturedPhotoUri) {
      uploadExpensePhotoAsync({
        userId,
        transactionId: tx.id,
        fullPhotoUri: capturedPhotoUri,
        thumbnailUri: capturedThumbUri || undefined,
      }).catch(() => {});
    }

    setShowActualPrice(false);
    setCapturedPhotoUri(null);
    setCapturedThumbUri(null);
    Alert.alert(Strings.actualPrice.buyAnyway, `Đã lưu khoản chi: ${formatVND(amount)}.`);
  };

  const handleActualPriceSaveLater = async () => {
    const amount = parsedData?.amount || 45000;
    const desc = parsedData?.description || 'Món đồ cân nhắc';
    const cat = parsedData?.category || 'an_uong';
    const userId = user?.id || 'demo-user';

    const addedItem = await addToWaitBasket({
      user_id: userId,
      item_name: desc,
      amount,
      category: cat,
      photo_url: capturedPhotoUri,
      remind_interval_hours: 2,
      next_remind_at: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      decided_at: null,
    });

    await scheduleAggressiveReminders({
      itemId: addedItem.id,
      itemName: addedItem.item_name,
      amount: addedItem.amount,
    });

    setShowActualPrice(false);
    setCapturedPhotoUri(null);
    Alert.alert(
      Strings.actualPrice.saveForLater,
      `Món "${desc}" đã chuyển vào danh sách Để Sau. Chúng mình sẽ nhắc bạn sau 2 tiếng!`
    );
  };

  const handleActualPriceSkipSave = () => {
    const amount = parsedData?.amount || 45000;
    recordSavedMoney(amount);
    setShowActualPrice(false);
    setCapturedPhotoUri(null);

    setCelebrationAmount(amount);
    setShowCelebration(true);
  };

  // Filter Transactions in History Grid
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      (tx.description && tx.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.category && tx.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategoryFilter === 'all') return true;
    if (selectedCategoryFilter === 'expense') return tx.type === 'EXPENSE';
    if (selectedCategoryFilter === 'income') return tx.type === 'INCOME';
    return tx.category === selectedCategoryFilter;
  });

  if (authLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isDark ? '#0E1620' : '#FAF6EC',
        }}
      >
        <ActivityIndicator size="large" color={Colors.accentGold} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={[styles.rootContainer, { backgroundColor: isDark ? '#0E1620' : '#FAF6EC' }]}>
      <BankClipboardToast
        onSnapshot={handleBankSnapshot}
        onFastLog={handleBankFastLog}
      />
      <FastCategorySheet
        visible={fastLogBankEvent !== null}
        bankEvent={fastLogBankEvent}
        onClose={() => setFastLogBankEvent(null)}
        onSuccess={() => {
          setFastLogBankEvent(null);
          setUndoToastMessage('Đã lưu giao dịch vào Sổ thành công');
          setUndoToastVisible(true);
        }}
      />
      <AutumnCelebration
        visible={showCelebration}
        savedAmount={celebrationAmount}
        onFinish={() => setShowCelebration(false)}
      />

      {/* 4-PAGE HORIZONTAL PAGER */}
      <ScrollView
        ref={horizontalPagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleHorizontalScrollEnd}
        style={styles.pager}
      >
        {/* ================= PAGE 0: HOME ================= */}
        <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
          <JournalView
            onOpenTransactionDetail={(tx) => {
              setSelectedTxForDetail(tx);
              setShowActualPrice(true);
            }}
            onOpenProfile={() => handleTabPress(4)}
            onOpenCamera={() => handleTabPress(2)}
          />
        </View>

        {/* ================= PAGE 1: THỐNG KÊ (ALBUM THEO THÁNG) ================= */}
        <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
          <StatsView onNavigateToCamera={() => handleTabPress(2)} />
        </View>

        {/* ================= PAGE 2: CAMERA + HISTORY CONTINUOUS ================= */}
        <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
          <ScrollView
            ref={verticalHistoryScrollRef}
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={SCREEN_HEIGHT}
            snapToAlignment="start"
            showsVerticalScrollIndicator={false}
            onScroll={handleVerticalScroll}
            scrollEventThrottle={16}
            style={[styles.verticalScroll, { backgroundColor: isDark ? '#0E1620' : '#FAF6EC' }]}
          >
            {/* --- TOP 100vh: CAMERA VIEWFINDER WITH CINEMATIC GRADIENT --- */}
            <LinearGradient
              colors={
                isDark
                  ? ['#1A2433', '#161F2C', '#101722', '#0E1620']
                  : ['#222A33', '#39424D', '#8C8880', '#FAF6EC']
              }
              locations={[0, 0.42, 0.80, 1.0]}
              style={[styles.cameraScreenSection, { height: SCREEN_HEIGHT }]}
            >
              {/* TOP HEADER CONTROLS OVER CAMERA */}
              <View style={[styles.cameraTopHeader, { paddingTop: insets.top + Spacing.sm }]}>
                {/* FLASH TOGGLE */}
                <TouchableOpacity
                  style={styles.headerIconButton}
                  onPress={toggleFlash}
                  activeOpacity={0.8}
                >
                  {flashMode === 'off' ? (
                    <ZapOff size={18} color="#FFFFFF" strokeWidth={2.5} />
                  ) : (
                    <Zap size={18} color={Colors.primaryYellow} strokeWidth={2.8} />
                  )}
                </TouchableOpacity>

                {/* "HÔM NAY TIÊU ĐƯỢC" REFINED PILL CHIP */}
                <TouchableOpacity
                  onPress={() => handleTabPress(0)}
                  activeOpacity={0.85}
                  style={styles.todayBudgetChipWrapper}
                >
                  <Chip
                    label={`${Strings.budget.dailyAllowance}: ${formatCompactVND(remainingToday)}`}
                    statusDot={remainingToday > todayBudget * 0.2 ? 'warning' : 'danger'}
                    size="sm"
                    style={{
                      borderWidth: 0,
                      backgroundColor: isDark ? 'rgba(20, 26, 36, 0.72)' : 'rgba(255, 255, 255, 0.85)',
                    }}
                  />
                </TouchableOpacity>

                {/* COACH MINH & WAIT BASKET SHORTCUTS */}
                <View style={styles.topRightControls}>
                  <TouchableOpacity
                    style={styles.minhCoachBadge}
                    onPress={() => setShowMinhCoach(true)}
                    activeOpacity={0.8}
                  >
                    <MinhAvatar size="sm" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.headerIconButton}
                    onPress={() => setShowBankSettingsFromCamera(true)}
                    activeOpacity={0.8}
                  >
                    <Bell size={18} color={Colors.accentOrange} strokeWidth={2.4} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.headerIconButton}
                    onPress={() => router.push('/(main)/wait-basket')}
                    activeOpacity={0.8}
                  >
                    <Hourglass size={18} color={Colors.primaryYellow} strokeWidth={2.5} />
                    {pendingWaitCount > 0 && (
                      <View style={styles.badgeNumber}>
                        <Text style={styles.badgeNumberText}>{pendingWaitCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* BANNER NỔI LOCKET BANK SNAPSHOT */}
              {activeBankSnapshotEvent && (
                <View style={styles.activeBankBanner}>
                  <View style={[styles.bankSmallBadge, { backgroundColor: activeBankSnapshotEvent.brandColor }]}>
                    <Text style={styles.bankSmallBadgeText}>{activeBankSnapshotEvent.bankCode}</Text>
                  </View>
                  <Text style={styles.activeBankBannerText} numberOfLines={1}>
                    Ghim số tiền:{' '}
                    <Text style={{ fontWeight: '800', color: '#E59844' }}>
                      {formatVND(activeBankSnapshotEvent.amount)}
                    </Text>
                    {' '}• Bấm Shutter để chụp món đồ
                  </Text>
                  <TouchableOpacity
                    onPress={() => setActiveBankSnapshotEvent(null)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{ padding: 4 }}
                  >
                    <X size={15} color="#FFFFFF" strokeWidth={2.4} />
                  </TouchableOpacity>
                </View>
              )}

              {/* BANNER NỔI THÔNG BÁO NGÂN HÀNG (3-IN-1 QUICK HUB) */}
              <BankNotificationFloatingPill />

              {/* DẢI THÔNG BÁO HỘP XÁC NHẬN NỔI Ở CAMERA */}
              {inboxCount > 0 && (
                <ConfirmationPillBanner
                  count={inboxCount}
                  onPress={() => setShowInboxModal(true)}
                  style={{ marginBottom: 6 }}
                />
              )}

              {/* CAMERA VIEWFINDER (LOCKET SQUIRCLE FRAME 38PX HOẶC ẢNH VỪA CHỤP) */}
              <View style={styles.viewfinderContainer}>
                {capturedPhotoUri ? (
                  <OnCameraPhotoOverlay
                    photoUri={capturedPhotoUri}
                    amount={inFrameAmount}
                    onAmountChange={setInFrameAmount}
                    category={inFrameCategory}
                    onCategoryChange={(cat) => {
                      setInFrameCategory(cat);
                      setShowInFrameCategoryPicker(false);
                    }}
                    showCategoryPicker={showInFrameCategoryPicker}
                    onToggleCategoryPicker={() => setShowInFrameCategoryPicker((prev) => !prev)}
                    description={inFrameDescription}
                    onDescriptionChange={setInFrameDescription}
                    onCancel={() => {
                      setCapturedPhotoUri(null);
                      setCapturedThumbUri(null);
                      setInFrameAmount(0);
                      setInFrameCategory('');
                      setShowInFrameCategoryPicker(false);
                    }}
                  />
                ) : (
                  <Pressable
                    style={styles.viewfinder}
                    onPress={handleDoubleTapViewfinder}
                  >
                    {cameraGranted && isCameraActive ? (
                      <CameraView
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        facing={cameraFacing}
                        enableTorch={flashMode === 'on'}
                        barcodeScannerSettings={{
                          barcodeTypes: ['qr'],
                        }}
                        onBarcodeScanned={handleBarcodeScanned}
                      />
                    ) : (
                      <View style={styles.permissionFallback}>
                        <Camera size={44} color="#666666" strokeWidth={2} />
                        <Text style={styles.permissionText}>
                          Chạm đúp để kiểm tra hoặc cấp quyền Camera
                        </Text>
                        <BlockButton
                          title="Mở Cài Đặt"
                          onPress={openAppSettings}
                          variant="secondary"
                          size="sm"
                        />
                      </View>
                    )}
                  </Pressable>
                )}
              </View>

              {/* CỤM NÚT GẠT [ CHI | THU ] SÁT DƯỚI NGOÀI KHUNG CAMERA KHI ĐÃ CHỤP */}
              {capturedPhotoUri && (
                <View style={styles.outsideTypeSegmentWrapper}>
                  <View
                    style={[
                      styles.outsideTypeSegmentContainer,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.outsideTypeButton,
                        inFrameType === 'EXPENSE' && {
                          backgroundColor: '#C86D51',
                          shadowColor: '#C86D51',
                          shadowOpacity: 0.3,
                          shadowRadius: 6,
                          elevation: 3,
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setInFrameType('EXPENSE');
                      }}
                      activeOpacity={0.8}
                    >
                      <ArrowUpRight
                        size={15}
                        color={inFrameType === 'EXPENSE' ? '#FFFFFF' : isDark ? 'rgba(255, 255, 255, 0.6)' : '#666666'}
                        strokeWidth={2.5}
                      />
                      <Text
                        style={[
                          styles.outsideTypeText,
                          {
                            color: inFrameType === 'EXPENSE' ? '#FFFFFF' : isDark ? 'rgba(255, 255, 255, 0.7)' : '#555555',
                            fontWeight: inFrameType === 'EXPENSE' ? '700' : '500',
                          },
                        ]}
                      >
                        Chi
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.outsideTypeButton,
                        inFrameType === 'INCOME' && {
                          backgroundColor: '#7E9F80',
                          shadowColor: '#7E9F80',
                          shadowOpacity: 0.3,
                          shadowRadius: 6,
                          elevation: 3,
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setInFrameType('INCOME');
                      }}
                      activeOpacity={0.8}
                    >
                      <ArrowDownLeft
                        size={15}
                        color={inFrameType === 'INCOME' ? '#FFFFFF' : isDark ? 'rgba(255, 255, 255, 0.6)' : '#666666'}
                        strokeWidth={2.5}
                      />
                      <Text
                        style={[
                          styles.outsideTypeText,
                          {
                            color: inFrameType === 'INCOME' ? '#FFFFFF' : isDark ? 'rgba(255, 255, 255, 0.7)' : '#555555',
                            fontWeight: inFrameType === 'INCOME' ? '700' : '500',
                          },
                        ]}
                      >
                        Thu
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* THẺ PHÁT HIỆN MÃ VIETQR TRƯỢT LÊN TRÊN NÚT CHỤP */}
              {detectedPayload && (
                <View style={styles.vietQRCardWrapper}>
                  <VietQRDetectedCard
                    payload={detectedPayload}
                    onDismiss={handleDismissCard}
                    onProceedPay={handleProceedPay}
                    onManualRecord={() => {
                      handleDismissCard();
                      handleOpenTextQuickRecord();
                    }}
                    onOpenUploadReceipt={() => {
                      handleDismissCard();
                      setShowUploadReceiptModal(true);
                    }}
                  />
                </View>
              )}

              {/* THẺ PHÁT HIỆN VÍ ĐIỆN TỬ (ZALOPAY / MOMO) TRƯỢT LÊN TRÊN NÚT CHỤP */}
              {detectedWalletPayload && (
                <View style={styles.vietQRCardWrapper}>
                  <EWalletDetectedCard
                    wallet={detectedWalletPayload}
                    onDismiss={handleDismissCard}
                    onProceedPay={handleProceedWalletPay}
                    onManualRecord={() => {
                      handleDismissCard();
                      handleOpenTextQuickRecord();
                    }}
                  />
                </View>
              )}

              {/* KHI ĐANG REVIEW TRÊN KHUNG CAMERA: NÚT LƯU TO BẢN ĐỒNG BỘ THEME HÀ NỘI THU ĐÔNG */}
              {capturedPhotoUri ? (
                <View style={[styles.cameraBottomBar, { paddingBottom: insets.bottom + 80, justifyContent: 'center' }]}>
                  {(() => {
                    const isSaveReady = Boolean(inFrameCategory) && inFrameAmount > 0;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.inFrameSaveButton,
                          {
                            backgroundColor: inFrameType === 'INCOME' ? '#7E9F80' : '#E59844',
                            shadowColor: inFrameType === 'INCOME' ? '#7E9F80' : '#E59844',
                            opacity: isSaveReady ? 1 : 0.55,
                          },
                        ]}
                        onPress={handleSaveInFramePhoto}
                        activeOpacity={0.85}
                      >
                        <Check size={20} color="#0E1620" strokeWidth={2.8} />
                        <Text style={styles.inFrameSaveButtonText}>Lưu vào sổ</Text>
                      </TouchableOpacity>
                    );
                  })()}
                </View>
              ) : (
                <>
                  {/* NÚT PILL NỔI MINI "✍️ GHI NHANH" TRÊN NÚT CHỤP (BORDER-LESS GLASS) */}
                  <View style={styles.quickRecordPillWrapper}>
                    <TouchableOpacity
                      style={[
                        styles.quickRecordFloatingPill,
                        {
                          backgroundColor: isDark ? 'rgba(20, 26, 36, 0.72)' : 'rgba(255, 255, 255, 0.85)',
                        },
                      ]}
                      onPress={handleOpenTextQuickRecord}
                      activeOpacity={0.8}
                    >
                      <PenLine size={13} color={tokens.primary} strokeWidth={2.2} />
                      <Text style={[styles.quickRecordFloatingText, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                        Ghi nhanh
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* BOTTOM CAMERA ACTIONS (PHOTOBOOTH STYLE — BORDER-LESS GLASS) */}
                  <View style={[styles.cameraBottomBar, { paddingBottom: insets.bottom + 80 }]}>
                    {/* Left: Upload Photo from Library */}
                    <TouchableOpacity
                      style={[
                        styles.bottomToolButton,
                        {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.45)',
                        },
                      ]}
                      onPress={handlePickImageFromLibrary}
                      activeOpacity={0.8}
                    >
                      <ImagePlus size={20} color={isDark ? '#FFFFFF' : '#1B2733'} strokeWidth={2} />
                    </TouchableOpacity>

                    {/* Center: Tactile Shutter Button */}
                    <ShutterButton
                      onCapturePhoto={handleCapturePhoto}
                    />

                    {/* Right: Flip Camera Button */}
                    <TouchableOpacity
                      style={[
                        styles.bottomToolButton,
                        {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.45)',
                        },
                      ]}
                      onPress={toggleCameraFacing}
                      activeOpacity={0.8}
                    >
                      <RotateCcw size={20} color={isDark ? '#FFFFFF' : '#1B2733'} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* CHỈ DẪN TRƯỢT LÊN SANG TRANG LỊCH SỬ KHI KHÔNG ĐANG REVIEW ẢNH */}
              {!capturedPhotoUri && (
                <TouchableOpacity
                  style={[styles.historySwipeIndicator, { bottom: insets.bottom + 68 }]}
                  onPress={scrollToHistory}
                  activeOpacity={0.75}
                >
                  <ChevronUp size={14} color={isDark ? 'rgba(255, 255, 255, 0.75)' : '#4A5568'} strokeWidth={2.4} />
                  <Text style={[styles.historySwipeText, { color: isDark ? 'rgba(255, 255, 255, 0.75)' : '#4A5568' }]}>
                    Lịch sử
                  </Text>
                </TouchableOpacity>
              )}
            </LinearGradient>

            {/* --- DÒNG KHOẢNH KHẮC LIÊN TỤC CHUẨN LOCKET (HÌNH #3) --- */}
            <View
              style={[
                styles.historyContainer,
                {
                  minHeight: SCREEN_HEIGHT,
                  paddingTop: insets.top + spacing.sm,
                  backgroundColor: isDark ? '#0E1620' : '#FAF6EC',
                },
              ]}
            >
              {/* NÚT TRỞ LẠI CAMERA Ở ĐỈNH LỊCH SỬ */}
              <TouchableOpacity
                style={styles.backToCameraPill}
                onPress={scrollToCamera}
                activeOpacity={0.8}
              >
                <ChevronDown size={14} color={tokens.textMuted} strokeWidth={2.5} />
                <Text style={[styles.backToCameraText, { color: tokens.textMuted }]}>
                  Trở lại Camera
                </Text>
              </TouchableOpacity>
              {confirmedTransactions.map((tx) => (
                <LocketMomentCard
                  key={tx.id}
                  item={tx}
                  isMasked={false}
                  onPress={(item) => {
                    setSelectedTxForDetail(item);
                    setShowActualPrice(true);
                  }}
                />
              ))}

              {confirmedTransactions.length === 0 && (
                <View style={styles.emptyGridContainer}>
                  <Leaf size={32} color={tokens.textMuted} strokeWidth={2} />
                  <Text style={[styles.emptyGridText, { color: tokens.textMuted }]}>
                    Chưa có khoảnh khắc nào. Chụp thử món đầu tiên nhé!
                  </Text>
                </View>
              )}

              {/* Extra spacing for Bottom Tab Bar */}
              <View style={{ height: insets.bottom + 90 }} />
            </View>
          </ScrollView>
        </View>

        {/* ================= PAGE 3: CHAT / BẠN BÈ ================= */}
        <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
          <ChatView
            onNavigateToStats={() => handleTabPress(1)}
            onNavigateToCamera={() => handleTabPress(2)}
          />
        </View>

        {/* ================= PAGE 4: HỒ SƠ (PROFILE) ================= */}
        <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
          <ProfileView
            onSignOut={async () => {
              await signOut();
              router.replace('/(auth)/login');
            }}
            onOpenLessons={() => setShowLessons(true)}
          />
        </View>
      </ScrollView>

      {/* FLOATING PILL TAB BAR ACROSS ALL 4 PAGES */}
      <FloatingPillTabBar
        activeIndex={activeTabIndex}
        onSelectTab={handleTabPress}
        screenWidth={SCREEN_WIDTH}
      />

      {/* CONFIRMATION SHEET (POLAROID REVIEW AFTER CAPTURE) */}
      <ConfirmationSheet
        visible={showConfirmation}
        photoUri={capturedPhotoUri}
        initialAmount={parsedData?.amount || 0}
        initialDescription={parsedData?.description || ''}
        initialCategory={parsedData?.category || (cameraMode === 'INCOME' ? 'thu_nhap' : 'an_uong')}
        initialType={parsedData?.type || (cameraMode === 'INCOME' ? 'INCOME' : 'EXPENSE')}
        onClose={() => setShowConfirmation(false)}
        onPickPhoto={handlePickImageFromLibrary}
        onConfirmBought={handleConfirmBought}
        onAskBeforeBuy={handleOpenActualPriceDecision}
      />

      {/* ACTUAL PRICE DECISION SHEET ("GIÁ THẬT") */}
      <ActualPriceSheet
        visible={showActualPrice}
        photoUri={selectedTxForDetail?.photo_url || capturedPhotoUri}
        description={selectedTxForDetail?.description || parsedData?.description || 'Món đồ cân nhắc'}
        amount={selectedTxForDetail?.amount || parsedData?.amount || 45000}
        hourlyWage={profile?.hourly_rate || 35000}
        dailyBudget={todayBudget}
        onClose={() => {
          setShowActualPrice(false);
          setSelectedTxForDetail(null);
        }}
        onConfirmBuy={handleActualPriceBuyAnyway}
        onSaveLater={handleActualPriceSaveLater}
        onSkipSave={handleActualPriceSkipSave}
        onAskMinhCoach={() => {
          setShowActualPrice(false);
          handleTabPress(3); // Chuyển sang Tab Chat với Anh Minh
        }}
      />

      {/* MINH COACH MODAL */}
      <MinhCoachModal
        visible={showMinhCoach}
        onClose={() => setShowMinhCoach(false)}
      />

      {/* LESSON VIEWER MODAL */}
      <LessonViewerModal
        visible={showLessons}
        onClose={() => setShowLessons(false)}
      />

      {/* THANH HOÀN TÁC 5 GIÂY (UNDO TOAST) */}
      <UndoToastBar
        visible={undoToastVisible}
        message={undoToastMessage}
        durationMs={5000}
        onUndo={handleUndo}
        onExpire={() => {
          setUndoToastVisible(false);
          setLastSavedOrDeletedTx(null);
        }}
        bottomOffset={insets.bottom + 80}
      />

      {/* THẺ HỎI XÁC NHẬN "ĐÃ CHUYỂN XONG CHƯA?" KHI QUAY LẠI TỪ APP NGÂN HÀNG */}
      <PendingReturnPromptModal
        visible={showReturnPrompt}
        transaction={activePendingTx}
        onConfirm={handleConfirmPending}
        onCancel={handleCancelPending}
        onReportNoAutofill={handleReportNoAutofill}
        onOpenUploadReceipt={() => {
          setShowUploadReceiptModal(true);
        }}
        onPromptTakePhoto={() => {
          handleTabPress(2);
        }}
      />

      {/* MODAL XEM LẠI NHANH ẢNH BIÊN LAI (LUỒNG 2) */}
      <UploadReceiptModal
        visible={showUploadReceiptModal}
        initialPhotoUri={uploadPhotoUri}
        onClose={() => {
          setShowUploadReceiptModal(false);
          setUploadPhotoUri(null);
        }}
        onSave={async (params) => {
          setShowUploadReceiptModal(false);
          setUploadPhotoUri(null);
          const tx = await saveReceiptTransaction(params);
          setLastSavedOrDeletedTx({ action: 'ADD', tx });
          setUndoToastMessage(Strings.camera.undoToast(formatVND(params.amount)));
          setUndoToastVisible(true);
        }}
        onBatchUploaded={(items) => {
          addBatchPendingReceipts(items);
        }}
      />

      {/* MODAL HỘP XÁC NHẬN TOÀN DIỆN */}
      <ConfirmationInboxModal
        visible={showInboxModal}
        onClose={() => setShowInboxModal(false)}
      />

      {/* MODAL CÀI ĐẶT & THỬ NGHIỆM THÔNG BÁO NGÂN HÀNG (3-IN-1 QUICK HUB) */}
      <BankNotificationSettingsModal
        visible={showBankSettingsFromCamera}
        onClose={() => setShowBankSettingsFromCamera(false)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  vietQRCardWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 140,
    zIndex: 99,
  },
  pager: {
    flex: 1,
  },
  verticalScroll: {
    flex: 1,
  },
  cameraScreenSection: {
    width: SCREEN_WIDTH,
    position: 'relative',
    justifyContent: 'space-between',
  },
  cameraTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    zIndex: 20,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  todayBudgetChipWrapper: {
    alignItems: 'center',
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  minhCoachBadge: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeNumber: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#E5786A',
    borderRadius: radii.full,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeNumberText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  viewfinderContainer: {
    width: SCREEN_WIDTH - 24,
    maxHeight: SCREEN_HEIGHT * 0.52,
    aspectRatio: 4 / 5,
    alignSelf: 'center',
    marginVertical: spacing.xs,
    borderRadius: 38,
    borderWidth: 0,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0E1620',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  viewfinder: {
    flex: 1,
    position: 'relative',
  },
  permissionFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#162231',
    gap: spacing.md,
  },
  permissionText: {
    color: '#A3B0BF',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  // 4 Corner Brackets (18x18, 1.5px delicate gold hairline guides)
  cornerBracket: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: 'rgba(246, 184, 0, 0.65)',
    zIndex: 10,
  },
  bracketTL: {
    top: 14,
    left: 14,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopLeftRadius: 4,
  },
  bracketTR: {
    top: 14,
    right: 14,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopRightRadius: 4,
  },
  bracketBL: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomLeftRadius: 4,
  },
  bracketBR: {
    bottom: 14,
    right: 14,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomRightRadius: 4,
  },
  quickRecordPillWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    zIndex: 15,
  },
  quickRecordFloatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radii.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  quickRecordFloatingText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cameraBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    zIndex: 20,
  },
  bottomToolButton: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  outsideTypeSegmentWrapper: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  outsideTypeSegmentContainer: {
    flexDirection: 'row',
    borderRadius: 22,
    padding: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  outsideTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 7,
    borderRadius: 19,
    gap: 5,
  },
  outsideTypeText: {
    fontSize: 13,
  },
  inFrameSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    width: '88%',
    borderRadius: 26,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  inFrameSaveButtonText: {
    color: '#0E1620',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  historySwipeIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 25,
  },
  historySwipeText: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  backToCameraPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: spacing.sm,
  },
  backToCameraText: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyPeekTab: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 25,
  },
  peekTabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(14, 22, 32, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  peekTabText: {
    color: '#FAF6EC',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // HISTORY SECTION
  historyContainer: {
    backgroundColor: '#0E1620',
  },
  historyStickyHeader: {
    backgroundColor: Colors.bgDark,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 3,
    borderBottomColor: '#000000',
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  backToCamBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.primaryYellow,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyTitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  historyCountText: {
    color: Colors.primaryYellow,
    fontSize: 13,
    fontWeight: '800',
  },
  historyListPadding: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  dayGroupWrapper: {
    marginBottom: 16,
  },
  dayGroupHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#162231',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 4,
  },
  dayGroupDateText: {
    color: '#FAF6EC',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayGroupStatsText: {
    color: '#FFC93C',
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  dayGridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 13,
  },
  cellColumn: {
    width: '33.333%',
    padding: 0,
  },
  emptyGridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.sm,
  },
  emptyGridText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '700',
  },
  activeBankBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 22, 32, 0.92)',
    borderRadius: radii.full,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1.2,
    borderColor: '#E59844',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bankSmallBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bankSmallBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  activeBankBannerText: {
    flex: 1,
    color: '#FAF6EC',
    fontSize: 12,
    fontWeight: '600',
  },
});
