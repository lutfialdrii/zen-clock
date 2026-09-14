import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Coordinates, PrayerTimes } from 'adhan';
import {
  getKemenagCalculationParameters,
  formatCountdownVerbose,
  formatCountdownDigits,
  formatCountdownHoursMinutes,
  getPrayerName,
  PRAYER_NAMES
} from './utils/prayerHelper';
import {
  getThemeVariables,
  ACCENT_PRESETS,
  DEFAULT_ACCENT_COLOR,
  ThemeVariables
} from './utils/themeHelper';
import { Language, getTranslations } from './utils/i18n';

const LOCATION_STORAGE_KEY = 'zenClock.selectedLocation';
const PRAYER_ADJUSTMENTS_STORAGE_KEY = 'zenClock.prayerAdjustments';
const activeWebviews = new Set<vscode.Webview>();

interface PrayerAdjustments {
  fajr?: number;
  sunrise?: number;
  dhuhr?: number;
  asr?: number;
  maghrib?: number;
  isha?: number;
}

interface LocationData {
  name: string;
  lat: number;
  lng: number;
}

interface PomodoroState {
  isRunning: boolean;
  mode: 'work' | 'break';
  timeLeft: number;
  totalDuration: number;
  targetEndTime?: number;
}

interface PrayerReminderInfo {
  name: string;
  time: string;
  location: string;
}

let currentPomodoro: PomodoroState = {
  isRunning: false,
  mode: 'work',
  timeLeft: 25 * 60,
  totalDuration: 25 * 60
};

let pomodoroTimerInterval: NodeJS.Timeout | undefined;
let statusBarItem: vscode.StatusBarItem;
let statusBarTimer: NodeJS.Timeout | undefined;
let lastRemindedPrayerKey = '';
let lastTooltipMarkdown = '';

const POPULAR_CITIES: Array<{ name: string; region: string; lat: number; lng: number }> = [
  { name: 'Jakarta', region: 'DKI Jakarta', lat: -6.2088, lng: 106.8456 },
  { name: 'Surabaya', region: 'Jawa Timur', lat: -7.2575, lng: 112.7521 },
  { name: 'Bandung', region: 'Jawa Barat', lat: -6.9175, lng: 107.6191 },
  { name: 'Medan', region: 'Sumatera Utara', lat: 3.5952, lng: 98.6722 },
  { name: 'Semarang', region: 'Jawa Tengah', lat: -6.9667, lng: 110.4167 },
  { name: 'Makassar', region: 'Sulawesi Selatan', lat: -5.1477, lng: 119.4327 },
  { name: 'Palembang', region: 'Sumatera Selatan', lat: -2.9761, lng: 104.7754 },
  { name: 'Tangerang', region: 'Banten', lat: -6.1783, lng: 106.6319 },
  { name: 'Tangerang Selatan', region: 'Banten', lat: -6.2888, lng: 106.7179 },
  { name: 'Depok', region: 'Jawa Barat', lat: -6.4025, lng: 106.7942 },
  { name: 'Bekasi', region: 'Jawa Barat', lat: -6.2383, lng: 106.9756 },
  { name: 'Bogor', region: 'Jawa Barat', lat: -6.5971, lng: 106.8060 },
  { name: 'Yogyakarta', region: 'DI Yogyakarta', lat: -7.7956, lng: 110.3695 },
  { name: 'Surakarta (Solo)', region: 'Jawa Tengah', lat: -7.5755, lng: 110.8243 },
  { name: 'Malang', region: 'Jawa Timur', lat: -7.9666, lng: 112.6326 },
  { name: 'Denpasar', region: 'Bali', lat: -8.6705, lng: 115.2126 },
  { name: 'Banda Aceh', region: 'Aceh', lat: 5.5483, lng: 95.3238 },
  { name: 'Padang', region: 'Sumatera Barat', lat: -0.9471, lng: 100.4172 },
  { name: 'Pekanbaru', region: 'Riau', lat: 0.5071, lng: 101.4478 },
  { name: 'Batam', region: 'Kepulauan Riau', lat: 1.1301, lng: 104.0529 },
  { name: 'Bandar Lampung', region: 'Lampung', lat: -5.4500, lng: 105.2667 },
  { name: 'Pontianak', region: 'Kalimantan Barat', lat: -0.0263, lng: 109.3425 },
  { name: 'Banjarmasin', region: 'Kalimantan Selatan', lat: -3.3194, lng: 114.5908 },
  { name: 'Balikpapan', region: 'Kalimantan Timur', lat: -1.2379, lng: 116.8529 },
  { name: 'Samarinda', region: 'Kalimantan Timur', lat: -0.5022, lng: 117.1536 },
  { name: 'Manado', region: 'Sulawesi Utara', lat: 1.4748, lng: 124.8421 },
  { name: 'Mataram', region: 'Nusa Tenggara Barat', lat: -8.5833, lng: 116.1167 },
  { name: 'Kupang', region: 'Nusa Tenggara Timur', lat: -10.1772, lng: 123.6070 },
  { name: 'Ambon', region: 'Maluku', lat: -3.6554, lng: 128.1908 },
  { name: 'Jayapura', region: 'Papua', lat: -2.5916, lng: 140.6690 },
  { name: 'Makkah', region: 'Saudi Arabia', lat: 21.4225, lng: 39.8262 },
  { name: 'Madinah', region: 'Saudi Arabia', lat: 24.5247, lng: 39.5692 },
  { name: 'Kuala Lumpur', region: 'Malaysia', lat: 3.1390, lng: 101.6869 },
  { name: 'Singapore', region: 'Singapore', lat: 1.3521, lng: 103.8198 }
];

function broadcastMessage(message: any) {
  for (const webview of activeWebviews) {
    try {
      webview.postMessage(message);
    } catch (e) {
      console.error('Failed to postMessage to webview', e);
    }
  }
}

function getPomodoroPayload() {
  return {
    isRunning: currentPomodoro.isRunning,
    mode: currentPomodoro.mode,
    timeLeft: currentPomodoro.timeLeft,
    totalDuration: currentPomodoro.totalDuration
  };
}

function broadcastPomodoroState() {
  broadcastMessage({
    type: 'POMODORO_SYNC',
    state: getPomodoroPayload()
  });
}

function sendPomodoroState(webview: vscode.Webview) {
  try {
    webview.postMessage({
      type: 'POMODORO_SYNC',
      state: getPomodoroPayload()
    });
  } catch (e) {
    console.error('Failed to post Pomodoro state to webview', e);
  }
}

function getLanguage(): Language {
  const lang = vscode.workspace.getConfiguration('zenClock').get<string>('language');
  return lang === 'en' ? 'en' : 'id';
}

function broadcastLanguage() {
  const language = getLanguage();
  broadcastMessage({
    type: 'LANGUAGE_UPDATED',
    language
  });
}

