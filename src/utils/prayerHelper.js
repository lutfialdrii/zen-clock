import { CalculationParameters, Rounding, Madhab } from 'adhan';

/**
 * Standard Kemenag (Kementerian Agama RI) calculation parameters:
 * - Fajr Angle: 20° (sudut subuh Kemenag)
 * - Isha Angle: 18° (sudut isya Kemenag)
 * - Madhab: Syafi'i (standar Indonesia)
 * - Ihtiyat (safety buffer): +2-3 menit pada setiap waktu sholat sesuai ketetapan BHR Kemenag
 *   Subuh +2, Terbit -2, Dzuhur +2-3, Ashar +2, Maghrib +2, Isya +2
 * - Rounding: Up (membulatkan detik ke atas ke menit berikutnya)
 */
export function getKemenagCalculationParameters() {
  const params = new CalculationParameters('Other', 20, 18);
  params.madhab = Madhab.Shafi;
  params.rounding = Rounding.Up;

  // Ihtiyat Kemenag (+2 menit pengaman)
  params.adjustments = {
    fajr: 2,
    sunrise: -2,
    dhuhr: 2,
    asr: 2,
    maghrib: 2,
    isha: 2
  };

  return params;
}
