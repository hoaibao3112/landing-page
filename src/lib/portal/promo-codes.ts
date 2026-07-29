import { supabaseAdmin } from './supabase-server';

export interface PromoValidationResult {
  valid: boolean;
  message: string;
  discount_type?: 'percent' | 'fixed';
  discount_value?: number;
  promo_code_id?: string;
}

export async function lookupCode(
  code: string,
  courseId: string,
  plan: 'early_bird' | 'individual' | 'group_2' | 'group_4'
): Promise<PromoValidationResult> {
  const upperCode = code.toUpperCase().trim();

  try {
    const { data: promo, error } = await supabaseAdmin
      .from('promo_codes')
      .select('id, code, course_id, plan, discount_type, discount_value, max_uses, used_count, expires_at, is_active')
      .eq('code', upperCode)
      .maybeSingle();

    if (error) {
      console.error(`DB error khi lookup mã "${upperCode}"`, error);
      return { valid: false, message: 'Có lỗi xảy ra, vui lòng thử lại sau' };
    }

    if (!promo) {
      return { valid: false, message: 'Mã khuyến mãi không tồn tại' };
    }

    if (!promo.is_active) {
      return { valid: false, message: 'Mã khuyến mãi đã bị vô hiệu hóa' };
    }

    if (promo.course_id !== courseId) {
      return { valid: false, message: 'Mã không áp dụng cho khóa học này' };
    }

    if (promo.plan !== 'all' && promo.plan !== plan) {
      const planLabelMap: Record<string, string> = {
        early_bird: 'early bird',
        individual: 'cá nhân',
        group_2: 'nhóm 2 người',
        group_4: 'nhóm 4 người',
      };
      const planLabel = planLabelMap[promo.plan] ?? String(promo.plan);
      return { valid: false, message: `Mã chỉ áp dụng cho đăng ký ${planLabel}` };
    }

    if (promo.used_count >= promo.max_uses) {
      return { valid: false, message: 'Mã đã hết lượt sử dụng' };
    }

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return { valid: false, message: 'Mã khuyến mãi đã hết hạn' };
    }

    const discountType = promo.discount_type as 'percent' | 'fixed';
    const discountValue = promo.discount_value as number;

    const message =
      discountType === 'percent'
        ? `Giảm ${discountValue}% học phí`
        : `Giảm ${discountValue.toLocaleString('vi-VN')}đ học phí`;

    return {
      valid: true,
      message,
      discount_type: discountType,
      discount_value: discountValue,
      promo_code_id: promo.id,
    };
  } catch (err) {
    console.error('lookupCode error:', err);
    return { valid: false, message: 'Lỗi máy chủ khi xác thực mã' };
  }
}

export async function applyCode(
  code: string,
  courseId: string,
  plan: 'early_bird' | 'individual' | 'group_2' | 'group_4'
): Promise<PromoValidationResult> {
  const upperCode = code.toUpperCase().trim();

  try {
    const { data, error } = await supabaseAdmin.rpc('apply_promo_code', {
      p_code: upperCode,
      p_course_id: courseId,
      p_plan: plan,
    });

    if (!error && data) {
      return data as PromoValidationResult;
    }

    if (error) {
      // Log full RPC error detail for debugging
      console.warn(`RPC apply_promo_code error for "${upperCode}":`, {
        code: error.code,
        message: error.message,
        details: error.details,
      });

      // Fallback for environments where RPC migration script has not been executed yet
      const fallbackResult = await lookupCode(code, courseId, plan);
      if (!fallbackResult.valid || !fallbackResult.promo_code_id) return fallbackResult;

      const { error: incError } = await supabaseAdmin.rpc('increment_promo_used_count', {
        p_id: fallbackResult.promo_code_id,
      });

      if (incError) {
        console.warn(`Fallback increment_promo_used_count error:`, {
          code: incError.code,
          message: incError.message,
        });
      }

      return fallbackResult;
    }

    return { valid: false, message: 'Không thể xác thực mã khuyến mãi' };
  } catch (err) {
    console.error('applyCode error:', err);
    return { valid: false, message: 'Lỗi máy chủ khi áp dụng mã' };
  }
}