function sendLanguageState(webview: vscode.Webview) {
  try {
    webview.postMessage({
      type: 'LANGUAGE_UPDATED',
      language: getLanguage()
    });
  } catch (e) {
    console.error('Failed to post Language state to webview', e);
  }
}

function startPomodoro(context: vscode.ExtensionContext) {
  if (currentPomodoro.isRunning) return;

  currentPomodoro.isRunning = true;
  currentPomodoro.targetEndTime = Date.now() + currentPomodoro.timeLeft * 1000;

  if (pomodoroTimerInterval) {
    clearInterval(pomodoroTimerInterval);
  }

  pomodoroTimerInterval = setInterval(() => {
    if (!currentPomodoro.isRunning || !currentPomodoro.targetEndTime) {
      if (pomodoroTimerInterval) clearInterval(pomodoroTimerInterval);
      return;
    }

    const remainingMs = currentPomodoro.targetEndTime - Date.now();
    const remainingSecs = Math.max(0, Math.round(remainingMs / 1000));
    currentPomodoro.timeLeft = remainingSecs;

    if (remainingSecs <= 0) {
      handlePomodoroFinished(context);
    } else {
      broadcastPomodoroState();
      updateStatusBar(context);
    }
  }, 1000);

  broadcastPomodoroState();
  updateStatusBar(context);
}

function pausePomodoro(context: vscode.ExtensionContext) {
  if (!currentPomodoro.isRunning) return;

  currentPomodoro.isRunning = false;
  if (currentPomodoro.targetEndTime) {
    const remainingMs = currentPomodoro.targetEndTime - Date.now();
    currentPomodoro.timeLeft = Math.max(0, Math.round(remainingMs / 1000));
    currentPomodoro.targetEndTime = undefined;
  }

  if (pomodoroTimerInterval) {
    clearInterval(pomodoroTimerInterval);
    pomodoroTimerInterval = undefined;
  }

  broadcastPomodoroState();
  updateStatusBar(context);
}

function resetPomodoro(context: vscode.ExtensionContext) {
  currentPomodoro.isRunning = false;
  currentPomodoro.targetEndTime = undefined;
  if (pomodoroTimerInterval) {
    clearInterval(pomodoroTimerInterval);
    pomodoroTimerInterval = undefined;
  }

  const defaultDuration = currentPomodoro.mode === 'work' ? 25 * 60 : 5 * 60;
  currentPomodoro.timeLeft = defaultDuration;
  currentPomodoro.totalDuration = defaultDuration;

  broadcastPomodoroState();
  updateStatusBar(context);
}

function switchPomodoroMode(context: vscode.ExtensionContext, newMode: 'work' | 'break') {
  currentPomodoro.isRunning = false;
  currentPomodoro.targetEndTime = undefined;
  if (pomodoroTimerInterval) {
    clearInterval(pomodoroTimerInterval);
    pomodoroTimerInterval = undefined;
  }

  currentPomodoro.mode = newMode;
  const defaultDuration = newMode === 'work' ? 25 * 60 : 5 * 60;
  currentPomodoro.timeLeft = defaultDuration;
  currentPomodoro.totalDuration = defaultDuration;

  broadcastPomodoroState();
  updateStatusBar(context);
}

function handlePomodoroFinished(context: vscode.ExtensionContext) {
  currentPomodoro.isRunning = false;
  currentPomodoro.targetEndTime = undefined;
  if (pomodoroTimerInterval) {
    clearInterval(pomodoroTimerInterval);
    pomodoroTimerInterval = undefined;
  }

  const lang = getLanguage();
  const t = getTranslations(lang);
  const wasWork = currentPomodoro.mode === 'work';

  if (wasWork) {
    const msg = lang === 'en'
      ? '🍅 Pomodoro session (25m) completed! Time for a break (5m).'
      : '🍅 Sesi Pomodoro (25m) selesai! Waktunya Istirahat (Break 5m).';
    const actionBtn = lang === 'en' ? 'Start Break' : 'Mulai Istirahat';

    vscode.window
      .showInformationMessage(msg, actionBtn)
      .then((action) => {
        if (action === actionBtn) {
          switchPomodoroMode(context, 'break');
          startPomodoro(context);
        }
      });

    currentPomodoro.mode = 'break';
    currentPomodoro.timeLeft = 5 * 60;
    currentPomodoro.totalDuration = 5 * 60;
  } else {
    const msg = lang === 'en'
      ? '⚡ Break session (5m) finished! Ready to focus again (Work 25m)?'
      : '⚡ Sesi Istirahat (5m) selesai! Siap untuk kembali fokus bekerja (Work 25m)?';
    const actionBtn = lang === 'en' ? 'Start Work' : 'Mulai Kerja';

    vscode.window
      .showInformationMessage(msg, actionBtn)
      .then((action) => {
        if (action === actionBtn) {
          switchPomodoroMode(context, 'work');
          startPomodoro(context);
        }
      });

    currentPomodoro.mode = 'work';
    currentPomodoro.timeLeft = 25 * 60;
    currentPomodoro.totalDuration = 25 * 60;
  }

  broadcastPomodoroState();
  updateStatusBar(context);
}

