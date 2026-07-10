import { NextRequest } from 'next/server';
import { supabaseAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const courseId = searchParams.get('course_id');

    if (!courseId) {
      return errorResponse('Missing course_id query parameter', 400, req.nextUrl.pathname);
    }

    const now = new Date().toISOString();

    const { data: raw, error } = await supabaseAdmin
      .from('promo_codes')
      .select('plan, discount_type, discount_value, created_at, used_count, max_uses')
      .eq('course_id', courseId)
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const validPromos = (raw || []).filter(
      (p) => (p.used_count as number) < (p.max_uses as number),
    );

    const PLAN_KEYS = ['early_bird', 'individual', 'group_2', 'group_4'] as const;
    const result: Partial<Record<'early_bird' | 'individual' | 'group_2' | 'group_4', any>> = {};

    for (const promo of validPromos) {
      const planVal = promo.plan as string;
      const targets =
        planVal === 'all'
          ? PLAN_KEYS
          : PLAN_KEYS.filter((k) => k === planVal);

      for (const key of targets) {
        if (!result[key]) {
          result[key] = {
            plan: planVal,
            discount_type: promo.discount_type,
            discount_value: promo.discount_value,
          };
        }
      }
    }

    return successResponse(result);
  } catch (err) {
    console.error('GET /api/promo-codes/active error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
