import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const reportId = Number(id);

  if (!Number.isFinite(reportId)) {
    return NextResponse.json({ success: false, error: 'Report ID tidak valid' }, { status: 400 });
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid' }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { notes?: string } | null;
  const notes = (body?.notes || '').trim();

  const { error } = await supabase
    .from('reports')
    .update({ notes })
    .eq('id', reportId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  revalidatePath('/admin/laporan');
  revalidatePath(`/admin/laporan/${reportId}`);
  revalidatePath('/akun/riwayat-laporan');

  return NextResponse.json({ success: true, data: { reportId, notes } });
}