async function promptChangeLocation(context: vscode.ExtensionContext) {
  const currentSaved = context.globalState.get<LocationData>(LOCATION_STORAGE_KEY);
  const lang = getLanguage();
  const isEn = lang === 'en';

  const quickPickItems: vscode.QuickPickItem[] = [
    {
      label: isEn ? '$(search) Search Other City...' : '$(search) Cari Kota Lain...',
      description: isEn ? 'Type city name manually (Indonesia or Worldwide)' : 'Ketik nama kota manual (Indonesia atau Dunia)'
    },
    {
      label: isEn ? '$(globe) Automatic Detection (IP Geolocation)' : '$(globe) Deteksi Otomatis (IP Geolocation)',
      description: isEn ? 'Use automatic location detection from network' : 'Gunakan deteksi lokasi otomatis dari jaringan'
    },
    {
      kind: vscode.QuickPickItemKind.Separator,
      label: isEn ? 'Popular Cities' : 'Kota Populer'
    },
    ...POPULAR_CITIES.map((c) => ({
      label: `$(pin) ${c.name}`,
      description: c.region,
      detail: currentSaved && currentSaved.name.includes(c.name)
        ? (isEn ? '✓ Currently active location' : '✓ Lokasi aktif saat ini')
        : undefined
    }))
  ];

  const selected = await vscode.window.showQuickPick(quickPickItems, {
    placeHolder: currentSaved
      ? (isEn ? `Active location: ${currentSaved.name} (Select to change)` : `Lokasi aktif: ${currentSaved.name} (Pilih untuk mengganti)`)
      : (isEn ? 'Select city for prayer time calculation...' : 'Pilih kota untuk perhitungan jadwal waktu sholat...'),
    matchOnDescription: true,
    matchOnDetail: true
  });

  if (!selected) {
    return;
  }

  if (selected.label.includes('Cari Kota Lain') || selected.label.includes('Search Other City')) {
    const query = await vscode.window.showInputBox({
      prompt: isEn ? 'Enter city name (e.g., London, Cairo, Tokyo, Surabaya):' : 'Masukkan nama kota (contoh: Cirebon, Purwokerto, London, Tokyo):',
      placeHolder: isEn ? 'City name...' : 'Nama kota...'
    });

    if (!query || !query.trim()) {
      return;
    }

    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: isEn ? `Searching coordinates for "${query}"...` : `Mencari koordinat untuk "${query}"...`,
          cancellable: false
        },
        async () => {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=1`,
            {
              headers: { 'User-Agent': 'ZenClock-VSCode-Extension' }
            }
          );
          const data: any = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const item = data[0];
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            const parts = item.display_name.split(',');
            const shortName = parts.slice(0, 2).join(',').trim();

            const locationData: LocationData = { name: shortName, lat, lng };
            await context.globalState.update(LOCATION_STORAGE_KEY, locationData);
            broadcastMessage({ type: 'LOCATION_UPDATED', data: locationData });
            updateStatusBar(context);
            vscode.window.showInformationMessage(
              isEn
                ? `Zen Clock location changed to: ${shortName}`
                : `Lokasi Zen Clock berhasil diubah ke: ${shortName}`
            );
          } else {
            vscode.window.showErrorMessage(
              isEn
                ? `City "${query}" not found. Please check your spelling.`
                : `Kota "${query}" tidak ditemukan. Silakan periksa kembali ejaan.`
            );
          }
        }
      );
    } catch (err) {
      vscode.window.showErrorMessage(
        isEn ? `Failed to fetch location data: ${err}` : `Gagal mengambil data lokasi: ${err}`
      );
    }
  } else if (selected.label.includes('Deteksi Otomatis') || selected.label.includes('Automatic Detection')) {
    await context.globalState.update(LOCATION_STORAGE_KEY, undefined);
    broadcastMessage({ type: 'LOCATION_RESET_AUTO' });
    updateStatusBar(context);
    vscode.window.showInformationMessage(
      isEn
        ? 'Zen Clock location reset to Automatic Detection (IP Geolocation).'
        : 'Lokasi Zen Clock diatur kembali ke Deteksi Otomatis (IP Geolocation).'
    );
  } else {
    const cleanName = selected.label.replace('$(pin) ', '').trim();
    const city = POPULAR_CITIES.find((c) => c.name === cleanName);
    if (city) {
      const locationData: LocationData = {
        name: `${city.name}, ${city.region}`,
        lat: city.lat,
        lng: city.lng
      };
      await context.globalState.update(LOCATION_STORAGE_KEY, locationData);
      broadcastMessage({ type: 'LOCATION_UPDATED', data: locationData });
      updateStatusBar(context);
      vscode.window.showInformationMessage(
        isEn
          ? `Zen Clock location changed to: ${city.name}`
          : `Lokasi Zen Clock berhasil diubah ke: ${city.name}`
      );
    }
  }
}

async function promptAdjustPrayerTimes(context: vscode.ExtensionContext) {
  const currentAdjustments = context.globalState.get<PrayerAdjustments>(PRAYER_ADJUSTMENTS_STORAGE_KEY) || {};
  const lang = getLanguage();
  const isEn = lang === 'en';

  const prayerKeys: Array<{ key: keyof PrayerAdjustments; ihtiyat: number }> = [
    { key: 'fajr', ihtiyat: 2 },
    { key: 'sunrise', ihtiyat: -2 },
    { key: 'dhuhr', ihtiyat: 2 },
    { key: 'asr', ihtiyat: 2 },
    { key: 'maghrib', ihtiyat: 2 },
    { key: 'isha', ihtiyat: 2 }
  ];

  const items: (vscode.QuickPickItem & { prayerKey?: keyof PrayerAdjustments })[] = [
    ...prayerKeys.map((p) => {
      const prayerName = getPrayerName(p.key, lang);
      const userOffset = currentAdjustments[p.key] || 0;
      const totalOffset = p.ihtiyat + userOffset;
      const sign = userOffset >= 0 ? `+${userOffset}` : `${userOffset}`;
      const totalSign = totalOffset >= 0 ? `+${totalOffset}` : `${totalOffset}`;
      return {
        label: `$(watch) ${prayerName}`,
        description: isEn ? `Offset: ${sign}m (Total buffer: ${totalSign}m)` : `Koreksi: ${sign}m (Total buffer: ${totalSign}m)`,
        detail: isEn ? `Select to adjust minute offset for ${prayerName}` : `Pilih untuk mengatur koreksi menit sholat ${prayerName}`,
        prayerKey: p.key
      };
    }),
    {
      kind: vscode.QuickPickItemKind.Separator,
      label: isEn ? 'Standard Options' : 'Opsi Standar'
    },
    {
      label: isEn ? '$(refresh) Reset All to Kemenag RI Standard' : '$(refresh) Reset Semua ke Standar Kemenag RI',
      description: isEn ? 'Reset all manual offsets to 0 minutes' : 'Kembalikan seluruh koreksi manual ke 0 menit'
    }
  ];

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: isEn ? 'Select prayer time to configure minute offset...' : 'Pilih waktu sholat untuk mengatur penyesuaian menit (offset)...',
    matchOnDescription: true
  });

  if (!selected) return;

  if (selected.label.includes('Reset Semua') || selected.label.includes('Reset All')) {
    await context.globalState.update(PRAYER_ADJUSTMENTS_STORAGE_KEY, {});
    broadcastMessage({ type: 'PRAYER_ADJUSTMENTS_UPDATED', data: {} });
    updateStatusBar(context);
    vscode.window.showInformationMessage(
      isEn
        ? 'All prayer time adjustments reset to Kemenag RI standard (+2m ihtiyat).'
        : 'Seluruh penyesuaian waktu sholat dikembalikan ke standar Kemenag RI (+2m ihtiyat).'
    );
    return;
  }

  const pickedKey = selected.prayerKey;
  if (!pickedKey) return;
  const prayerName = getPrayerName(pickedKey, lang);

  const currentVal = currentAdjustments[pickedKey] || 0;
  const input = await vscode.window.showInputBox({
    prompt: isEn
      ? `Enter minute offset for ${prayerName} (e.g. 2 for +2 mins, -1 for -1 min, 0 for standard):`
      : `Masukkan koreksi menit untuk ${prayerName} (contoh: 2 untuk +2 menit, -1 untuk -1 menit, 0 untuk standar):`,
    value: String(currentVal),
    validateInput: (val) => {
      const num = parseInt(val.trim(), 10);
      if (isNaN(num)) {
        return isEn ? 'Please enter an integer minute (e.g. 1, -2, 0).' : 'Harap masukkan angka bulat menit (misal: 1, -2, 0).';
      }
      if (num < -60 || num > 60) {
        return isEn ? 'Offset value must be between -60 and +60 minutes.' : 'Nilai koreksi harus antara -60 sampai +60 menit.';
      }
      return null;
    }
  });

  if (input === undefined) return;

  const newOffset = parseInt(input.trim(), 10) || 0;
  const updatedAdjustments: PrayerAdjustments = {
    ...currentAdjustments,
    [pickedKey]: newOffset
  };

  await context.globalState.update(PRAYER_ADJUSTMENTS_STORAGE_KEY, updatedAdjustments);
  broadcastMessage({ type: 'PRAYER_ADJUSTMENTS_UPDATED', data: updatedAdjustments });
  updateStatusBar(context);
  vscode.window.showInformationMessage(
    isEn
      ? `${prayerName} prayer time adjusted: ${newOffset >= 0 ? '+' : ''}${newOffset} minutes.`
      : `Waktu ${prayerName} disesuaikan: ${newOffset >= 0 ? '+' : ''}${newOffset} menit.`
  );
}

function broadcastThemeColor() {
  const accent = vscode.workspace.getConfiguration('zenClock').get<string>('accentColor') || DEFAULT_ACCENT_COLOR;
  const theme = getThemeVariables(accent);

  broadcastMessage({
    type: 'THEME_COLOR_UPDATED',
    data: theme
  });

  if (ZenPrayerReminderPanel.currentPanel) {
    ZenPrayerReminderPanel.currentPanel.updateTheme();
  }
}

async function promptChangeAccentColor(context: vscode.ExtensionContext) {
  try {
    const currentAccent = vscode.workspace.getConfiguration('zenClock').get<string>('accentColor') || DEFAULT_ACCENT_COLOR;
    const lang = getLanguage();
    const isEn = lang === 'en';

    interface AccentQuickPickItem extends vscode.QuickPickItem {
      id?: string;
      hex?: string;
      isCustom?: boolean;
    }

    const items: AccentQuickPickItem[] = ACCENT_PRESETS.map((preset) => {
      const isSelected = preset.hex.toLowerCase() === currentAccent.toLowerCase() || preset.id === currentAccent.toLowerCase();
      return {
        label: preset.name,
        description: preset.hex,
        detail: `${isSelected ? (isEn ? '✓ Active — ' : '✓ Aktif — ') : ''}${preset.description}`,
        id: preset.id,
        hex: preset.hex
      };
    });

    items.push({
      label: isEn ? '$(color-mode) Custom Hex Color...' : '$(color-mode) Custom Hex Color...',
      description: isEn ? 'Input custom HEX color' : 'Input kode HEX sendiri',
      detail: isEn ? 'Enter any HEX color code (e.g., #ff6600, #3b82f6)' : 'Masukkan kode warna HEX bebas (contoh: #ff6600, #3b82f6)',
      isCustom: true
    });

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: isEn ? 'Select theme accent color for Zen Clock & Prayer Reminder' : 'Pilih warna aksen tema untuk Zen Clock & Pengingat Sholat'
    });

    if (!selected) return;

    if (selected.isCustom) {
      const inputHex = await vscode.window.showInputBox({
        prompt: isEn ? 'Enter HEX color code (e.g., #ff5722 or 10b981):' : 'Masukkan kode warna HEX (contoh: #ff5722 atau 10b981):',
        value: currentAccent.startsWith('#') ? currentAccent : '#',
        validateInput: (val) => {
          const clean = val.trim().replace(/^#/, '');
          if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(clean)) {
            return isEn ? 'Invalid HEX format. Use 3 or 6 hex digits (e.g., #ff5722).' : 'Format HEX tidak valid. Gunakan 3 atau 6 digit hex (contoh: #ff5722)';
          }
          return null;
        }
      });

      if (inputHex) {
        const formatted = inputHex.trim().startsWith('#') ? inputHex.trim() : `#${inputHex.trim()}`;
        await vscode.workspace.getConfiguration('zenClock').update('accentColor', formatted, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(
          isEn ? `Zen Clock theme color changed to: ${formatted}` : `Warna tema Zen Clock berhasil diubah ke: ${formatted}`
        );
        broadcastThemeColor();
      }
    } else if (selected.hex) {
      await vscode.workspace.getConfiguration('zenClock').update('accentColor', selected.hex, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(
        isEn ? `Zen Clock theme color changed to: ${selected.label}` : `Warna tema Zen Clock berhasil diubah ke: ${selected.label}`
      );
      broadcastThemeColor();
    }
  } catch (err: any) {
    vscode.window.showErrorMessage(`Gagal mengubah warna tema Zen Clock: ${err?.message || err}`);
  }
}

