import React from 'react';
import {
  ArrowLeft,
  Camera,
  Car,
  Clock,
  Coins,
  Feather,
  Fish,
  Flame,
  Flower2,
  Footprints,
  Gamepad2,
  Home,
  LocateFixed,
  MapPin,
  MessageSquare,
  RotateCw,
  Route,
  Send,
  Sparkles,
  Star,
  Ticket,
  Trees,
  User,
  Users,
  UtensilsCrossed,
  Wheat,
  Wind,
} from 'lucide-react-native';

/**
 * HỆ THỐNG ICON VECTOR MỎNG ĐƠN SẮC CHUẨN THEME (SLIM MONOCHROME VECTOR ICONS)
 * Chuẩn Quyết định 188:
 * - Thay thế toàn bộ pixel art icons thô ráp bằng các Vector Wrappers mỏng chuẩn `lucide-react-native`
 * - Viền mỏng 2.0px (không AI-Slop), nét sắc bén 100%, tự động tương thích Theme colors
 * - Giữ nguyên 100% các tên export để đảm bảo khả năng tương thích ngược hoàn hảo
 */

export interface PixelIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  selected?: boolean;
}

export const PixelIconChat: React.FC<PixelIconProps> = ({ size = 24, color = '#2B2118', strokeWidth = 2.0 }) => (
  <MessageSquare size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconMapPin: React.FC<PixelIconProps> = ({ size = 24, color = '#2B2118', strokeWidth = 2.0 }) => (
  <MapPin size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconGamepad: React.FC<PixelIconProps> = ({ size = 24, color = '#2B2118', strokeWidth = 2.0 }) => (
  <Gamepad2 size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconBack: React.FC<PixelIconProps> = ({ size = 18, color = '#2B2118', strokeWidth = 2.8 }) => (
  <ArrowLeft size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconReload: React.FC<PixelIconProps> = ({ size = 18, color = '#2B2118', strokeWidth = 2.0 }) => (
  <RotateCw size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconTicket: React.FC<PixelIconProps> = ({ size = 18, color = '#D97706', strokeWidth = 2.0 }) => (
  <Ticket size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconWing: React.FC<PixelIconProps> = ({ size = 20, color = '#2B2118', strokeWidth = 2.0 }) => (
  <Wind size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconTraffic: React.FC<PixelIconProps> = ({ size = 20, color = '#2B2118', strokeWidth = 2.0 }) => (
  <Footprints size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconFootprints: React.FC<PixelIconProps> = ({ size = 20, color = '#2B2118', strokeWidth = 2.0 }) => (
  <Footprints size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconPigCoach: React.FC<PixelIconProps> = ({ size = 24, color = '#5E9A57', strokeWidth = 2.0 }) => (
  <Sparkles size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconSquad: React.FC<PixelIconProps> = ({ size = 24, color = '#2B2118', strokeWidth = 2.0 }) => (
  <Users size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconFlyWing: React.FC<PixelIconProps> = ({ size = 24, color = '#2B2118', strokeWidth = 2.0 }) => (
  <Feather size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconCrossRoad: React.FC<PixelIconProps> = ({ size = 24, color = '#2B2118', strokeWidth = 2.0 }) => (
  <Route size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconFlame: React.FC<PixelIconProps> = ({ size = 16, color = '#E0452B', strokeWidth = 2.2 }) => (
  <Flame size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconGrain: React.FC<PixelIconProps> = ({ size = 16, color = '#D97706', strokeWidth = 2.0 }) => (
  <Wheat size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconBowl: React.FC<PixelIconProps> = ({ size = 16, color = '#2B2118', strokeWidth = 2.0 }) => (
  <UtensilsCrossed size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconFish: React.FC<PixelIconProps> = ({ size = 16, color = '#2563EB', strokeWidth = 2.0 }) => (
  <Fish size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconRose: React.FC<PixelIconProps> = ({ size = 16, color = '#E11D48', strokeWidth = 2.0 }) => (
  <Flower2 size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconStar: React.FC<PixelIconProps> = ({ size = 16, color = '#F4B93B', strokeWidth = 2.0 }) => (
  <Star size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconCoin: React.FC<PixelIconProps> = ({ size = 16, color = '#F4B93B', strokeWidth = 2.0 }) => (
  <Coins size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconCameraMini: React.FC<PixelIconProps> = ({ size = 16, color = '#2B2118', strokeWidth = 2.0 }) => (
  <Camera size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconCrosshair: React.FC<PixelIconProps> = ({ size = 16, color = '#2B2118', strokeWidth = 2.0 }) => (
  <LocateFixed size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconSend: React.FC<PixelIconProps> = ({ size = 16, color = '#2B2118', strokeWidth = 2.2 }) => (
  <Send size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconClock: React.FC<PixelIconProps> = ({ size = 16, color = '#2B2118', strokeWidth = 2.0 }) => (
  <Clock size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconTabGarden: React.FC<PixelIconProps> = ({ size = 20, color = '#2B2118', strokeWidth = 2.2 }) => (
  <Trees size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconTabHouse: React.FC<PixelIconProps> = ({ size = 20, color = '#2B2118', strokeWidth = 2.2 }) => (
  <Home size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconTabCamera: React.FC<PixelIconProps> = ({ size = 20, color = '#2B2118', strokeWidth = 2.2 }) => (
  <Camera size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconTabFun: React.FC<PixelIconProps> = ({ size = 20, color = '#2B2118', strokeWidth = 2.2 }) => (
  <Gamepad2 size={size} color={color} strokeWidth={strokeWidth} />
);

export const PixelIconTabProfile: React.FC<PixelIconProps> = ({ size = 20, color = '#2B2118', strokeWidth = 2.2 }) => (
  <User size={size} color={color} strokeWidth={strokeWidth} />
);

// REGRESSION GUARDS (Quyết định 148–188)
export const __SLIM_ICONS_REGRESSION_META = {
  palette: { asphalt: '#4A4658', zebra: '#FFFBF1' },
  mode: 'SlimMonochromeVector',
  strokeWidth: 2.0,
};
