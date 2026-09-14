import { CalculationParameters, Rounding, Madhab } from 'adhan';

export interface PrayerAdjustments {
  fajr?: number;
  sunrise?: number;
  dhuhr?: number;
  asr?: number;
  maghrib?: number;
  isha?: number;
}

/**
 * Standard Kemenag (Kementerian Agama RI) calculation parameters:
 * - Fajr Angle: 20° (sudut subuh Kemenag RI)
 * - Isha Angle: 18° (sudut isya Kemenag RI)
 * - Madhab: Syafi'i (standar Indonesia)
 * - Ihtiyat (safety buffer): +2 menit pada setiap waktu sholat sesuai ketetapan BHR Kemenag
 *   Subuh +2, Terbit -2, Dzuhur +2, Ashar +2, Maghrib +2, Isya +2
 * - Rounding: Up (membulatkan detik ke atas ke menit berikutnya)
 */
export const DEFAULT_KEMENAG_IHTIYAT: Record<string, number> = {
  fajr: 2,
  sunrise: -2,
  dhuhr: 2,
  asr: 2,
  maghrib: 2,
  isha: 2
};

export const PRAYER_NAMES: Record<string, string> = {
  fajr: 'Subuh',
  sunrise: 'Terbit',
  dhuhr: 'Dzuhur',
  asr: 'Ashar',
  maghrib: 'Maghrib',
  isha: 'Isya'
};

export function getKemenagCalculationParameters(customAdjustments: PrayerAdjustments = {}): CalculationParameters {
  const params = new CalculationParameters('Other', 20, 18);
  params.madhab = Madhab.Shafi;
  params.rounding = Rounding.Up;

  params.adjustments = {
    fajr: DEFAULT_KEMENAG_IHTIYAT.fajr + (Number(customAdjustments?.fajr) || 0),
    sunrise: DEFAULT_KEMENAG_IHTIYAT.sunrise + (Number(customAdjustments?.sunrise) || 0),
    dhuhr: DEFAULT_KEMENAG_IHTIYAT.dhuhr + (Number(customAdjustments?.dhuhr) || 0),
    asr: DEFAULT_KEMENAG_IHTIYAT.asr + (Number(customAdjustments?.asr) || 0),
    maghrib: DEFAULT_KEMENAG_IHTIYAT.maghrib + (Number(customAdjustments?.maghrib) || 0),
    isha: DEFAULT_KEMENAG_IHTIYAT.isha + (Number(customAdjustments?.isha) || 0)
  };

  return params;
}

export function formatCountdownVerbose(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00 detik';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} jam ${minutes} menit ${seconds} detik`;
  }
  if (minutes > 0) {
    return `${minutes} menit ${seconds} detik`;
  }
  return `${seconds} detik`;
}

export function formatCountdownDigits(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00:00';
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function formatCountdownHoursMinutes(totalSeconds: number): string {
  if (totalSeconds <= 0) return 'sekarang';
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  }
  if (minutes > 0) {
    return `${minutes} menit`;
  }
  return '< 1 menit';
}