async function promptChangeLanguage(context: vscode.ExtensionContext) {
  const currentLang = getLanguage();
  const items: (vscode.QuickPickItem & { lang: Language })[] = [
    {
      label: '🇮🇩 Bahasa Indonesia (Bawaan)',
      description: 'id',
      detail: currentLang === 'id' ? '✓ Aktif saat ini' : undefined,
      lang: 'id'
    },
    {
      label: '🇬🇧 English',
      description: 'en',
      detail: currentLang === 'en' ? '✓ Currently active' : undefined,
      lang: 'en'
    }
  ];

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: currentLang === 'en'
      ? 'Select Zen Clock display language...'
      : 'Pilih bahasa tampilan Zen Clock...'
  });

  if (!selected) return;

  await vscode.workspace.getConfiguration('zenClock').update('language', selected.lang, vscode.ConfigurationTarget.Global);
  const t = getTranslations(selected.lang);
  const langName = selected.lang === 'id' ? 'Bahasa Indonesia' : 'English';
  vscode.window.showInformationMessage(
    t.prompts.languageChanged.replace('{lang}', langName)
  );
  broadcastLanguage();
  updateStatusBar(context);
  if (ZenPrayerReminderPanel.currentPanel) {
    ZenPrayerReminderPanel.currentPanel.updateLanguage();
  }
}

