import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Modal,
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
  Linking, Platform, ScrollViewInstance } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import {
  Mic,
  Bell,
  BookOpen,
  Calendar,
  Camera,
  Check,
  Minus,
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
  Images,
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
  ZapOff } from 'lucide-react-native';
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
import { PigBoMascot, PigFlyMascot } from '../../src/components/mascot/PigBoMascot';
import { ModeSwitchPill, CameraMode } from '../../src/components/camera/ModeSwitchPill';
import { LocketMomentCard } from '../../src/components/camera/LocketMomentCard';
import { UndoToastBar } from '../../src/components/common/UndoToastBar';
import { BankClipboardToast } from '../../src/components/common/BankClipboardToast';
import { FastCategorySheet } from '../../src/components/cards/FastCategorySheet';
import { ParsedBankNotification } from '../../src/utils/bankNotificationParser';
import { groupTransactionsByDay } from '../../src/utils/cameraUtils';
import {
  getCachedLocationSync,
  getLocationPermissionStatusAsync,
  getQuickPinCoordsIfOptedIn,
  prewarmLocationAsync,
  requestLocationPermissionAsync,
  reverseGeocodePlaceAsync,
} from '../../src/services/locationService';

// Views
import { JournalView } from '../../src/components/views/JournalView';
import { StatsView } from '../../src/components/views/StatsView';
import { ChatView } from '../../src/components/views/ChatView';
import { ProfileView } from '../../src/components/views/ProfileView';

// Modals & Sheets
import { ConfirmationSheet } from '../../src/components/cards/ConfirmationSheet';
import { ActualPriceSheet } from '../../src/components/cards/ActualPriceSheet';
import {
  FirstLaunchPermissionsModal,
  STORAGE_KEY_FIRST_PERMISSIONS_PROMPTED,
} from '../../src/components/common/FirstLaunchPermissionsModal';
import { MinhAvatar } from '../../src/components/coach/MinhAvatar';
import { MinhCoachModal } from '../../src/components/coach/MinhCoachModal';
import { LessonViewerModal } from '../../src/components/lessons/LessonViewerModal';
import { AutumnCelebration } from '../../src/components/common/AutumnCelebration';
import { VietQRDetectedCard } from '../../src/components/camera/VietQRDetectedCard';
import { EWalletDetectedCard } from '../../src/components/camera/EWalletDetectedCard';
import { PendingReturnPromptModal } from '../../src/components/camera/PendingReturnPromptModal';
import { ConfirmationPillBanner, ConfirmationInboxModal, UploadReceiptModal } from '../../src/components/inbox';
import { OnCameraPhotoOverlay } from '../../src/components/camera/OnCameraPhotoOverlay';
import { InFrameReviewOverlay } from '../../src/components/camera/InFrameReviewOverlay';
import { PiggyCameraRoof } from '../../src/components/camera/PiggyCameraRoof';
import { PixelSkySunCloud } from '../../src/components/camera/PixelSkySunCloud';
import { PolaroidReviewCard } from '../../src/components/camera/PolaroidReviewCard';
import { ViewfinderCornerMascot } from '../../src/components/camera/ViewfinderCornerMascot';
import { PolaroidConfirmCard } from '../../src/components/camera/PolaroidConfirmCard';
import { BankNotificationFloatingPill } from '../../src/components/camera/BankNotificationFloatingPill';
import { BankNotificationSettingsModal } from '../../src/components/profile/BankNotificationSettingsModal';
import { CompactVoiceWaveSheet } from '../../src/components/camera/CompactVoiceWaveSheet';
import { parseVoiceExpense, ParsedVoiceExpense } from '../../src/utils/ai/voiceExpenseParser';
import { bankNotificationService } from '../../src/services/bankNotificationService';
import { useVietQRScanner } from '../../src/hooks/useVietQRScanner';
import { useConfirmationInbox } from '../../src/hooks/useConfirmationInbox';
import { DongMark } from '../../src/components/neo';
import { useCategoryStore } from '../../src/store/categoryStore';
import { renderCategoryMonochromeIcon } from '../../src/constants/categories';
import { MandCashierKeyboard } from '../../src/components/common/MandCashierKeyboard';

// Stores & Services
import { useAuthStore } from '../../src/store/authStore';
import { useBudgetStore } from '../../src/store/budgetStore';
import { useWaitBasketStore } from '../../src/store/waitBasketStore';
import { useTransactionStore } from '../../src/store/transactionStore';
import { useSquadStore } from '../../src/store/squadStore';
import { useAppPermissions } from '../../src/hooks/useCameraPermissions';
import { ParsedExpenseData } from '../../src/services/gemini';
import { scheduleAggressiveReminders, setupNotificationChannels, scheduleDailyExpenseReminder } from '../../src/services/notifications';
import { trackEvent } from '../../src/services/analytics';
import * as Notifications from 'expo-notifications';
import { optimizeExpensePhoto } from '../../src/services/imageOptimizer';
import { uploadExpensePhotoAsync, cleanOldPhotoCache } from '../../src/services/storage';
import { syncBudgetToLockScreen, handleLockScreenAction } from '../../src/services/lockScreenService';
import { formatCompactVND, formatVND } from '../../src/utils/currency';
import { PaymentMethod, Transaction, TransactionType, MediaType } from '../../src/types/database';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VIEWFINDER_SIZE = Math.min(SCREEN_WIDTH - 24, 348);

// Cố định hằng số cấu hình Barcode Scanner ngoài component để triệt tiêu spam native sessionQueue
const BARCODE_SCANNER_SETTINGS = {
  barcodeTypes: ['qr' as const],
};

