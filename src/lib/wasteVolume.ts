export type WasteVolume =
  | 'kurang_dari_30kg'
  | '30_50kg'
  | '50_100kg'
  | 'lebih_dari_100kg';

export const WASTE_VOLUME_LABELS: Record<WasteVolume, string> = {
  kurang_dari_30kg: 'Kurang dari 30kg',
  '30_50kg': '30-50kg',
  '50_100kg': '50-100kg',
  lebih_dari_100kg: 'Lebih dari 100kg',
};

export function formatWasteVolumeLabel(volume: string | null | undefined): string {
  if (!volume) {
    return '-';
  }

  return WASTE_VOLUME_LABELS[volume as WasteVolume] ?? volume;
}