function updateStatusBar(context: vscode.ExtensionContext) {
  if (!statusBarItem) {
    return;
  }

  const lang = getLanguage();
  const t = getTranslations(lang);
  const isEn = lang === 'en';

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');

  const savedLocation = context.globalState.get<LocationData>(LOCATION_STORAGE_KEY) || {
    name: 'Jakarta',
    lat: -6.2088,
    lng: 106.8456
  };
  const cleanLocationName = (savedLocation.name || 'Jakarta').replace(/\s*\(Default\)/i, '');

  const savedAdjustments = context.globalState.get<PrayerAdjustments>(PRAYER_ADJUSTMENTS_STORAGE_KEY) || {};
  const coordinates = new Coordinates(savedLocation.lat, savedLocation.lng);
  const params = getKemenagCalculationParameters(savedAdjustments);
  const prayerTimes = new PrayerTimes(coordinates, now, params);

  const formatTime = (date: Date) => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  let nextPrayer = prayerTimes.nextPrayer();
  let nextPrayerDate = prayerTimes.timeForPrayer(nextPrayer);
  if (nextPrayer === 'none' || !nextPrayerDate || nextPrayerDate <= now) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = new PrayerTimes(coordinates, tomorrow, params);
    nextPrayer = tomorrowTimes.nextPrayer();
    nextPrayerDate = tomorrowTimes.timeForPrayer(nextPrayer);
  }

  const nextPrayerLabel = getPrayerName(nextPrayer.toLowerCase(), lang);
  const nextPrayerTimeStr = nextPrayerDate ? formatTime(nextPrayerDate) : '';

  const diffSeconds = nextPrayerDate ? Math.max(0, Math.floor((nextPrayerDate.getTime() - now.getTime()) / 1000)) : 0;
  const countdownShort = formatCountdownHoursMinutes(diffSeconds, lang);

  // Status Bar Text
  if (currentPomodoro.isRunning) {
    const pMins = Math.floor(currentPomodoro.timeLeft / 60);
    const pSecs = currentPomodoro.timeLeft % 60;
    const pTimeStr = `${String(pMins).padStart(2, '0')}:${String(pSecs).padStart(2, '0')}`;
    const pIcon = currentPomodoro.mode === 'work' ? '$(play)' : '$(coffee)';
    statusBarItem.text = `${pIcon} ${pTimeStr} [${currentPomodoro.mode === 'work' ? 'Work' : 'Break'}]`;
  } else {
    statusBarItem.text = `$(watch) ${hours}:${mins} • ${nextPrayerLabel} ${nextPrayerTimeStr}`;
  }

  // Status Bar Tooltip (Rich Markdown)
  const tooltip = new vscode.MarkdownString();
  tooltip.isTrusted = true;
  tooltip.supportThemeIcons = true;

  tooltip.appendMarkdown(`### ⏱️ **Zen Clock & Pomodoro**\n\n`);
  const pMins = Math.floor(currentPomodoro.timeLeft / 60);
  const pSecs = currentPomodoro.timeLeft % 60;
  const pTimeStr = `${String(pMins).padStart(2, '0')}:${String(pSecs).padStart(2, '0')}`;
  if (currentPomodoro.isRunning) {
    tooltip.appendMarkdown(
      isEn
        ? `- ▶️ **Running**: ${pTimeStr} remaining (${currentPomodoro.mode === 'work' ? 'Work' : 'Break'})\n\n`
        : `- ▶️ **Sedang Berjalan**: ${pTimeStr} tersisa (${currentPomodoro.mode === 'work' ? 'Work' : 'Break'})\n\n`
    );
  } else {
    tooltip.appendMarkdown(
      isEn
        ? `- ⏸️ **Idle / Paused**: ${pTimeStr} (${currentPomodoro.mode === 'work' ? 'Work' : 'Break'})\n\n`
        : `- ⏸️ **Idle / Jeda**: ${pTimeStr} (${currentPomodoro.mode === 'work' ? 'Work' : 'Break'})\n\n`
    );
  }

  tooltip.appendMarkdown(`---\n\n`);

  tooltip.appendMarkdown(`### 🕌 **${t.statusBar.scheduleTitle}**\n\n`);
  tooltip.appendMarkdown(isEn ? `📍 Location: **${cleanLocationName}**\n\n` : `📍 Lokasi: **${cleanLocationName}**\n\n`);
  tooltip.appendMarkdown(
    isEn
      ? `| &nbsp;&nbsp;Prayer&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;Time&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;Status&nbsp;&nbsp; |\n`
      : `| &nbsp;&nbsp;Waktu&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;Jam&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;Status&nbsp;&nbsp; |\n`
  );
  tooltip.appendMarkdown(`| :--- | :---: | :--- |\n`);

  const prayersList = [
    { key: 'fajr', name: getPrayerName('fajr', lang), time: prayerTimes.fajr },
    { key: 'sunrise', name: getPrayerName('sunrise', lang), time: prayerTimes.sunrise },
    { key: 'dhuhr', name: getPrayerName('dhuhr', lang), time: prayerTimes.dhuhr },
    { key: 'asr', name: getPrayerName('asr', lang), time: prayerTimes.asr },
    { key: 'maghrib', name: getPrayerName('maghrib', lang), time: prayerTimes.maghrib },
    { key: 'isha', name: getPrayerName('isha', lang), time: prayerTimes.isha }
  ];

  for (const p of prayersList) {
    const isNext = p.key.toLowerCase() === nextPrayer.toLowerCase();
    const marker = isNext ? (isEn ? `👉 **Next**` : `👉 **Berikutnya**`) : '—';
    const bold = isNext ? '**' : '';
    tooltip.appendMarkdown(`| &nbsp;&nbsp;${bold}${p.name}${bold}&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;${bold}${formatTime(p.time)}${bold}&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;${marker}&nbsp;&nbsp; |\n`);
  }

  tooltip.appendMarkdown(
    isEn
      ? `\n⏳ **${nextPrayerLabel}** ${t.statusBar.arrivesIn} \`${countdownShort}\`\n\n`
      : `\n⏳ **${nextPrayerLabel}** ${t.statusBar.arrivesIn} \`${countdownShort}\`\n\n`
  );

  tooltip.appendMarkdown(`---\n`);
  tooltip.appendMarkdown(
    (isEn
      ? `[$(location) Change City](command:extension-clock.changeLocation) &nbsp;•&nbsp; ` +
        `[$(gear) Adjust Time](command:extension-clock.adjustPrayerTimes) &nbsp;•&nbsp; ` +
        `[$(paintcan) Theme Color](command:extension-clock.changeAccentColor) &nbsp;•&nbsp; ` +
        `[$(globe) Switch Language](command:extension-clock.changeLanguage)`
      : `[$(location) Ganti Kota](command:extension-clock.changeLocation) &nbsp;•&nbsp; ` +
        `[$(gear) Sesuaikan Jam](command:extension-clock.adjustPrayerTimes) &nbsp;•&nbsp; ` +
        `[$(paintcan) Warna Tema](command:extension-clock.changeAccentColor) &nbsp;•&nbsp; ` +
        `[$(globe) Ganti Bahasa](command:extension-clock.changeLanguage)`)
  );

  const newTooltipMarkdown = tooltip.value;
  if (lastTooltipMarkdown !== newTooltipMarkdown) {
    statusBarItem.tooltip = tooltip;
    lastTooltipMarkdown = newTooltipMarkdown;
  }

  // Check prayer time arrival for reminder
  for (const p of prayersList) {
    if (!p.time || p.key === 'sunrise') continue;
    const diffMs = now.getTime() - p.time.getTime();
    if (diffMs >= 0 && diffMs < 60000) {
      const reminderKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${p.key}`;
      if (lastRemindedPrayerKey !== reminderKey) {
        lastRemindedPrayerKey = reminderKey;
        triggerPrayerReminder(context, {
          name: p.name,
          time: formatTime(p.time),
          location: cleanLocationName
        });
        broadcastMessage({ type: 'PRAYER_DATA_UPDATED' });
        break;
      }
    }
  }
}

async function triggerPrayerReminder(context: vscode.ExtensionContext, info: PrayerReminderInfo) {
  const autoOpen = vscode.workspace.getConfiguration('zenClock').get<boolean>('autoOpenPrayerReminder', true);
  const lang = getLanguage();
  const t = getTranslations(lang);

  if (autoOpen) {
    ZenPrayerReminderPanel.createOrShow(context.extensionUri, context, info);
    const msg = t.notifications.prayerArrived.replace('{name}', info.name) + ` (${info.location})`;
    vscode.window.showInformationMessage(msg);
  } else {
    const msg = t.notifications.prayerArrived.replace('{name}', info.name) + ` (${info.time})`;
    const action = await vscode.window.showInformationMessage(
      msg,
      t.notifications.openReminder,
      t.notifications.openClock
    );
    if (action === t.notifications.openReminder) {
      ZenPrayerReminderPanel.createOrShow(context.extensionUri, context, info);
    } else if (action === t.notifications.openClock) {
      vscode.commands.executeCommand('zen-clock-sidebar.focus');
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  // 1. Register Webview Panel Command (Open as Editor Panel)
  let openDisposable = vscode.commands.registerCommand('extension-clock.openClock', () => {
    ZenClockPanel.createOrShow(context.extensionUri, context);
  });
  context.subscriptions.push(openDisposable);

  // 2. Register Change Location Command
  let locationDisposable = vscode.commands.registerCommand('extension-clock.changeLocation', () => {
    promptChangeLocation(context);
  });
  context.subscriptions.push(locationDisposable);

  // 3. Register Focus Sidebar & Bottom Panel Commands
  let focusSidebarDisposable = vscode.commands.registerCommand('extension-clock.focusSidebar', () => {
    vscode.commands.executeCommand('zen-clock-sidebar.focus');
  });
  context.subscriptions.push(focusSidebarDisposable);

  let focusPanelDisposable = vscode.commands.registerCommand('extension-clock.focusPanel', () => {
    vscode.commands.executeCommand('zen-clock-panel-view.focus');
  });
  context.subscriptions.push(focusPanelDisposable);

  // 4. Register Preview Prayer Reminder Command
  let previewReminderDisposable = vscode.commands.registerCommand('extension-clock.previewReminder', () => {
    const savedLocation = context.globalState.get<LocationData>(LOCATION_STORAGE_KEY) || {
      name: 'Jakarta',
      lat: -6.2088,
      lng: 106.8456
    };
    const lang = getLanguage();
    ZenPrayerReminderPanel.createOrShow(context.extensionUri, context, {
      name: getPrayerName('asr', lang),
      time: '15:15',
      location: (savedLocation.name || 'Jakarta').replace(/\s*\(Default\)/i, '')
    });
  });
  context.subscriptions.push(previewReminderDisposable);

  // 5. Register Adjust Prayer Times Command
  let adjustPrayerDisposable = vscode.commands.registerCommand('extension-clock.adjustPrayerTimes', () => {
    promptAdjustPrayerTimes(context);
  });
  context.subscriptions.push(adjustPrayerDisposable);

  // 6. Register Pomodoro Controls Commands
  let togglePomodoroDisposable = vscode.commands.registerCommand('extension-clock.togglePomodoro', () => {
    if (currentPomodoro.isRunning) {
      pausePomodoro(context);
    } else {
      startPomodoro(context);
    }
  });
  context.subscriptions.push(togglePomodoroDisposable);

  let resetPomodoroDisposable = vscode.commands.registerCommand('extension-clock.resetPomodoro', () => {
    resetPomodoro(context);
  });
  context.subscriptions.push(resetPomodoroDisposable);

  // 7. Register Change Accent Color Command
  let changeAccentDisposable = vscode.commands.registerCommand('extension-clock.changeAccentColor', () => {
    promptChangeAccentColor(context);
  });
  context.subscriptions.push(changeAccentDisposable);

  // 8. Register Change Language Command
  let changeLanguageDisposable = vscode.commands.registerCommand('extension-clock.changeLanguage', () => {
    promptChangeLanguage(context);
  });
  context.subscriptions.push(changeLanguageDisposable);

  // Listen to configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('zenClock.accentColor')) {
        broadcastThemeColor();
      }
      if (e.affectsConfiguration('zenClock.language')) {
        broadcastLanguage();
        updateStatusBar(context);
        if (ZenPrayerReminderPanel.currentPanel) {
          ZenPrayerReminderPanel.currentPanel.updateLanguage();
        }
      }
    })
  );

  // 6. Register Webview View Providers (Sidebar View & Bottom Panel View)
  const sidebarProvider = new ZenClockViewProvider(context.extensionUri, context, 'sidebar');
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('zen-clock-sidebar', sidebarProvider)
  );

  const panelProvider = new ZenClockViewProvider(context.extensionUri, context, 'panel');
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('zen-clock-panel-view', panelProvider)
  );

  // 7. Initialize Status Bar Item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'extension-clock.focusSidebar';
  context.subscriptions.push(statusBarItem);
  statusBarItem.show();

  updateStatusBar(context);
  statusBarTimer = setInterval(() => {
    if (!currentPomodoro.isRunning) {
      updateStatusBar(context);
    }
  }, 15000);
}

export function deactivate() {
  if (statusBarTimer) {
    clearInterval(statusBarTimer);
  }
  if (pomodoroTimerInterval) {
    clearInterval(pomodoroTimerInterval);
  }
  activeWebviews.clear();
}

class ZenPrayerReminderPanel {
  public static currentPanel: ZenPrayerReminderPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _context: vscode.ExtensionContext;
  private _info: PrayerReminderInfo;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(
    extensionUri: vscode.Uri,
    context: vscode.ExtensionContext,
    info: PrayerReminderInfo
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : vscode.ViewColumn.One;

    const lang = getLanguage();
    const t = getTranslations(lang);

    if (ZenPrayerReminderPanel.currentPanel) {
      ZenPrayerReminderPanel.currentPanel._update(info);
      ZenPrayerReminderPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'zenPrayerReminder',
      `🕌 ${t.reminder.title.replace('{name}', info.name)}`,
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist')]
      }
    );

    ZenPrayerReminderPanel.currentPanel = new ZenPrayerReminderPanel(panel, extensionUri, context, info);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    context: vscode.ExtensionContext,
    info: PrayerReminderInfo
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._context = context;
    this._info = info;

    this._update(info);
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        const lang = getLanguage();
        const isEn = lang === 'en';
        switch (message.command) {
          case 'CLOSE':
            this.dispose();
            break;
          case 'OPEN_CLOCK':
            this.dispose();
            vscode.commands.executeCommand('zen-clock-panel-view.focus');
            break;
          case 'DISABLE_AUTO_OPEN':
            await vscode.workspace
              .getConfiguration('zenClock')
              .update('autoOpenPrayerReminder', false, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(
              isEn
                ? 'Automatic prayer reminder tab disabled. You will receive notifications instead.'
                : 'Fitur auto-open pengingat sholat telah dinonaktifkan. Pengingat selanjutnya akan berupa notifikasi.'
            );
            this.dispose();
            break;
        }
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    ZenPrayerReminderPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  public updateTheme() {
    if (this._info) {
      this._panel.webview.html = this._getHtml(this._panel.webview, this._info);
    }
  }

  public updateLanguage() {
    if (this._info) {
      const lang = getLanguage();
      const t = getTranslations(lang);
      this._panel.title = `🕌 ${t.reminder.title.replace('{name}', this._info.name)}`;
      this._panel.webview.html = this._getHtml(this._panel.webview, this._info);
    }
  }

  private _update(info: PrayerReminderInfo) {
    this._info = info;
    const lang = getLanguage();
    const t = getTranslations(lang);
    this._panel.title = `🕌 ${t.reminder.title.replace('{name}', info.name)}`;
    this._panel.webview.html = this._getHtml(this._panel.webview, info);
  }

  private _getHtml(webview: vscode.Webview, info: PrayerReminderInfo): string {
    const csp = webview.cspSource;
    const accent = vscode.workspace.getConfiguration('zenClock').get<string>('accentColor') || DEFAULT_ACCENT_COLOR;
    const theme = getThemeVariables(accent);
    const lang = getLanguage();
    const t = getTranslations(lang);
    const isEn = lang === 'en';

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${csp} 'unsafe-inline'; script-src ${csp} 'unsafe-inline'; font-src ${csp}; img-src ${csp} https: data:;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.reminder.title.replace('{name}', info.name)}</title>
  <style>
    :root {
      --zen-accent: ${theme.hex};
      --zen-accent-hover: ${theme.hover};
      --zen-accent-text: ${theme.text};
      --zen-accent-glow: ${theme.glow};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
      background: var(--vscode-editor-background, #0c0d10);
      color: var(--vscode-editor-foreground, #e0e0e0);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      background: var(--vscode-sideBar-background, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--vscode-widget-border, rgba(255, 255, 255, 0.1));
      border-radius: 16px;
      padding: 40px 32px;
      max-width: 500px;
      width: 100%;
      text-align: center;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(10px);
      animation: fadeIn 0.4s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .crescent-icon {
      width: 56px;
      height: 56px;
      margin: 0 auto 16px;
      color: var(--zen-accent);
      filter: drop-shadow(0 4px 16px var(--zen-accent-glow));
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      background: var(--zen-accent-glow);
      color: var(--zen-accent);
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
      color: var(--vscode-foreground, #ffffff);
    }
    .meta-info {
      font-size: 14px;
      opacity: 0.85;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .meta-pill {
      background: var(--vscode-badge-background, rgba(255, 255, 255, 0.08));
      color: var(--vscode-badge-foreground, #fff);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
    }
    .quote-box {
      border-left: 3px solid var(--zen-accent);
      background: rgba(255, 255, 255, 0.02);
      padding: 14px 16px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 28px;
      text-align: left;
      font-style: italic;
      font-size: 13px;
      line-height: 1.6;
      opacity: 0.9;
    }
    .quote-author {
      margin-top: 6px;
      font-size: 11px;
      font-weight: 600;
      opacity: 0.6;
      text-align: right;
      font-style: normal;
    }
    .btn-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .btn {
      width: 100%;
      padding: 12px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }
    .btn-primary {
      background: var(--zen-accent);
      color: var(--zen-accent-text);
      box-shadow: 0 2px 12px var(--zen-accent-glow);
    }
    .btn-primary:hover {
      background: var(--zen-accent-hover);
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: var(--vscode-button-secondaryBackground, rgba(255, 255, 255, 0.1));
      color: var(--vscode-button-secondaryForeground, #fff);
    }
    .btn-secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground, rgba(255, 255, 255, 0.16));
    }
    .btn-subtle {
      background: transparent;
      color: var(--vscode-descriptionForeground, #888);
      font-size: 12px;
      font-weight: normal;
      padding: 6px 12px;
    }
    .btn-subtle:hover {
      color: var(--vscode-foreground, #ccc);
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="card">
    <svg class="crescent-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
    <div class="badge">${isEn ? 'Prayer Time' : 'Waktu Sholat'}</div>
    <h1>${t.reminder.title.replace('{name}', info.name)}</h1>
    <div class="meta-info">
      <span class="meta-pill">🕐 ${info.time}</span>
      <span class="meta-pill">📍 ${info.location}</span>
    </div>
    <div class="quote-box">
      ${t.reminder.quranQuote}
      <div class="quote-author">— ${t.reminder.quranSurah}</div>
    </div>
    <div class="btn-group">
      <button class="btn btn-primary" onclick="vscode.postMessage({ command: 'CLOSE' })">${t.reminder.readyToPray}</button>
      <button class="btn btn-secondary" onclick="vscode.postMessage({ command: 'OPEN_CLOCK' })">${t.reminder.openZenClock}</button>
      <button class="btn btn-subtle" onclick="vscode.postMessage({ command: 'DISABLE_AUTO_OPEN' })">${t.reminder.disableAutoOpen}</button>
    </div>
  </div>
  <script>
    const vscode = acquireVsCodeApi();
  </script>
</body>
</html>`;
  }
}