export default function MainAppScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tokens, isDark, mode } = useTheme();
  const isPink = mode === 'pink';
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
    recordSavedMoney } = useBudgetStore();
  const { items: waitItems, addItem: addToWaitBasket } = useWaitBasketStore();
  const { transactions, addTransaction } = useTransactionStore();

  const { cameraGranted, canAskCameraAgain, requestCameraPermission, openAppSettings } = useAppPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  // Tab & Scroll State
  const [activeTabIndex, setActiveTabIndex] = useState<number>(2); // Default to Camera (Index 2 - Trang trung tâm)
  const [isGameActive, setIsGameActive] = useState<boolean>(false); // Quyết định 144: Fullscreen mode ẩn tab bar khi chơi Game
  const [requestedChatSubView, setRequestedChatSubView] = useState<'hub' | 'chat' | 'fly' | 'cross' | 'map' | null>(null);
  const horizontalPagerRef = useRef<ScrollViewInstance | null>(null);
  const verticalHistoryScrollRef = useRef<ScrollViewInstance | null>(null);

  // Camera Settings
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [isPagerSettled, setIsPagerSettled] = useState<boolean>(false); // Quyết định 159: Chờ Pager ổn định vị trí on-screen mới mount CameraView
  const [cameraZoom, setCameraZoom] = useState<number>(0);
  const [isZoomSliding, setIsZoomSliding] = useState<boolean>(false);
  const zoomSliderTrackWidth = 140;
  const zoomDragStartX = useRef<number>(0);
  const zoomDragStartVal = useRef<number>(0);

  const zoomSliderPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt, gestureState) => {
        setIsZoomSliding(true);
        zoomDragStartX.current = gestureState.x0;
        const locationX = evt.nativeEvent.locationX;
        if (typeof locationX === 'number' && locationX >= 0 && locationX <= zoomSliderTrackWidth) {
          const tapZoom = Math.max(0, Math.min(1.0, locationX / zoomSliderTrackWidth));
          setCameraZoom(tapZoom);
          zoomDragStartVal.current = tapZoom;
        } else {
          zoomDragStartVal.current = cameraZoom;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (evt, gestureState) => {
        const dx = gestureState.moveX - zoomDragStartX.current;
        const deltaZoom = dx / zoomSliderTrackWidth;
        const nextZoom = Math.max(0, Math.min(1.0, zoomDragStartVal.current + deltaZoom));
        setCameraZoom(nextZoom);
      },
      onPanResponderRelease: () => {
        setIsZoomSliding(false);
      },
      onPanResponderTerminate: () => {
        setIsZoomSliding(false);
      } })
  ).current;

  const baseZoom = useRef<number>(0);
  const initialPinchDist = useRef<number | null>(null);
  const lastTapRef = useRef<number>(0);

  const pinchPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
      onMoveShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          initialPinchDist.current = Math.sqrt(dx * dx + dy * dy);
          baseZoom.current = cameraZoom;
        }
      },
      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2 && initialPinchDist.current) {
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const currentDist = Math.sqrt(dx * dx + dy * dy);
          const factor = (currentDist - initialPinchDist.current) / 300;
          const newZoom = Math.max(0, Math.min(1, baseZoom.current + factor));
          setCameraZoom(newZoom);
        }
      },
      onPanResponderRelease: () => {
        initialPinchDist.current = null;
      } })
  ).current;

  // Modals & Sheets
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const optimizedPhotoRef = useRef<string | null>(null);
  const optimizedThumbRef = useRef<string | null>(null);
  const [capturedMediaType, setCapturedMediaType] = useState<MediaType>('PHOTO');
  const [isShootingPig, setIsShootingPig] = useState<boolean>(false);
  const [isPhotoSavedSuccess, setIsPhotoSavedSuccess] = useState<boolean>(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [isSquadPrivate, setIsSquadPrivate] = useState<boolean>(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState<boolean>(false);
  const [capturedThumbUri, setCapturedThumbUri] = useState<string | null>(null);
  const [inFrameAmount, setInFrameAmount] = useState<number>(0);
  const inFrameAmountRef = useRef<number>(0);
  inFrameAmountRef.current = inFrameAmount;
  const [inFrameType, setInFrameType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [inFrameCategory, setInFrameCategory] = useState<string>('');
  const [showInFrameCategoryPicker, setShowInFrameCategoryPicker] = useState<boolean>(false);
  const [inFrameDescription, setInFrameDescription] = useState<string>('');
  const [isEditingStoryText, setIsEditingStoryText] = useState<boolean>(false);
  const storyInputRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  // Chữ mô tả IG Story trong suốt kéo thả tự do (Quyết định 138 & 139)
  const descPan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const descPanOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const id = descPan.addListener((val) => {
      descPanOffset.current = val;
    });
    return () => {
      descPan.removeListener(id);
    };
  }, [descPan]);

  useEffect(() => {
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setIsEditingStoryText(false);
    });
    return () => hideSub.remove();
  }, []);

  const resetDescPan = () => {
    descPan.setValue({ x: 0, y: 0 });
    descPan.setOffset({ x: 0, y: 0 });
    descPanOffset.current = { x: 0, y: 0 };
    setIsEditingStoryText(false);
  };

  const descPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,
        onPanResponderGrant: () => {
          descPan.setOffset({
            x: descPanOffset.current.x,
            y: descPanOffset.current.y,
          });
          descPan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event([null, { dx: descPan.x, dy: descPan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gestureState) => {
          descPan.flattenOffset();
          // Cú chạm nhẹ (Tap): mở chế độ gõ chữ
          if (Math.abs(gestureState.dx) < 6 && Math.abs(gestureState.dy) < 6) {
            setIsEditingStoryText(true);
            setTimeout(() => {
              storyInputRef.current?.focus();
            }, 60);
          }
        },
        onPanResponderTerminate: () => {
          descPan.flattenOffset();
        },
      }),
    [descPan]
  );
  const [savedPolaroidItem, setSavedPolaroidItem] = useState<{
    photoUri?: string | null;
    itemName: string;
    amount: number;
    isExpense: boolean;
  } | null>(null);
  const [camHintMessage, setCamHintMessage] = useState<string>('');
  const [inFramePaymentMethod, setInFramePaymentMethod] = useState<PaymentMethod>('CASH');
  const [parsedData, setParsedData] = useState<ParsedExpenseData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showActualPrice, setShowActualPrice] = useState(false);
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<Transaction | null>(null);
  const [showMinhCoach, setShowMinhCoach] = useState(false);
  const [showLessons, setShowLessons] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAmount, setCelebrationAmount] = useState<number>(0);

  const [showKeyboardModal, setShowKeyboardModal] = useState<boolean>(false);
  const [pendingSaveAfterKeyboard, setPendingSaveAfterKeyboard] = useState<boolean>(false);
  const { getExpenseCategories, getIncomeCategories } = useCategoryStore();
  const activeCameraCategories = inFrameType === 'INCOME' ? getIncomeCategories() : getExpenseCategories();

  useEffect(() => {
    if (!inFrameCategory && activeCameraCategories.length > 0) {
      setInFrameCategory(activeCameraCategories[0].id);
    }
  }, [inFrameCategory, activeCameraCategories]);

  const handleStepInFrameAmount = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInFrameAmount((prev) => Math.max(0, prev + delta));
  };

  const handleRetakeCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPhotoSavedSuccess(false);
    setPendingSaveAfterKeyboard(false);
    optimizedPhotoRef.current = null;
    optimizedThumbRef.current = null;
    setCapturedPhotoUri(null);
    setCapturedThumbUri(null);
    setInFrameAmount(0);
    setInFrameCategory('');
    setInFrameDescription('');
    resetDescPan();
    setInFramePaymentMethod('CASH');
    setSavedPolaroidItem(null);
    setCamHintMessage('');
  };

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
  const [showVoiceSheet, setShowVoiceSheet] = useState<boolean>(false);
  const [showFirstLaunchPermModal, setShowFirstLaunchPermModal] = useState<boolean>(false);
  const [isFirstLaunchCheckDone, setIsFirstLaunchCheckDone] = useState<boolean>(false);
  const hasRunAutoPermSequenceRef = useRef<boolean>(false);

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
    activatePendingById } = useVietQRScanner({
    isCameraActive,
    cameraMode,
    onTriggerActualPrice: (amount, payeeName) => {
      setParsedData({
        amount,
        description: payeeName || 'Khoản chi VietQR',
        category: 'an_uong',
        type: 'EXPENSE',
        confidence: 1.0 });
      setShowActualPrice(true);
    },
    actualPriceThreshold: 200000 });

  useEffect(() => {
    (async () => {
      try {
        const prompted = await AsyncStorage.getItem(STORAGE_KEY_FIRST_PERMISSIONS_PROMPTED);
        if (!prompted && isAuthenticated) {
          setShowFirstLaunchPermModal(true);
        }
      } catch (_e) {
        // ignore
      } finally {
        setIsFirstLaunchCheckDone(true);
      }
    })();
  }, [isAuthenticated]);

  const handleCompleteFirstPermissions = async () => {
    setShowFirstLaunchPermModal(false);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_FIRST_PERMISSIONS_PROMPTED, 'true');
    } catch (_e) {
      // ignore
    }
  };

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

    const handleUrl = (url: string | null | undefined) => {
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
    const scrollTimer = setTimeout(() => {
      horizontalPagerRef.current?.scrollTo({
        x: SCREEN_WIDTH * 2,
        y: 0,
        animated: false });
    }, 50);

    // Quyết định 159: Chờ Pager cuộn xong 200ms đưa khung ngắm 348×348 on-screen mới kết nối AVFoundation session
    const settleTimer = setTimeout(() => {
      setIsPagerSettled(true);
    }, 200);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(settleTimer);
    };
  }, []);

  // Tự động xin quyền Camera trước, chờ đóng hoàn toàn (450ms) rồi mới xin quyền & làm nóng GPS tuần tự (Quyết định 195 & 196)
  useEffect(() => {
    if (!isFirstLaunchCheckDone || showFirstLaunchPermModal || hasRunAutoPermSequenceRef.current) {
      return;
    }
    hasRunAutoPermSequenceRef.current = true;
    (async () => {
      if (!cameraGranted && canAskCameraAgain) {
        try {
          await requestCameraPermission();
        } catch (_e) {}
        await new Promise((resolve) => setTimeout(resolve, 450));
      }
      try {
        const locPerm = await getLocationPermissionStatusAsync();
        if ((!locPerm.granted && locPerm.canAskAgain) || Platform.OS === 'web') {
          await requestLocationPermissionAsync();
        }
        await prewarmLocationAsync();
      } catch (_e) {}
    })();
  }, [isFirstLaunchCheckDone, showFirstLaunchPermModal, cameraGranted, canAskCameraAgain, requestCameraPermission]);

  const currentOffsetYRef = useRef<number>(0);

  const handleTabPress = (index: number) => {
    if (index === 2) {
      if (!isCameraActive) {
        setIsCameraActive(true);
      }
      // Luôn luôn quay về mặt kính Camera ở trang đầu (y = 0)
      verticalHistoryScrollRef.current?.scrollTo({
        y: 0,
        animated: true });
      if (activeTabIndex === 2 && currentOffsetYRef.current > 5) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        return;
      }
    }
    setActiveTabIndex(index);
    horizontalPagerRef.current?.scrollTo({
      x: SCREEN_WIDTH * index,
      y: 0,
      animated: true });
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
      animated: true });
  };

  const scrollToCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    verticalHistoryScrollRef.current?.scrollTo({
      y: 0,
      animated: true });
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


  const handleStartRecordingVideo = async () => {
    try {
      setIsRecordingVideo(true);
      if (cameraRef.current && typeof (cameraRef.current as any).recordAsync === 'function') {
        const videoPromise = (cameraRef.current as any).recordAsync({
          maxDuration: 3,
          mute: true });
        videoPromise
          .then((res: any) => {
            if (res?.uri) {
              setCapturedPhotoUri(res.uri);
              setCapturedThumbUri(res.uri);
              setCapturedMediaType('VIDEO_3S');
              setInFrameAmount(0);
              setInFrameType('EXPENSE');
              setInFrameCategory('');
              setShowInFrameCategoryPicker(false);
              setInFrameDescription('');
    resetDescPan();
              setInFramePaymentMethod('CASH');
            }
          })
          .catch((err: any) => {
            console.log('Quay video fallback:', err);
          });
      }
    } catch (e) {
      console.log('Lỗi start record video:', e);
    }
  };

  const handleStopRecordingVideo = (completed: boolean) => {
    setIsRecordingVideo(false);
    try {
      if (cameraRef.current && typeof (cameraRef.current as any).stopRecording === 'function') {
        (cameraRef.current as any).stopRecording();
      }
    } catch (e) {
      console.log('Lỗi stop record video:', e);
    }
    // Fallback an toàn cho emulator / web
    if (!capturedPhotoUri) {
      const fallback = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80';
      setCapturedPhotoUri(fallback);
      setCapturedThumbUri(fallback);
      setCapturedMediaType('VIDEO_3S');
    }
  };

  const handleShutterVoiceStart = async () => {
    setIsRecordingVoice(true);
    setIsPhotoSavedSuccess(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Giữ camera live view trong suốt quá trình nói để ngắm góc máy
  };

  const handleShutterVoiceEnd = async () => {
    setIsRecordingVoice(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // 1. Tức thì chụp frame ảnh cuối cùng từ camera khi buông tay
    try {
      if (cameraRef.current && cameraGranted) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
          skipProcessing: false,
        });
        if (photo?.uri) {
          // Quyết định 137: Gán trực tiếp 0ms, không xử lý lật file gây trễ
          setCapturedPhotoUri(photo.uri);
          setCapturedThumbUri(photo.uri);
          // Quyết định 135: Lưu kết quả nén vào ref, không swap URI on-screen để triệt tiêu nháy ảnh
          optimizeExpensePhoto(photo.uri)
            .then((optimized) => {
              optimizedPhotoRef.current = optimized.fullUri;
              optimizedThumbRef.current = optimized.thumbnailUri;
            })
            .catch(() => {});
        }
      } else {
        const fallback = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80';
        setCapturedPhotoUri(fallback);
        setCapturedThumbUri(fallback);
      }
    } catch (e) {
      console.log('Chụp frame cuối khi buông voice lỗi:', e);
      const fallback = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80';
      setCapturedPhotoUri(fallback);
      setCapturedThumbUri(fallback);
    }

    // 2. AI bóc tách câu nói thành số tiền, món, danh mục
    const sampleVoiceTexts = [
      'Ăn phở bò 45 nghìn',
      'Uống cà phê sáng 30 nghìn',
      'Mua bánh mì 25 nghìn',
      'Grab đi làm 35 nghìn',
    ];
    const randomVoiceText = sampleVoiceTexts[Math.floor(Math.random() * sampleVoiceTexts.length)];
    const parsed = parseVoiceExpense(randomVoiceText);

    setInFrameAmount(parsed.amount);
    setInFrameCategory(parsed.category || 'Ăn uống');
    setInFrameDescription(parsed.description || 'Ghi âm giọng nói');
    setInFrameType('EXPENSE');
    setInFramePaymentMethod('CASH');

    setCamHintMessage(
      `Heo nghe được: ${parsed.description || 'Món đồ'} ${formatVND(parsed.amount)}. Chạm để chụp và lưu.`
    );

    // Chú heo nhảy cẫng lên ăn mừng
    setIsShootingPig(true);
    setTimeout(() => setIsShootingPig(false), 900);
  };

  const handleShutterShootOrSave = async () => {
    // 1. Nếu số tiền <= 0: cảnh báo người dùng nhập số tiền trước (1:1 prototype)
    if (inFrameAmount <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setCamHintMessage('Nhập số tiền trước nhé');
      setShowKeyboardModal(true);
      return;
    }

    // 2. Chụp ảnh (nếu camera đang live và chưa có ảnh)
    setIsShootingPig(true);
    setTimeout(() => setIsShootingPig(false), 900);

    let photoUriToSave = capturedPhotoUri;
    let thumbUriToSave = capturedThumbUri;

    if (!photoUriToSave) {
      try {
        if (cameraRef.current && cameraGranted) {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.85,
            skipProcessing: false,
          });
          if (photo?.uri) {
            photoUriToSave = photo.uri;
            thumbUriToSave = photo.uri;
            setCapturedPhotoUri(photo.uri);
            setCapturedThumbUri(photo.uri);
            optimizeExpensePhoto(photo.uri)
              .then((opt) => {
                setCapturedPhotoUri(opt.fullUri);
                setCapturedThumbUri(opt.thumbnailUri);
              })
              .catch(() => {});
          }
        }
      } catch (err) {
        console.log('Chụp ảnh Shutter lỗi, dùng fallback:', err);
      }
      if (!photoUriToSave) {
        const fallback = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80';
        photoUriToSave = fallback;
        thumbUriToSave = fallback;
        setCapturedPhotoUri(fallback);
        setCapturedThumbUri(fallback);
      }
    }

    // 3. Lưu giao dịch vào store
    let effectiveCategory = inFrameCategory;
    if (!effectiveCategory) {
      effectiveCategory = inFrameType === 'EXPENSE' ? 'Ăn uống' : 'Thu nhập';
      setInFrameCategory(effectiveCategory);
    }

    const userId = user?.id || 'demo-user';
    const finalAmount = inFrameAmount;
    const finalDesc = inFrameDescription.trim();
    const finalDescPos = finalDesc ? {
      x: Math.round(Math.max(10, Math.min(90, 50 + (descPanOffset.current.x / VIEWFINDER_SIZE) * 100))),
      y: Math.round(Math.max(10, Math.min(90, 72 + (descPanOffset.current.y / VIEWFINDER_SIZE) * 100))),
    } : null;

    const syncCoords = inFrameType === 'EXPENSE' ? getCachedLocationSync() : null;
    const tx = await addTransaction({
      userId,
      amount: finalAmount,
      type: inFrameType,
      category: effectiveCategory,
      description: finalDesc || null,
      desc_position: finalDescPos,
      photo_url: photoUriToSave,
      thumbnail_url: thumbUriToSave || photoUriToSave,
      payment_method: inFramePaymentMethod,
      source: 'PHOTO',
      status: 'CONFIRMED',
      lat: syncCoords ? syncCoords.lat : null,
      lng: syncCoords ? syncCoords.lng : null,
    });

    if (inFrameType === 'EXPENSE') {
      getQuickPinCoordsIfOptedIn()
        .then((coords) => {
          if (coords) {
            useTransactionStore.getState().updateTransaction(tx.id, {
              lat: coords.lat,
              lng: coords.lng,
            });
            reverseGeocodePlaceAsync(coords.lat, coords.lng)
              .then((geo) => {
                if (geo) {
                  useTransactionStore.getState().updateTransaction(tx.id, {
                    location_name: geo.shortPlaceName,
                    district: geo.district,
                  });
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    }

    if (photoUriToSave) {
      uploadExpensePhotoAsync({
        userId,
        transactionId: tx.id,
        fullPhotoUri: photoUriToSave,
        thumbnailUri: thumbUriToSave || undefined,
      }).catch(() => {});
      bankNotificationService.attachPhotoToLatestTransaction(photoUriToSave).catch(() => {});
    }

    if (inFrameType === 'EXPENSE') {
      checkAndTriggerOverspendingSos(finalAmount);
    }

    setLastSavedOrDeletedTx({ action: 'ADD', tx });
    setUndoToastMessage(`Đã lưu khoảnh khắc: ${formatVND(finalAmount)}`);
    setUndoToastVisible(true);

    // 4. Mở thẻ Polaroid Xác Nhận ngay bên dưới (1:1 prototype)
    setSavedPolaroidItem({
      photoUri: photoUriToSave,
      itemName: finalDesc,
      amount: finalAmount,
      isExpense: inFrameType === 'EXPENSE',
    });
    setCamHintMessage('Đã lưu và treo ảnh thành công!');
  };

  // Quyết định 193: Fallback mở thẳng Camera gốc / chọn ảnh trên trình duyệt Web PWA (<input capture="environment">)
  const capturePhotoFromWebInput = () => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      handlePickImageFromLibrary();
      return;
    }
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.setAttribute('capture', 'environment');
      input.style.display = 'none';
      input.onchange = (e: any) => {
        const file = e?.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = typeof reader.result === 'string' ? reader.result : '';
            if (dataUrl) {
              setCapturedPhotoUri(dataUrl);
              setCapturedMediaType('PHOTO');
              setCapturedThumbUri(dataUrl);
              optimizedPhotoRef.current = dataUrl;
              optimizedThumbRef.current = dataUrl;
              if (!inFrameCategory) {
                setInFrameCategory(inFrameType === 'INCOME' ? 'luong' : 'an_uong');
              }
            }
          };
          reader.readAsDataURL(file);
        }
        if (input.parentNode) {
          input.parentNode.removeChild(input);
        }
      };
      document.body.appendChild(input);
      input.click();
    } catch (err) {
      console.log('Web input capture fallback to ImagePicker:', err);
      handlePickImageFromLibrary();
    }
  };

  const handleCapturePhoto = async () => {
    setIsShootingPig(true);
    setTimeout(() => setIsShootingPig(false), 900);
    setIsPhotoSavedSuccess(false);
    if (Platform.OS === 'web') {
      try {
        if (!cameraGranted && canAskCameraAgain) {
          const permRes = await requestCameraPermission();
          if (permRes?.granted) {
            setCamHintMessage('Đã bật Camera! Chạm nút chụp để lưu khoảnh khắc.');
            return;
          }
        }
        if (cameraRef.current && cameraGranted) {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.85,
            skipProcessing: false,
          });
          if (photo?.uri) {
            // Quyết định 137: Gán trực tiếp 0ms, không xử lý lật file gây trễ
            setCapturedPhotoUri(photo.uri);
            setCapturedMediaType('PHOTO');
            setCapturedThumbUri(photo.uri);
            // Quyết định 135: Lưu kết quả nén vào ref, không swap URI on-screen để triệt tiêu nháy ảnh
            optimizeExpensePhoto(photo.uri)
              .then((optimized) => {
                optimizedPhotoRef.current = optimized.fullUri;
                optimizedThumbRef.current = optimized.thumbnailUri;
              })
              .catch(() => {});
            // Quyết định 134: Bảo toàn số tiền, danh mục, mô tả người dùng đã nhập trước khi chụp
            if (!inFrameCategory) {
              setInFrameCategory(inFrameType === 'INCOME' ? 'luong' : 'an_uong');
            }
            return;
          }
        }
      } catch (err) {
        console.log('Web camera capture fallback to native input:', err);
      }
      capturePhotoFromWebInput();
      return;
    }
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
    resetDescPan();
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
          skipProcessing: false });
        if (photo?.uri) {
          // Quyết định 137: 0ms transition - gán tức thì URI ảnh để hiển thị ngay, không xử lý lật file
          setCapturedPhotoUri(photo.uri);
          setCapturedMediaType('PHOTO');
          setCapturedThumbUri(photo.uri);
          // Quyết định 135: Nén WebP dual-res ngầm và lưu vào ref, KHÔNG swap URI on-screen
          optimizeExpensePhoto(photo.uri)
            .then((optimized) => {
              optimizedPhotoRef.current = optimized.fullUri;
              optimizedThumbRef.current = optimized.thumbnailUri;
            })
            .catch(() => {});
          if (activeBankSnapshotEvent) {
            setInFrameAmount(activeBankSnapshotEvent.amount);
            setInFrameType(activeBankSnapshotEvent.type);
            setInFrameCategory(activeBankSnapshotEvent.categoryId || '');
            const cleanContent = activeBankSnapshotEvent.isGenericContent ? '' : (activeBankSnapshotEvent.content || '');
            const bankTag = activeBankSnapshotEvent.bankCode && activeBankSnapshotEvent.bankCode !== 'OTHER'
              ? `[${activeBankSnapshotEvent.bankCode}]`
              : `[${activeBankSnapshotEvent.bankName}]`;
            setInFrameDescription(cleanContent ? `${bankTag} ${cleanContent}` : bankTag);
            setInFramePaymentMethod('BANK');
            setShowInFrameCategoryPicker(true);
          } else {
            // Quyết định 134: Bảo toàn số tiền, danh mục, mô tả người dùng đã nhập trước khi chụp
            if (!inFrameCategory) {
              setInFrameCategory(inFrameType === 'INCOME' ? 'luong' : 'an_uong');
            }
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
      const cleanContent = activeBankSnapshotEvent.isGenericContent ? '' : (activeBankSnapshotEvent.content || '');
      const bankTag = activeBankSnapshotEvent.bankCode && activeBankSnapshotEvent.bankCode !== 'OTHER'
        ? `[${activeBankSnapshotEvent.bankCode}]`
        : `[${activeBankSnapshotEvent.bankName}]`;
      setInFrameDescription(cleanContent ? `${bankTag} ${cleanContent}` : bankTag);
      setInFramePaymentMethod('BANK');
      setShowInFrameCategoryPicker(true);
    } else {
      // Quyết định 134: Bảo toàn số tiền, danh mục, mô tả người dùng đã nhập trước khi chụp
      if (!inFrameCategory) {
        setInFrameCategory(inFrameType === 'INCOME' ? 'luong' : 'an_uong');
      }
    }
  };

  // Handlers for Locket Bank Snapshot & Fast Log (Decision 69)
  const handleBankSnapshot = (detected: ParsedBankNotification) => {
    setActiveBankSnapshotEvent(detected);
    setInFrameAmount(detected.amount);
    setInFrameType(detected.type);
    setInFrameCategory(detected.categoryId || '');
    const cleanContent = detected.isGenericContent ? '' : (detected.content || '');
    const bankTag = detected.bankCode && detected.bankCode !== 'OTHER'
      ? `[${detected.bankCode}]`
      : `[${detected.bankName}]`;
    setInFrameDescription(cleanContent ? `${bankTag} ${cleanContent}` : bankTag);
    setInFramePaymentMethod('BANK');
    handleTabPress(2);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleBankFastLog = (detected: ParsedBankNotification) => {
    setFastLogBankEvent(detected);
  };

  
  
  const checkAndTriggerOverspendingSos = (additionalSpent: number) => {
    try {
      const budgetState = useBudgetStore.getState();
      const currentSpent = budgetState.todaySpent + additionalSpent;
      const currentBudget = budgetState.todayBudget;
      if (currentBudget > 0 && currentSpent > currentBudget) {
        const squadState = useSquadStore.getState();
        if (squadState.squad) {
          const memberName = profile?.full_name || user?.full_name || 'Tôi';
          const memberId = user?.id || 'my-user';
          squadState.triggerOverspendingSos(memberId, memberName, currentSpent, currentBudget);
        }
      }
    } catch (e) {
      console.log('[SquadSOS] Auto trigger checked:', e);
    }
  };

  const handleVoiceConfirmExpense = async (parsed: ParsedVoiceExpense) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const userId = user?.id || 'demo-user';
      const syncCoords = getCachedLocationSync();
      const tx = await addTransaction({
        userId,
        amount: parsed.amount,
        type: 'EXPENSE',
        category: parsed.category,
        description: parsed.description || parsed.category,
        payment_method: 'CASH',
        source: 'VOICE',
        photo_url: null,
        status: 'CONFIRMED',
        lat: syncCoords ? syncCoords.lat : null,
        lng: syncCoords ? syncCoords.lng : null,
      });
      getQuickPinCoordsIfOptedIn()
        .then((coords) => {
          if (coords) {
            useTransactionStore.getState().updateTransaction(tx.id, {
              lat: coords.lat,
              lng: coords.lng,
            });
            reverseGeocodePlaceAsync(coords.lat, coords.lng)
              .then((geo) => {
                if (geo) {
                  useTransactionStore.getState().updateTransaction(tx.id, {
                    location_name: geo.shortPlaceName,
                    district: geo.district,
                  });
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
      setLastSavedOrDeletedTx({ action: 'ADD', tx });
      checkAndTriggerOverspendingSos(parsed.amount);
      setUndoToastMessage(`Đã ghi giọng nói: ${formatVND(parsed.amount)} (${parsed.category})`);
      setUndoToastVisible(true);
      setShowVoiceSheet(false);
      handleTabPress(0);
    } catch (e) {
      console.warn('Voice save failed:', e);
    }
  };

  const handleSaveInFramePhoto = async (overrideAmount?: number) => {
    // 1. Nếu chưa có danh mục, mặc định fallback "Ăn uống"
    let effectiveCategory = inFrameCategory;
    if (!effectiveCategory) {
      effectiveCategory = 'Ăn uống';
      setInFrameCategory('Ăn uống');
    }

    // 2. Quy trình bắt buộc: Chụp ảnh -> Nhập tiền -> Lưu -> Ghim Bản đồ (Quyết định 182)
    // Nếu chưa nhập tiền (> 0), tự động bật bàn phím nhập tiền và lưu ngay sau khi xác nhận
    const targetAmount = typeof overrideAmount === 'number' ? overrideAmount : inFrameAmountRef.current;
    if (targetAmount <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setPendingSaveAfterKeyboard(true);
      setCamHintMessage('Nhập số tiền để lưu & ghim bản đồ nhé!');
      setShowKeyboardModal(true);
      return;
    }

    setPendingSaveAfterKeyboard(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const userId = user?.id || 'demo-user';
    const finalAmount = targetAmount;
    const isBank = Boolean(activeBankSnapshotEvent);
    const bankTag = activeBankSnapshotEvent?.bankCode && activeBankSnapshotEvent.bankCode !== 'OTHER'
      ? `[${activeBankSnapshotEvent.bankCode}]`
      : activeBankSnapshotEvent ? `[${activeBankSnapshotEvent.bankName}]` : '';

    let finalDesc = inFrameDescription.trim();
    if (bankTag && (!finalDesc || finalDesc === bankTag)) {
      finalDesc = bankTag;
    }

    const finalDescPos = finalDesc ? {
      x: Math.round(Math.max(10, Math.min(90, 50 + (descPanOffset.current.x / VIEWFINDER_SIZE) * 100))),
      y: Math.round(Math.max(10, Math.min(90, 72 + (descPanOffset.current.y / VIEWFINDER_SIZE) * 100))),
    } : null;

    const savePhotoUri = optimizedPhotoRef.current || capturedPhotoUri;
    const saveThumbUri = optimizedThumbRef.current || capturedThumbUri || savePhotoUri;
    const syncCoords = inFrameType === 'EXPENSE' ? getCachedLocationSync() : null;

    const tx = await addTransaction({
      userId,
      amount: finalAmount,
      type: inFrameType,
      category: effectiveCategory,
      description: finalDesc || null,
      desc_position: finalDescPos,
      photo_url: savePhotoUri,
      thumbnail_url: saveThumbUri,
      payment_method: inFramePaymentMethod,
      source: 'PHOTO',
      status: 'CONFIRMED',
      lat: syncCoords ? syncCoords.lat : null,
      lng: syncCoords ? syncCoords.lng : null,
    });

    if (inFrameType === 'EXPENSE') {
      getQuickPinCoordsIfOptedIn()
        .then((coords) => {
          if (coords) {
            useTransactionStore.getState().updateTransaction(tx.id, {
              lat: coords.lat,
              lng: coords.lng,
            });
            reverseGeocodePlaceAsync(coords.lat, coords.lng)
              .then((geo) => {
                if (geo) {
                  useTransactionStore.getState().updateTransaction(tx.id, {
                    location_name: geo.shortPlaceName,
                    district: geo.district,
                  });
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    }

    if (savePhotoUri) {
      uploadExpensePhotoAsync({
        userId,
        transactionId: tx.id,
        fullPhotoUri: savePhotoUri,
        thumbnailUri: saveThumbUri || undefined }).catch(() => {});

      // Nếu có sự kiện thông báo ngân hàng vừa đến, tự động gắn ảnh vào giao dịch ngân hàng đó
      bankNotificationService.attachPhotoToLatestTransaction(savePhotoUri).catch(() => {});
    }

    if (inFrameType === 'EXPENSE') {
      checkAndTriggerOverspendingSos(finalAmount);
    }
    setActiveBankSnapshotEvent(null);
    setLastSavedOrDeletedTx({ action: 'ADD', tx });
    setUndoToastMessage(`Đã lưu khoảnh khắc: ${formatVND(finalAmount)}`);
    setUndoToastVisible(true);
    setIsPhotoSavedSuccess(true);
    // Reset tức thì về live camera để ngắm chụp tiếp
    optimizedPhotoRef.current = null;
    optimizedThumbRef.current = null;
    setCapturedPhotoUri(null);
    setCapturedThumbUri(null);
    setInFrameAmount(0);
    setInFrameDescription('');
    resetDescPan();
    setCamHintMessage('Đã lưu khoảnh khắc vào ví!');

    // Cuộn xuống đúng 1 màn hình để xem ảnh vừa chụp (Quyết định 134)
    setTimeout(() => {
      verticalHistoryScrollRef.current?.scrollTo({ y: SCREEN_HEIGHT, animated: true });
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
        quality: 0.85 });

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
              description: 'Ảnh giao dịch tải lên' }))
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
      type: cameraMode === 'INCOME' ? 'INCOME' : 'EXPENSE' });
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
    const syncCoords = data.type === 'EXPENSE' ? getCachedLocationSync() : null;

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
      lat: syncCoords ? syncCoords.lat : null,
      lng: syncCoords ? syncCoords.lng : null,
    });

    if (data.type === 'EXPENSE') {
      getQuickPinCoordsIfOptedIn()
        .then((coords) => {
          if (coords) {
            useTransactionStore.getState().updateTransaction(tx.id, {
              lat: coords.lat,
              lng: coords.lng,
            });
            reverseGeocodePlaceAsync(coords.lat, coords.lng)
              .then((geo) => {
                if (geo) {
                  useTransactionStore.getState().updateTransaction(tx.id, {
                    location_name: geo.shortPlaceName,
                    district: geo.district,
                  });
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    }

    if (capturedPhotoUri) {
      uploadExpensePhotoAsync({
        userId,
        transactionId: tx.id,
        fullPhotoUri: capturedPhotoUri,
        thumbnailUri: capturedThumbUri || undefined }).catch(() => {});
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
        source: lastSavedOrDeletedTx.tx.source });
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
    const syncCoords = getCachedLocationSync();

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
      lat: syncCoords ? syncCoords.lat : null,
      lng: syncCoords ? syncCoords.lng : null,
    });

    getQuickPinCoordsIfOptedIn()
      .then((coords) => {
        if (coords) {
          useTransactionStore.getState().updateTransaction(tx.id, {
            lat: coords.lat,
            lng: coords.lng,
          });
          reverseGeocodePlaceAsync(coords.lat, coords.lng)
            .then((geo) => {
              if (geo) {
                useTransactionStore.getState().updateTransaction(tx.id, {
                  location_name: geo.shortPlaceName,
                  district: geo.district,
                });
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    if (capturedPhotoUri) {
      uploadExpensePhotoAsync({
        userId,
        transactionId: tx.id,
        fullPhotoUri: capturedPhotoUri,
        thumbnailUri: capturedThumbUri || undefined }).catch(() => {});
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
      decided_at: null });

    await scheduleAggressiveReminders({
      itemId: addedItem.id,
      itemName: addedItem.item_name,
      amount: addedItem.amount });

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
          backgroundColor: isDark ? '#0E1620' : '#FAF6EC' }}
      >
        <ActivityIndicator size="large" color={Colors.accentGold} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={[styles.rootContainer, { backgroundColor: tokens.bg || '#F6EEDC' }]}>
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

      {/* 5-PAGE HORIZONTAL PAGER */}
      <ScrollView
        ref={horizontalPagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleHorizontalScrollEnd}
        scrollEnabled={false}
        style={styles.pager}
      >
        {/* ================= PAGE 0: SÂN VƯỜN ================= */}
        <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
          <JournalView
            isActive={activeTabIndex === 0}
            onOpenTransactionDetail={(tx) => {
              setSelectedTxForDetail(tx);
              setShowActualPrice(true);
            }}
            onOpenProfile={() => handleTabPress(4)}
            onOpenCamera={() => handleTabPress(2)}
            onOpenHouse={() => handleTabPress(1)}
          />
        </View>

        {/* ================= PAGE 1: THỐNG KÊ (ALBUM THEO THÁNG) ================= */}
        <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
          <StatsView
            isActive={activeTabIndex === 1}
            onNavigateToCamera={() => handleTabPress(2)}
            onNavigateHome={() => handleTabPress(0)}
            onNavigatePortal={(target) => {
              if (target === 'me') {
                handleTabPress(4);
              } else {
                setRequestedChatSubView(target);
                handleTabPress(3);
              }
            }}
          />
        </View>

        {/* ================= PAGE 2: CAMERA + HISTORY CONTINUOUS ================= */}
        <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
          <ScrollView
            ref={verticalHistoryScrollRef}
            pagingEnabled={Platform.OS === 'android'}
            decelerationRate="fast"
            snapToInterval={SCREEN_HEIGHT}
            snapToAlignment="start"
            disableIntervalMomentum={true}
            showsVerticalScrollIndicator={false}
            onScroll={handleVerticalScroll}
            scrollEventThrottle={16}
            scrollEnabled={!showKeyboardModal && !detectedPayload && !detectedWalletPayload}
            style={[styles.verticalScroll, { backgroundColor: isDark ? '#0E1620' : (tokens.bg || '#F6EEDC') }]}
          >
            {/* --- TOP 100vh: CAMERA TINH GỌN CHUẨN LOCKET 1:1 VUÔNG (ĐỒNG BỘ THEO TOKENS.BG) --- */}
            <View
              style={[
                styles.cameraScreenSection,
                {
                  height: SCREEN_HEIGHT,
                  backgroundColor: tokens.bg || '#F6EEDC',
                  paddingTop: Math.max(insets.top, 8),
                  paddingBottom: insets.bottom + 85,
                  justifyContent: 'space-between',
                },
              ]}
            >
              {/* TOP HEADER CONTROLS: 2 NÚT [ CHI ] VÀ [ THU ] ÁP SÁT TRẦN (1:1 PROTOTYPE) */}
              <View style={styles.camCeilingSegWrap}>
                <TouchableOpacity
                  style={[
                    styles.camCeilingSegBtn,
                    {
                      borderColor: tokens.border || '#2B2118',
                      shadowColor: tokens.shadowColor || '#2B2118',
                    },
                    inFrameType === 'EXPENSE'
                      ? { backgroundColor: tokens.danger || '#E0452B' }
                      : { backgroundColor: tokens.surface || '#FFFBF1' },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setInFrameType('EXPENSE');
                  }}
                  activeOpacity={0.85}
                  accessibilityLabel="Chọn Chi tiêu"
                >
                  <Text
                    style={[
                      styles.camCeilingSegText,
                      { color: inFrameType === 'EXPENSE' ? '#FFFBF1' : (tokens.text || '#2B2118') },
                    ]}
                  >
                    Chi
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.camCeilingSegBtn,
                    {
                      borderColor: tokens.border || '#2B2118',
                      shadowColor: tokens.shadowColor || '#2B2118',
                    },
                    inFrameType === 'INCOME'
                      ? { backgroundColor: tokens.success || '#5E9A57' }
                      : { backgroundColor: tokens.surface || '#FFFBF1' },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setInFrameType('INCOME');
                  }}
                  activeOpacity={0.85}
                  accessibilityLabel="Chọn Thu nhập"
                >
                  <Text
                    style={[
                      styles.camCeilingSegText,
                      { color: inFrameType === 'INCOME' ? '#FFFBF1' : (tokens.text || '#2B2118') },
                    ]}
                  >
                    Thu
                  </Text>
                </TouchableOpacity>
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
                    <X size={15} color="#2B2118" strokeWidth={2.4} />
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
                  style={{ marginBottom: 4 }}
                />
              )}

              {/* CAMERA VIEWFINDER (LIVE KHUNG NGẮM LOCKET 1:1 VUÔNG 348x348px) */}
              <View style={[styles.viewfinderContainer, { borderColor: tokens.border || '#2B2118', shadowColor: tokens.shadowColor || '#2B2118' }]}>
                {/* LỚP 1: LIVE CAMERAVIEW GIỮ NGUYÊN KHÔNG UNMOUNT ĐỂ CHỐNG NHÁY */}
                <View
                  style={styles.viewfinder}
                  {...pinchPanResponder.panHandlers}
                >
                  {cameraGranted && isCameraActive && isPagerSettled ? (
                    <>
                      <CameraView
                        key={cameraFacing}
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        facing={cameraFacing}
                        enableTorch={cameraFacing === 'back' && flashMode === 'on'}
                        zoom={cameraFacing === 'back' ? cameraZoom : 0}
                        barcodeScannerSettings={BARCODE_SCANNER_SETTINGS}
                        onBarcodeScanned={capturedPhotoUri ? undefined : handleBarcodeScanned}
                        onMountError={(e) => console.warn('[CameraView Mount Error]', e)}
                      />
                      {/* LỚP PHỦ GESTURE NHẬN DIỆN CHẠM ĐÚP LẬT CAMERA (chỉ phủ lên CameraView sống, không che permissionFallback - QĐ 193) */}
                      <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={handleDoubleTapViewfinder}
                      />
                    </>
                  ) : (
                    <View style={styles.permissionFallback}>
                      <Camera size={44} color="#666666" strokeWidth={2} />
                      <Text style={styles.permissionText}>
                        {Platform.OS === 'web'
                          ? 'Bật Camera trực tiếp hoặc chụp / tải ảnh chi tiêu'
                          : 'Cấp quyền Camera để chụp ảnh chi tiêu nhanh'}
                      </Text>
                      {Platform.OS === 'web' ? (
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <BlockButton
                            title="Bật Camera"
                            onPress={() => requestCameraPermission().catch(() => {})}
                            variant="primary"
                            size="sm"
                          />
                          <BlockButton
                            title="Chụp / Tải Ảnh"
                            onPress={capturePhotoFromWebInput}
                            variant="secondary"
                            size="sm"
                          />
                        </View>
                      ) : (
                        <BlockButton
                          title={canAskCameraAgain ? 'Cấp quyền Camera' : 'Mở Cài Đặt'}
                          onPress={canAskCameraAgain ? () => requestCameraPermission().catch(() => {}) : openAppSettings}
                          variant="secondary"
                          size="sm"
                        />
                      )}
                    </View>
                  )}
                </View>

                {/* LỚP 2: ẢNH CHỤP TĨNH PHỦ LÊN TRÊN (SEAMLESS FREEZE-FRAME, 0 DELAY, KHÔNG CO GIẬT KHUNG) */}
                {capturedPhotoUri && (
                  <ExpoImage
                    source={{ uri: capturedPhotoUri }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={0}
                    priority="high"
                    cachePolicy="memory-disk"
                  />
                )}

                {/* NÚT FLASH NỔI TRẦN KHÔNG VIỀN Ở GÓC TRÊN TRÁI KHUNG CAMERA */}
                <TouchableOpacity
                  style={styles.camInFrameFlashBtn}
                  onPress={toggleFlash}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessibilityLabel="Bật/Tắt Flash"
                >
                  {flashMode === 'off' ? (
                    <ZapOff size={22} color="#FFFBF1" strokeWidth={2.4} />
                  ) : (
                    <Zap size={22} color="#F4B93B" strokeWidth={2.8} />
                  )}
                </TouchableOpacity>

                {/* CHÚ HEO PIXEL NGỦ GÓC TRÊN PHẢI KHUNG HÌNH (0 REC, 0 VIỀN VUÔNG) */}
                <ViewfinderCornerMascot
                  isHappy={isShootingPig}
                  onPigTap={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                />

                {/* OVERLAY SÓNG ÂM VOICE KHI ĐANG NHẤN GIỮ NÓI */}
                {isRecordingVoice && (
                  <View style={styles.inFrameVoiceOverlay} pointerEvents="none">
                    <View style={styles.inFrameVoiceCircle}>
                      <Mic size={28} color="#FFFBF1" strokeWidth={2.6} />
                    </View>
                    <Text style={styles.inFrameVoiceText}>Đang nghe bạn nói...</Text>
                  </View>
                )}

                {/* CHỮ MÔ TẢ IG STORY TRONG SUỐT KÉO THẢ TỰ DO (QUYẾT ĐỊNH 138 & 139) */}
                {isEditingStoryText ? (
                  <Animated.View
                    style={[
                      styles.camStoryDraggableContainer,
                      {
                        transform: [
                          { translateX: descPan.x },
                          { translateY: descPan.y },
                        ],
                      },
                    ]}
                  >
                    <TextInput
                      ref={storyInputRef}
                      value={inFrameDescription}
                      onChangeText={setInFrameDescription}
                      autoFocus
                      onBlur={() => setIsEditingStoryText(false)}
                      onSubmitEditing={() => setIsEditingStoryText(false)}
                      placeholder=""
                      style={styles.camStoryTextInput}
                      selectionColor="#FFFFFF"
                      underlineColorAndroid="transparent"
                      maxLength={40}
                      returnKeyType="done"
                      multiline={false}
                    />
                  </Animated.View>
                ) : (
                  <Animated.View
                    style={[
                      styles.camStoryDraggableContainer,
                      {
                        transform: [
                          { translateX: descPan.x },
                          { translateY: descPan.y },
                        ],
                      },
                    ]}
                    {...descPanResponder.panHandlers}
                  >
                    {inFrameDescription.trim() ? (
                      <Text style={styles.camStoryTextDisplay}>
                        {inFrameDescription}
                      </Text>
                    ) : (
                      /* Vùng chạm tàng hình (Zero Placeholder - Bỏ chữ "Chạm để viết chữ...") */
                      <View style={styles.camStoryInvisibleTouchArea} />
                    )}
                  </Animated.View>
                )}
              </View>

              {/* THẺ PHÁT HIỆN MÃ VIETQR TRƯỢT LÊN TRÊN NÚT CHỤP */}
              {!capturedPhotoUri && detectedPayload ? (
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
              ) : null}

              {/* THẺ PHÁT HIỆN VÍ ĐIỆN TỬ (ZALOPAY / MOMO) TRƯỢT LÊN TRÊN NÚT CHỤP */}
              {!capturedPhotoUri && detectedWalletPayload ? (
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
              ) : null}

              {/* CỤM ĐIỀU KHIỂN CHI TIÊU & NÚT HÀNH ĐỘNG DƯỚI KHUNG ẢNH */}
              <View style={[styles.camBelowCluster, styles.camControlsSection]}>
                {/* HÀNG 1: BỘ ĐẾM SỐ TIỀN NỀN TRƠN [-] [SỐ TIỀN đ] [+] (BỎ CHỮ "SỐ TIỀN") */}
                <View style={styles.camBelowAmountRow}>
                  <TouchableOpacity
                    style={[
                      styles.camStepBtn,
                      {
                        backgroundColor: tokens.surface || '#FFFBF1',
                        borderColor: tokens.border || '#2B2118',
                        shadowColor: tokens.shadowColor || '#2B2118',
                      },
                    ]}
                    onPress={() => handleStepInFrameAmount(inFrameType === 'INCOME' ? -500000 : -5000)}
                    activeOpacity={0.8}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Minus size={18} color={tokens.text || '#2B2118'} strokeWidth={3} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.camAmountDisplayFlat}
                    onPress={() => setShowKeyboardModal(true)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.camAmountNumberTextFlat, { color: tokens.text || '#2B2118' }]}>
                      {inFrameAmount > 0 ? formatVND(inFrameAmount).replace(/ đ$/, '') : '0'}
                    </Text>
                    <DongMark size={22} color={tokens.text || '#2B2118'} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.camStepBtn,
                      {
                        backgroundColor: tokens.surface || '#FFFBF1',
                        borderColor: tokens.border || '#2B2118',
                        shadowColor: tokens.shadowColor || '#2B2118',
                      },
                    ]}
                    onPress={() => handleStepInFrameAmount(inFrameType === 'INCOME' ? 500000 : 5000)}
                    activeOpacity={0.8}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Plus size={18} color={tokens.text || '#2B2118'} strokeWidth={3} />
                  </TouchableOpacity>
                </View>

                {/* HÀNG 2: DẢI TAG DANH MỤC 1 HÀNG TRƯỢT NGANG CHỮ TO */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.camTagsScrollRow}
                  style={styles.camTagsScrollView}
                >
                  {activeCameraCategories.map((cat) => {
                    const isSelected = inFrameCategory === cat.id;
                    const chipBg = isSelected ? tokens.primary : (tokens.surface || '#FFFBF1');
                    const chipFg = isSelected ? (tokens.textOnPrimary || '#2B2118') : (tokens.text || '#2B2118');

                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.camCatChipLarge,
                          {
                            backgroundColor: chipBg,
                            borderColor: tokens.border || '#2B2118',
                            shadowColor: tokens.shadowColor || '#2B2118',
                          },
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setInFrameCategory(cat.id);
                        }}
                        activeOpacity={0.8}
                      >
                        {renderCategoryMonochromeIcon({
                          categoryId: cat.id,
                          size: 15,
                          color: chipFg,
                          strokeWidth: 2.6,
                        })}
                        <Text
                          style={[
                            styles.camCatChipTextLarge,
                            {
                              color: chipFg,
                              fontWeight: isSelected ? '900' : '800',
                            },
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* HÀNG 3: VÙNG ACTION BAR - SHUTTER HOẶC 2 NÚT [ ↺ ] & [ ✓ ] */}
                <View style={styles.camShutterWrapper}>
                  {!capturedPhotoUri ? (
                    /* TRƯỚC KHI CHỤP: SHUTTER 84x84 + NÚT UPLOAD & LẬT CAM */
                    <View style={styles.camShutterRow}>
                      <TouchableOpacity
                        style={styles.zeroBorderToolButton}
                        onPress={handlePickImageFromLibrary}
                        activeOpacity={0.7}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityLabel="Chọn ảnh từ thư viện"
                      >
                        <ImagePlus size={24} color={tokens.text || '#2B2118'} strokeWidth={2.6} />
                      </TouchableOpacity>

                      <ShutterButton
                        onCapturePhoto={handleCapturePhoto}
                        onVoiceStart={handleShutterVoiceStart}
                        onVoiceEnd={handleShutterVoiceEnd}
                        isVoiceActive={isRecordingVoice}
                      />

                      <TouchableOpacity
                        style={styles.zeroBorderToolButton}
                        onPress={toggleCameraFacing}
                        activeOpacity={0.7}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityLabel="Lật camera"
                      >
                        <RotateCcw size={24} color={tokens.text || '#2B2118'} strokeWidth={2.6} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    /* SAU KHI CHỤP: 2 NÚT BO TRÒN TO NGANG HÀNG [ ↺ ] VÀ [ ✓ ] THAY THẾ SHUTTER */
                    <View style={styles.camReviewTwoButtonsRow}>
                      <TouchableOpacity
                        style={styles.camReviewBtnRetakeRound}
                        onPress={handleRetakeCamera}
                        activeOpacity={0.85}
                        accessibilityLabel="Chụp lại"
                      >
                        <RotateCcw size={26} color="#2B2118" strokeWidth={3} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.camReviewBtnSaveRound}
                        onPress={() => handleSaveInFramePhoto()}
                        activeOpacity={0.85}
                        accessibilityLabel="Lưu vào ví"
                      >
                        <Check size={32} color="#2B2118" strokeWidth={3.5} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* --- DÒNG KHOẢNH KHẮC 100VH 1 ẢNH 1 KHUNG HÌNH (QUYẾT ĐỊNH 134) --- */}
            {confirmedTransactions.map((tx) => (
              <View
                key={tx.id}
                style={[
                  styles.historySnapPage,
                  {
                    height: SCREEN_HEIGHT,
                    backgroundColor: tokens.bg || '#F6EEDC',
                    paddingTop: insets.top + 6,
                    paddingBottom: insets.bottom + 85,
                  },
                ]}
              >
                {/* NÚT TRỞ LẠI CAMERA Ở ĐỈNH KHUNG HÌNH */}
                <TouchableOpacity
                  style={styles.backToCameraPill}
                  onPress={scrollToCamera}
                  activeOpacity={0.8}
                >
                  <ChevronDown size={14} color="#2B2118" strokeWidth={2.8} />
                  <Text style={styles.backToCameraText}>
                    Trở lại Camera
                  </Text>
                </TouchableOpacity>

                {/* KHUNG ẢNH POLAROID CĂN GIỮA TOÀN MÀN HÌNH */}
                <View style={styles.historyCardCentering}>
                  <LocketMomentCard
                    item={tx}
                    isMasked={false}
                  />
                </View>
              </View>
            ))}

            {confirmedTransactions.length === 0 && (
              <View
                style={[
                  styles.historySnapPage,
                  {
                    height: SCREEN_HEIGHT,
                    backgroundColor: tokens.bg || '#F6EEDC',
                    paddingTop: insets.top + 6,
                    paddingBottom: insets.bottom + 85,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.backToCameraPill}
                  onPress={scrollToCamera}
                  activeOpacity={0.8}
                >
                  <ChevronDown size={14} color="#2B2118" strokeWidth={2.8} />
                  <Text style={styles.backToCameraText}>
                    Trở lại Camera
                  </Text>
                </TouchableOpacity>

                <View style={styles.emptyGridContainer}>
                  <Leaf size={32} color="#2B2118" strokeWidth={2} />
                  <Text style={[styles.emptyGridText, { color: '#2B2118' }]}>
                    Chưa có khoảnh khắc nào. Chụp thử món đầu tiên nhé!
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>

        {/* ================= PAGE 3: GIẢI TRÍ (HUB / HEO AI / QUÁN QUEN) ================= */}
        <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
          <ChatView
            onNavigateToStats={() => handleTabPress(1)}
            onNavigateToCamera={() => handleTabPress(2)}
            onToggleTabBar={(visible) => setIsGameActive(!visible)}
            requestedSubView={requestedChatSubView}
            onClearRequestedSubView={() => setRequestedChatSubView(null)}
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
            onNavigateToHub={() => handleTabPress(3)}
          />
        </View>
      </ScrollView>

      {/* FLOATING PILL TAB BAR ACROSS ALL 5 PAGES (Ẩn khi vào Fullscreen Game Mode - Quyết định 144) */}
      {!isGameActive && (
        <FloatingPillTabBar
          activeIndex={activeTabIndex}
          onSelectTab={handleTabPress}
          screenWidth={SCREEN_WIDTH}
        />
      )}

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

      {/* THANH HOÀN TÁC DỄ THƯƠNG 1.8 GIÂY (CUTE UNDO TOAST - QUYẾT ĐỊNH 134) */}
      <UndoToastBar
        visible={undoToastVisible}
        message={undoToastMessage}
        durationMs={1800}
        onUndo={handleUndo}
        onExpire={() => {
          setUndoToastVisible(false);
          setLastSavedOrDeletedTx(null);
        }}
        bottomOffset={insets.bottom + 85}
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

      {/* MODAL NHẬP LIỆU GIỌNG NÓI POP-ANIME */}
      <CompactVoiceWaveSheet
        visible={showVoiceSheet}
        onClose={() => setShowVoiceSheet(false)}
        onConfirmExpense={handleVoiceConfirmExpense}
      />

      {/* MODAL BÀN PHÍM MAND CASHIER KEYBOARD CHUẨN NEO-BRUTALIST PIXEL ART */}
      <Modal visible={showKeyboardModal} animationType="slide" transparent>
        <View style={styles.camKeyboardModalOverlay}>
          <View style={[styles.camKeyboardModalContent, { backgroundColor: tokens.bg || '#F6EEDC', borderColor: tokens.border || '#2B2118' }]}>
            <View style={styles.camKeyboardHeader}>
              <Text style={styles.camKeyboardTitle}>
                {pendingSaveAfterKeyboard ? 'Nhập số tiền để lưu & ghim bản đồ' : 'Nhập số tiền chi tiêu'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setPendingSaveAfterKeyboard(false);
                  setShowKeyboardModal(false);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.camKeyboardCloseBtn}
              >
                <X size={18} color="#2B2118" strokeWidth={2.6} />
              </TouchableOpacity>
            </View>
            <MandCashierKeyboard
              amount={inFrameAmount}
              onChangeAmount={(val) => {
                inFrameAmountRef.current = val;
                setInFrameAmount(val);
              }}
              category={inFrameCategory}
              onChangeCategory={setInFrameCategory}
              type={inFrameType}
              onSubmit={() => {
                const latestAmount = inFrameAmountRef.current;
                if (pendingSaveAfterKeyboard) {
                  if (latestAmount <= 0) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    return;
                  }
                  setShowKeyboardModal(false);
                  setPendingSaveAfterKeyboard(false);
                  handleSaveInFramePhoto(latestAmount);
                } else {
                  setShowKeyboardModal(false);
                }
              }}
              submitText={pendingSaveAfterKeyboard ? 'Lưu & Ghim ✔' : 'Xác nhận ✔'}
            />
          </View>
        </View>
      </Modal>

      {/* MODAL XIN QUYỀN CAMERA & VỊ TRÍ LẦN ĐẦU VÀO APP CHUẨN PRODUCTION (QĐ 186) */}
      <FirstLaunchPermissionsModal
        visible={showFirstLaunchPermModal}
        onRequestCameraPermission={requestCameraPermission}
        onComplete={handleCompleteFirstPermissions}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1 },
  vietQRCardWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 140,
    zIndex: 99 },
  pager: {
    flex: 1 },
  verticalScroll: {
    flex: 1 },
  cameraScreenSection: {
    width: SCREEN_WIDTH,
    position: 'relative',
    justifyContent: 'space-between' },
  cameraTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    zIndex: 20 },
  camTopPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF6EC',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    gap: 6,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2 },
  camTopPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0452B' },
  camTopPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2B2118' },
  polaroidReviewWrapper: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    zIndex: 30 },
  headerIconButton: {
    width: 44,
    height: 44,
    backgroundColor: 'transparent',
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative' },
  todayBudgetChipWrapper: {
    alignItems: 'center' },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs },
  minhCoachBadge: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center' },
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
    paddingHorizontal: 3 },
  badgeNumberText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700' },
  capturedPhotoMascotWrapper: {
    alignItems: 'center',
    marginBottom: 8 },
  viewfinderContainer: {
    width: Math.min(SCREEN_WIDTH - 24, 348),
    height: Math.min(SCREEN_WIDTH - 24, 348),
    alignSelf: 'center',
    marginVertical: 4,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#2B2118',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1C1814',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4 },
  camCeilingSegWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: Math.min(SCREEN_WIDTH - 24, 348),
    alignSelf: 'center',
    marginBottom: 4 },
  camCeilingSegBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#2B2118',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3 },
  camCeilingSegBtnActiveChi: {
    backgroundColor: '#E0452B' },
  camCeilingSegBtnActiveThu: {
    backgroundColor: '#5E9A57' },
  camCeilingSegBtnInactive: {
    backgroundColor: '#FFFFFF' },
  camCeilingSegText: {
    fontFamily: 'Nunito',
    fontSize: 16,
    fontWeight: '800',
    color: '#2B2118' },
  camCeilingSegTextActive: {
    color: '#FFFBF1' },
  camInFrameFlashBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 20,
    padding: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 999 },
  camStoryDraggableContainer: {
    position: 'absolute',
    alignSelf: 'center',
    top: '72%',
    zIndex: 25,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'transparent',
    maxWidth: Math.min(SCREEN_WIDTH - 24, 348) - 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camStoryTextInput: {
    fontFamily: 'Nunito',
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
    padding: 0,
    margin: 0,
    minWidth: 80,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          outlineColor: 'transparent',
          boxShadow: 'none',
          WebkitAppearance: 'none',
          caretColor: '#FFFFFF',
        } as any)
      : {}),
  },
  camStoryTextDisplay: {
    fontFamily: 'Nunito',
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
  },
  camStoryInvisibleTouchArea: {
    width: 220,
    height: 44,
    backgroundColor: 'transparent',
  },
  flashToggleButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2 },
  camSegWrapFull: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 8 },
  camSegBtnFull: {
    flex: 1,
    minHeight: 46,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#2B2118',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3 },
  camSegBtnInactiveFull: {
    backgroundColor: '#FFFFFF' },
  camSegTextFull: {
    fontFamily: 'Nunito',
    fontSize: 16,
    fontWeight: '800',
    color: '#2B2118' },
  camSegTextActiveFull: {
    color: '#FFFBF1' },
  camSegWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 999,
    padding: 3,
    borderWidth: 2,
    borderColor: '#2B2118',
    gap: 4 },
  camSegBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999 },
  camSegBtnActiveChi: {
    backgroundColor: '#E0452B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 2 },
  camSegBtnActiveThu: {
    backgroundColor: '#5E9A57',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 2 },
  camSegBtnInactive: {
    backgroundColor: 'transparent' },
  camSegBtnText: {
    fontFamily: 'Nunito',
    fontSize: 13,
    fontWeight: '800',
    color: '#D9C9A4' },
  camSegBtnTextActive: {
    color: '#FFFBF1' },
  camDescPillInside: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255, 251, 241, 0.95)',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 0,
    elevation: 3,
    zIndex: 20 },
  camDescPillInput: {
    flex: 1,
    fontFamily: 'Nunito',
    fontSize: 13,
    fontWeight: '800',
    color: '#2B2118',
    paddingVertical: 0 },
  camControlsSection: {
    width: Math.min(SCREEN_WIDTH - 20, 360),
    alignSelf: 'center',
    marginTop: 4,
    gap: 6,
    zIndex: 10 },
  camAmountBlock: {
    alignItems: 'center',
    gap: 4 },
  camAmountLabel: {
    fontFamily: 'Nunito',
    fontSize: 11,
    fontWeight: '900',
    color: '#D9C9A4',
    letterSpacing: 1,
    textTransform: 'uppercase' },
  camShutterWrapper: {
    alignItems: 'center',
    gap: 8,
    marginTop: 6 },
  camShutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36 },
  camHintText: {
    fontFamily: 'Nunito',
    fontSize: 12,
    fontWeight: '800',
    color: '#D9C9A4',
    textAlign: 'center',
    minHeight: 18 },
  camPolaroidSection: {
    width: Math.min(SCREEN_WIDTH - 24, 380),
    alignSelf: 'center',
    marginTop: 8 },
  inFrameDescPillWrapper: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255, 251, 241, 0.96)',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 3,
    zIndex: 15 },
  inFrameDescPillInput: {
    flex: 1,
    fontFamily: 'Nunito',
    fontSize: 12,
    fontWeight: '700',
    color: '#2B2118',
    paddingVertical: 0 },
  inFrameTopBar: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 15 },
  inFrameTypeSegment: {
    flexDirection: 'row',
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    padding: 2,
    gap: 3,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2 },
  inFrameTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999 },
  inFrameTypeBtnActiveExpense: {
    backgroundColor: '#E0452B' },
  inFrameTypeBtnActiveIncome: {
    backgroundColor: '#5E9A57' },
  inFrameTypeBtnText: {
    fontFamily: 'Nunito',
    fontSize: 11,
    fontWeight: '800',
    color: '#2B2118' },
  inFrameTypeBtnTextActive: {
    color: '#FFFBF1' },
  inFrameCornerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2 },
  inFrameCornerBtnText: {
    fontFamily: 'Nunito',
    fontSize: 11,
    fontWeight: '800',
    color: '#2B2118' },
  inFrameVoiceOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(20, 26, 36, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 12 },
  inFrameVoiceCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0452B',
    borderWidth: 3,
    borderColor: '#FFFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5 },
  inFrameVoiceText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFBF1' },
  camBelowCluster: {
    width: Math.min(SCREEN_WIDTH - 20, 360),
    alignSelf: 'center',
    marginTop: 8,
    gap: 6,
    zIndex: 10 },
  camBelowAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8 },
  camStepBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2 },
  camAmountDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 14,
    minWidth: 140,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2 },
  camAmountNumberText: {
    fontFamily: 'Baloo2-Bold',
    fontSize: 22,
    fontWeight: '800',
    color: '#2B2118',
    fontVariant: ['tabular-nums'],
    marginRight: 4 },
  camBelowDescRow: {
    width: '100%' },
  camBelowDescInput: {
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    fontFamily: 'Nunito',
    fontSize: 13,
    fontWeight: '700',
    color: '#2B2118',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 1 },
  camBelowChipsScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
    paddingHorizontal: 2 },
  camCatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFBF1',
    borderWidth: 1.8,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 1 },
  camAmountDisplayFlat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 2,
    paddingHorizontal: 10,
    minWidth: 130 },
  camAmountNumberTextFlat: {
    fontFamily: 'Baloo2-Bold',
    fontSize: 28,
    fontWeight: '800',
    color: '#2B2118',
    fontVariant: ['tabular-nums'],
    marginRight: 4 },
  camTagsScrollView: {
    width: '100%',
    maxHeight: 48,
    marginVertical: 4 },
  camTagsScrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12 },
  camCatChipLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.2,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 2 },
  camCatChipLargeSelected: {
    borderWidth: 2.5,
    shadowOpacity: 1 },
  camCatChipTextLarge: {
    fontFamily: 'Nunito',
    fontSize: 14,
    fontWeight: '800',
    color: '#2B2118' },
  camCatChipTextLargeSelected: {
    fontWeight: '900',
    color: '#2B2118' },
  camTagsGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 4,
    width: '100%' },
  camReviewTwoButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    width: '100%',
    paddingVertical: 4 },
  camReviewBtnRetakeRound: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#2B2118',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3 },
  camReviewBtnSaveRound: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F4B93B',
    borderWidth: 3.5,
    borderColor: '#2B2118',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4 },
  camCatChipSelected: {
    backgroundColor: '#F4B93B',
    borderColor: '#2B2118',
    borderWidth: 2,
    shadowOpacity: 1 },
  camCatChipText: {
    fontFamily: 'Nunito',
    fontSize: 12,
    fontWeight: '700',
    color: '#2B2118' },
  camCatChipTextSelected: {
    fontWeight: '800',
    color: '#2B2118' },
  cameraBottomBarReview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    zIndex: 20 },
  camReviewRetakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingVertical: 11,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2 },
  camReviewRetakeText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    fontWeight: '800',
    color: '#2B2118' },
  camReviewSaveBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F4B93B',
    borderWidth: 3,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingVertical: 11,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3 },
  camReviewSaveText: {
    fontFamily: 'Baloo2-Bold',
    fontSize: 15,
    fontWeight: '800',
    color: '#2B2118' },
  camKeyboardModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end' },
  camKeyboardModalContent: {
    backgroundColor: '#FFF5F7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 3,
    borderColor: '#2B2118',
    paddingTop: 12,
    paddingBottom: 24 },
  camKeyboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8 },
  camKeyboardTitle: {
    fontFamily: 'Baloo2-Bold',
    fontSize: 16,
    fontWeight: '800',
    color: '#2B2118' },
  camKeyboardCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2 },
  viewfinder: {
    flex: 1,
    position: 'relative' },
  permissionFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#162231',
    gap: spacing.md },
  permissionText: {
    color: '#A3B0BF',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center' },
  // 4 Corner Brackets (18x18, 1.5px delicate gold hairline guides)
  cornerBracket: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: 'rgba(246, 184, 0, 0.65)',
    zIndex: 10 },
  bracketTL: {
    top: 14,
    left: 14,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopLeftRadius: 4 },
  bracketTR: {
    top: 14,
    right: 14,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopRightRadius: 4 },
  bracketBL: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomLeftRadius: 4 },
  bracketBR: {
    bottom: 14,
    right: 14,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomRightRadius: 4 },
  quickRecordPillWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    zIndex: 15 },
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
    elevation: 3 },
  quickRecordFloatingText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2 },
  cameraBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    zIndex: 20 },
  bottomToolButton: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2 },
  zeroBorderToolButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0 },
  outsideTypeSegmentWrapper: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4 },
  outsideTypeSegmentContainer: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 4,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)' },
  outsideTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6 },
  outsideTypeText: {
    fontSize: 14.5 },
  inFrameRetakeIconButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4 },
  inFrameSaveIconButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E59844',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6 },
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
    elevation: 5 },
  inFrameSaveButtonText: {
    color: '#0E1620',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2 },
  backToCameraPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 2,
    marginTop: 4,
    marginBottom: 6,
    zIndex: 10,
  },
  backToCameraText: {
    fontFamily: 'Nunito',
    fontSize: 13,
    fontWeight: '800',
    color: '#2B2118',
  },
  historySnapPage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  historyCardCentering: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  historyPeekTab: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 25 },
  peekTabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(14, 22, 32, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radii.full },
  peekTabText: {
    color: '#FAF6EC',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5 },

  // HISTORY SECTION
  historyContainer: {
    backgroundColor: '#0E1620' },
  historyStickyHeader: {
    backgroundColor: Colors.bgDark,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 3,
    borderBottomColor: '#000000' },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm },
  backToCamBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.primaryYellow,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center' },
  historyTitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase' },
  historyCountText: {
    color: Colors.primaryYellow,
    fontSize: 13,
    fontWeight: '800' },
  historyListPadding: {
    paddingTop: 8,
    paddingBottom: 20 },
  dayGroupWrapper: {
    marginBottom: 16 },
  dayGroupHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#162231',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 4 },
  dayGroupDateText: {
    color: '#FAF6EC',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5 },
  dayGroupStatsText: {
    color: '#FFC93C',
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'] },
  dayGridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 13 },
  cellColumn: {
    width: '33.333%',
    padding: 0 },
  emptyGridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.sm },
  emptyGridText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '700' },
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
    elevation: 8 },
  bankSmallBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4 },
  bankSmallBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800' },
  activeBankBannerText: {
    flex: 1,
    color: '#FAF6EC',
    fontSize: 12,
    fontWeight: '600' } });
