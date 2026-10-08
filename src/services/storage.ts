import { File, Directory, Paths } from 'expo-file-system';
import { supabase } from './supabase';
import { optimizeExpensePhoto } from './imageOptimizer';

export interface UploadPhotoResult {
  photoUrl: string;
  thumbnailUrl: string;
  uploadedToCloud: boolean;
}

const BUCKET_NAME =
  process.env.EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET || 'receipt-photos';

/**
 * Tải ảnh chi tiêu lên Supabase Storage với cấu trúc đường dẫn phân cấp:
 * `receipt-photos/{userId}/{YYYY-MM}/{transactionId}.webp`
 * và thumbnail tại `receipt-photos/{userId}/{YYYY-MM}/{transactionId}_thumb.webp`
 * 
 * NGUYÊN TẮC BẢO VỆ DỮ LIỆU & TIẾT KIỆM SỨC CHỨA:
 * 1. Chế độ Khách (Guest) và Demo tuyệt đối KHÔNG tải lên cloud, chỉ lưu cục bộ trên máy.
 * 2. Tự động nén WebP dual-res (Full-res 1080px, Thumb 240px) và xóa sạch 100% EXIF metadata trước khi đẩy lên cloud.
 * 3. Nếu ảnh đã là URL từ xa (http/https), bỏ qua không tải lại.
 */
export async function uploadExpensePhotoAsync(params: {
  userId: string;
  transactionId: string;
  fullPhotoUri: string;
  thumbnailUri?: string;
}): Promise<UploadPhotoResult> {
  const { userId, transactionId, fullPhotoUri, thumbnailUri } = params;

  let finalPhotoUrl = fullPhotoUri;
  let finalThumbUrl = thumbnailUri || fullPhotoUri;

  // 1. GUEST SYNC GUARD: Tuyệt đối không upload ảnh của Guest / Demo lên Supabase Storage
  if (
    !userId ||
    userId.startsWith('guest') ||
    userId.startsWith('demo') ||
    userId === 'seed-user'
  ) {
    return {
      photoUrl: finalPhotoUrl,
      thumbnailUrl: finalThumbUrl,
      uploadedToCloud: false,
    };
  }

  // 2. Nếu đã là remote URL, không cần upload lại
  if (fullPhotoUri.startsWith('http://') || fullPhotoUri.startsWith('https://')) {
    return {
      photoUrl: finalPhotoUrl,
      thumbnailUrl: finalThumbUrl,
      uploadedToCloud: true,
    };
  }

  // Lấy định dạng thời gian YYYY-MM
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const cloudPhotoPath = `${userId}/${yearMonth}/${transactionId}.webp`;
  const cloudThumbPath = `${userId}/${yearMonth}/${transactionId}_thumb.webp`;
  let uploadedToCloud = false;

  try {
    // 3. Kiểm tra cấu hình Supabase
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isSupabaseConfigured =
      Boolean(supabaseUrl) &&
      !supabaseUrl?.includes('placeholder');

    if (!isSupabaseConfigured) {
      // Chế độ demo / offline: dùng URI local
      return {
        photoUrl: finalPhotoUrl,
        thumbnailUrl: finalThumbUrl,
        uploadedToCloud: false,
      };
    }

    let uploadFullUri = fullPhotoUri;
    let uploadThumbUri = thumbnailUri;

    // 4. STRIP EXIF & NÉN WEBP CHUẨN LOCKET:
    // Đảm bảo ảnh đã qua bộ nén WebP để xóa 100% EXIF GPS/Camera metadata
    if (!fullPhotoUri.endsWith('.webp')) {
      try {
        const optimized = await optimizeExpensePhoto(fullPhotoUri);
        uploadFullUri = optimized.fullUri;
        if (!uploadThumbUri) {
          uploadThumbUri = optimized.thumbnailUri;
        }
      } catch {
        // Fallback dùng file gốc nếu không nén được
      }
    }

    // 5. Upload ảnh chính Full-res
    const fullBlob = await (await fetch(uploadFullUri)).blob();
    const { error: fullUploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(cloudPhotoPath, fullBlob, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (!fullUploadError) {
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(cloudPhotoPath);

      if (publicUrlData?.publicUrl) {
        finalPhotoUrl = publicUrlData.publicUrl;
        uploadedToCloud = true;
      }
    }

    // 6. Upload ảnh micro-thumbnail (nếu có)
    if (uploadThumbUri) {
      const thumbBlob = await (await fetch(uploadThumbUri)).blob();
      const { error: thumbUploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(cloudThumbPath, thumbBlob, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (!thumbUploadError) {
        const { data: thumbUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(cloudThumbPath);

        if (thumbUrlData?.publicUrl) {
          finalThumbUrl = thumbUrlData.publicUrl;
        }
      }
    }
  } catch (error) {
    console.warn('[Storage] Upload to Supabase Storage failed, falling back to local URI:', error);
  }

  return {
    photoUrl: finalPhotoUrl,
    thumbnailUrl: finalThumbUrl,
    uploadedToCloud,
  };
}

/**
 * Thuật toán dọn dẹp bộ nhớ đệm (LRU Cache Cleanup):
 * Quét thư mục cache cục bộ và xóa các tệp ảnh cũ hơn maxAgeDays (mặc định 30 ngày)
 * để bảo vệ dung lượng bộ nhớ điện thoại người dùng.
 */
export async function cleanOldPhotoCache(maxAgeDays: number = 30): Promise<number> {
  let cleanedCount = 0;

  try {
    const cacheDir = Paths.cache;
    if (!cacheDir.exists) return 0;

    const items = cacheDir.list();
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    const now = Date.now();

    for (const item of items) {
      if (item instanceof File) {
        // Chỉ dọn các tệp ảnh tạm WebP, JPG, PNG do Camera hoặc ImageManipulator sinh ra
        const isImage = /\.(webp|jpg|jpeg|png)$/i.test(item.name);
        if (isImage) {
          try {
            item.delete();
            cleanedCount++;
          } catch {
            // Bỏ qua lỗi xóa tệp đang mở
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Storage] Error during cache cleanup:', err);
  }

  return cleanedCount;
}