class ZenClockPanel {
  public static currentPanel: ZenClockPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _context: vscode.ExtensionContext;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (ZenClockPanel.currentPanel) {
      ZenClockPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'zenClock',
      'Zen Flip Clock',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist')]
      }
    );

    ZenClockPanel.currentPanel = new ZenClockPanel(panel, extensionUri, context);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._context = context;

    activeWebviews.add(this._panel.webview);

    this._update();
    sendPomodoroState(this._panel.webview);
    sendLanguageState(this._panel.webview);
    this._panel.onDidChangeViewState(
      (e) => {
        if (e.webviewPanel.visible) {
          sendPomodoroState(this._panel.webview);
          sendLanguageState(this._panel.webview);
        }
      },
      null,
      this._disposables
    );
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._setupMessageListener();
  }

  private _setupMessageListener() {
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        handleWebviewMessage(message, this._panel.webview, this._context);
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    activeWebviews.delete(this._panel.webview);
    ZenClockPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    const webview = this._panel.webview;
    this._panel.title = 'Zen Flip Clock';
    this._panel.webview.html = getWebviewContent(webview, this._extensionUri, 'editor');
  }
}

class ZenClockViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _context: vscode.ExtensionContext,
    private readonly _viewType: 'sidebar' | 'panel' = 'sidebar'
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    activeWebviews.add(webviewView.webview);

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        sendPomodoroState(webviewView.webview);
        sendLanguageState(webviewView.webview);
      }
    });

    webviewView.onDidDispose(() => {
      activeWebviews.delete(webviewView.webview);
    });

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'dist')]
    };

    webviewView.webview.html = getWebviewContent(webviewView.webview, this._extensionUri, this._viewType);
    sendPomodoroState(webviewView.webview);
    sendLanguageState(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message) => {
      handleWebviewMessage(message, webviewView.webview, this._context);
    });
  }
}

