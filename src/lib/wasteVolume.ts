export type WasteVolume =
  | '1_pickup'
  | '1_truk_kecil'
  | '1_truk_besar'
  | 'lebih_dari_1_truk_besar';

export const WASTE_VOLUME_LABELS: Record<WasteVolume, string> = {
  '1_pickup': '1 pickup',
  '1_truk_kecil': '1 truk kecil',
  '1_truk_besar': '1 truk besar',
  'lebih_dari_1_truk_besar': 'Lebih dari 1 truk besar',
};

export function formatWasteVolumeLabel(volume: string | null | undefined): string {
  if (!volume) {
    return '-';
  }

  return WASTE_VOLUME_LABELS[volume as WasteVolume] ?? volume;
}