function handleWebviewMessage(message: any, webview: vscode.Webview, context: vscode.ExtensionContext) {
  switch (message.type) {
    case 'SHOW_NOTIFICATION':
      if (message.level === 'info') {
        vscode.window.showInformationMessage(message.text);
      } else if (message.level === 'warning') {
        vscode.window.showWarningMessage(message.text);
      }
      break;

    case 'REQUEST_CHANGE_LOCATION':
      promptChangeLocation(context);
      break;

    case 'REQUEST_ADJUST_PRAYER':
      promptAdjustPrayerTimes(context);
      break;

    case 'GET_PRAYER_ADJUSTMENTS': {
      const saved = context.globalState.get<PrayerAdjustments>(PRAYER_ADJUSTMENTS_STORAGE_KEY) || {};
      webview.postMessage({ type: 'PRAYER_ADJUSTMENTS_UPDATED', data: saved });
      break;
    }

    case 'GET_SAVED_LOCATION': {
      const saved = context.globalState.get<LocationData>(LOCATION_STORAGE_KEY);
      if (saved) {
        webview.postMessage({ type: 'LOCATION_UPDATED', data: saved });
      }
      break;
    }

    case 'GET_POMODORO_STATE':
      sendPomodoroState(webview);
      break;

    case 'GET_THEME_COLOR': {
      const accent = vscode.workspace.getConfiguration('zenClock').get<string>('accentColor') || DEFAULT_ACCENT_COLOR;
      webview.postMessage({ type: 'THEME_COLOR_UPDATED', data: getThemeVariables(accent) });
      break;
    }

    case 'REQUEST_CHANGE_ACCENT':
      promptChangeAccentColor(context);
      break;

    case 'GET_LANGUAGE':
      sendLanguageState(webview);
      break;

    case 'REQUEST_CHANGE_LANGUAGE':
      promptChangeLanguage(context);
      break;

    case 'POMODORO_CMD':
      if (message.action === 'start') {
        startPomodoro(context);
      } else if (message.action === 'pause') {
        pausePomodoro(context);
      } else if (message.action === 'reset') {
        resetPomodoro(context);
      } else if (message.action === 'switchMode') {
        const targetMode: 'work' | 'break' = message.mode === 'break' ? 'break' : 'work';
        if (targetMode === currentPomodoro.mode) {
          break;
        }

        if (currentPomodoro.isRunning) {
          const modeLabel = targetMode === 'break' ? 'Istirahat (Break 5m)' : 'Kerja (Work 25m)';
          vscode.window
            .showWarningMessage(
              `Sesi Pomodoro sedang berjalan. Beralih ke mode ${modeLabel} akan menghentikan dan mereset sesi aktif. Anda yakin?`,
              'Ya, Ganti Mode',
              'Batal'
            )
            .then((choice) => {
              if (choice === 'Ya, Ganti Mode') {
                switchPomodoroMode(context, targetMode);
              } else {
                broadcastPomodoroState();
              }
            });
        } else {
          switchPomodoroMode(context, targetMode);
        }
      }
      break;
  }
}

function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  viewType: 'sidebar' | 'panel' | 'editor' = 'sidebar'
): string {
  const distPath = vscode.Uri.joinPath(extensionUri, 'dist');
  const htmlPath = path.join(distPath.fsPath, 'index.html');

  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Inject CSP meta tag if not present
    const cspSource = webview.cspSource;
    const cspMeta = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource} https: data:; script-src ${cspSource} 'unsafe-inline'; style-src ${cspSource} 'unsafe-inline'; font-src ${cspSource}; connect-src https:;">`;
    if (!html.includes('Content-Security-Policy')) {
      html = html.replace('<head>', `<head>\n    ${cspMeta}`);
    }

    // Inject initial theme CSS variables so there is zero flash of unstyled theme
    const accent = vscode.workspace.getConfiguration('zenClock').get<string>('accentColor') || DEFAULT_ACCENT_COLOR;
    const theme = getThemeVariables(accent);
    const themeStyle = `<style id="zen-theme-vars">:root { --zen-accent: ${theme.hex}; --zen-accent-hover: ${theme.hover}; --zen-accent-text: ${theme.text}; --zen-accent-glow: ${theme.glow}; }</style>`;
    html = html.replace('</head>', `    ${themeStyle}\n  </head>`);

    // Inject data-view to body tag for view-specific CSS adaptations
    html = html.replace(/<body([^>]*)>/, `<body$1 data-view="${viewType}">`);

    // Replace all relative and absolute paths (./assets/..., ./webview.js, /assets/..., etc.) to webview asWebviewUri
    html = html.replace(/(href|src)="(?:\.\/|\/)?(.*?)"/g, (match, attr, relativePath) => {
      if (
        relativePath.startsWith('http:') ||
        relativePath.startsWith('https:') ||
        relativePath.startsWith('data:') ||
        relativePath.startsWith('#')
      ) {
        return match;
      }
      const resourceUri = webview.asWebviewUri(vscode.Uri.joinPath(distPath, relativePath));
      return `${attr}="${resourceUri}"`;
    });

    return html;
  }

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Zen Flip Clock</title>
  </head>
  <body data-view="${viewType}">
    <h3>Zen Flip Clock</h3>
    <p>Please build the extension first by running <code>npm run build</code>.</p>
  </body>
  </html>`;
}
