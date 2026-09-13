import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

const LOCATION_STORAGE_KEY = 'zenClock.selectedLocation';
const activeWebviews = new Set<vscode.Webview>();

interface LocationData {
  name: string;
  lat: number;
  lng: number;
}

interface PomodoroState {
  isRunning: boolean;
  mode: 'work' | 'break';
  timeLeft: number;
}

interface PrayerReminderInfo {
  name: string;
  time: string;
  location: string;
}

let currentPomodoro: PomodoroState = {
  isRunning: false,
  mode: 'work',
  timeLeft: 25 * 60
};

let statusBarItem: vscode.StatusBarItem;
let statusBarTimer: NodeJS.Timeout | undefined;
let lastRemindedPrayerKey = '';

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

async function promptChangeLocation(context: vscode.ExtensionContext) {
  const currentSaved = context.globalState.get<LocationData>(LOCATION_STORAGE_KEY);

  const quickPickItems: vscode.QuickPickItem[] = [
    {
      label: '$(search) Cari Kota Lain...',
      description: 'Ketik nama kota manual (Indonesia atau Dunia)'
    },
    {
      label: '$(globe) Deteksi Otomatis (IP Geolocation)',
      description: 'Gunakan deteksi lokasi otomatis dari jaringan'
    },
    {
      kind: vscode.QuickPickItemKind.Separator,
      label: 'Kota Populer'
    },
    ...POPULAR_CITIES.map((c) => ({
      label: `$(pin) ${c.name}`,
      description: c.region,
      detail: currentSaved && currentSaved.name.includes(c.name) ? '✓ Lokasi aktif saat ini' : undefined
    }))
  ];

  const selected = await vscode.window.showQuickPick(quickPickItems, {
    placeHolder: currentSaved
      ? `Lokasi aktif: ${currentSaved.name} (Pilih untuk mengganti)`
      : 'Pilih kota untuk perhitungan jadwal waktu sholat...',
    matchOnDescription: true,
    matchOnDetail: true
  });

  if (!selected) {
    return;
  }

  if (selected.label.includes('Cari Kota Lain')) {
    const query = await vscode.window.showInputBox({
      prompt: 'Masukkan nama kota (contoh: Cirebon, Purwokerto, London, Tokyo):',
      placeHolder: 'Nama kota...'
    });

    if (!query || !query.trim()) {
      return;
    }

    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Mencari koordinat untuk "${query}"...`,
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
            vscode.window.showInformationMessage(`Lokasi Zen Clock berhasil diubah ke: ${shortName}`);
          } else {
            vscode.window.showErrorMessage(`Kota "${query}" tidak ditemukan. Silakan periksa kembali ejaan.`);
          }
        }
      );
    } catch (err) {
      vscode.window.showErrorMessage(`Gagal mengambil data lokasi: ${err}`);
    }
  } else if (selected.label.includes('Deteksi Otomatis')) {
    await context.globalState.update(LOCATION_STORAGE_KEY, undefined);
    broadcastMessage({ type: 'LOCATION_RESET_AUTO' });
    updateStatusBar(context);
    vscode.window.showInformationMessage('Lokasi Zen Clock diatur kembali ke Deteksi Otomatis (IP Geolocation).');
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
      vscode.window.showInformationMessage(`Lokasi Zen Clock berhasil diubah ke: ${city.name}`);
    }
  }
}

function updateStatusBar(context: vscode.ExtensionContext) {
  if (!statusBarItem) {
    return;
  }

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');

  const savedLocation = context.globalState.get<LocationData>(LOCATION_STORAGE_KEY) || {
    name: 'Jakarta (Default)',
    lat: -6.2088,
    lng: 106.8456
  };

  const coordinates = new Coordinates(savedLocation.lat, savedLocation.lng);
  const params = CalculationMethod.MuslimWorldLeague();
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

  const prayerNames: Record<string, string> = {
    fajr: 'Subuh',
    sunrise: 'Terbit',
    dhuhr: 'Dzuhur',
    asr: 'Ashar',
    maghrib: 'Maghrib',
    isha: 'Isya'
  };

  const nextPrayerLabel = prayerNames[nextPrayer.toLowerCase()] || nextPrayer;
  const nextPrayerTimeStr = nextPrayerDate ? formatTime(nextPrayerDate) : '';

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
    tooltip.appendMarkdown(`- **Pomodoro**: ▶️ Sedang Berjalan (${pTimeStr} tersisa • ${currentPomodoro.mode === 'work' ? 'Work' : 'Break'})\n\n`);
  } else {
    tooltip.appendMarkdown(`- **Pomodoro**: ⏸️ Idle / Jeda (${pTimeStr} • ${currentPomodoro.mode === 'work' ? 'Work' : 'Break'})\n\n`);
  }

  tooltip.appendMarkdown(`---\n\n`);

  tooltip.appendMarkdown(`### 🕌 **Jadwal Waktu Sholat Hari Ini**\n`);
  tooltip.appendMarkdown(`📍 **Lokasi**: ${savedLocation.name}\n\n`);
  tooltip.appendMarkdown(`| Waktu | Jam | Status |\n`);
  tooltip.appendMarkdown(`| :--- | :---: | :---: |\n`);

  const prayersList = [
    { key: 'fajr', name: 'Subuh', time: prayerTimes.fajr },
    { key: 'sunrise', name: 'Terbit', time: prayerTimes.sunrise },
    { key: 'dhuhr', name: 'Dzuhur', time: prayerTimes.dhuhr },
    { key: 'asr', name: 'Ashar', time: prayerTimes.asr },
    { key: 'maghrib', name: 'Maghrib', time: prayerTimes.maghrib },
    { key: 'isha', name: 'Isya', time: prayerTimes.isha }
  ];

  for (const p of prayersList) {
    const isNext = p.key.toLowerCase() === nextPrayer.toLowerCase();
    const marker = isNext ? '👉 **Berikutnya**' : '—';
    const bold = isNext ? '**' : '';
    tooltip.appendMarkdown(`| ${bold}${p.name}${bold} | ${bold}${formatTime(p.time)}${bold} | ${marker} |\n`);
  }

  tooltip.appendMarkdown(`\n---\n`);
  tooltip.appendMarkdown(`[$(layout-panel) Buka Bottom Panel](command:extension-clock.focusPanel) &nbsp;|&nbsp; [$(location) Ganti Kota](command:extension-clock.changeLocation)`);

  statusBarItem.tooltip = tooltip;

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
          location: savedLocation.name
        });
        break;
      }
    }
  }
}

async function triggerPrayerReminder(context: vscode.ExtensionContext, info: PrayerReminderInfo) {
  const autoOpen = vscode.workspace.getConfiguration('zenClock').get<boolean>('autoOpenPrayerReminder', true);

  if (autoOpen) {
    ZenPrayerReminderPanel.createOrShow(context.extensionUri, context, info);
    vscode.window.showInformationMessage(`🕌 Waktu Sholat ${info.name} telah tiba! (${info.location})`);
  } else {
    const action = await vscode.window.showInformationMessage(
      `🕌 Waktu Sholat ${info.name} (${info.time}) telah tiba!`,
      'Buka Pengingat',
      'Buka Zen Clock'
    );
    if (action === 'Buka Pengingat') {
      ZenPrayerReminderPanel.createOrShow(context.extensionUri, context, info);
    } else if (action === 'Buka Zen Clock') {
      vscode.commands.executeCommand('zen-clock-panel-view.focus');
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

  // 3. Register Focus Bottom Panel Command
  let focusPanelDisposable = vscode.commands.registerCommand('extension-clock.focusPanel', () => {
    vscode.commands.executeCommand('zen-clock-panel-view.focus');
  });
  context.subscriptions.push(focusPanelDisposable);

  // 4. Register Preview Prayer Reminder Command
  let previewReminderDisposable = vscode.commands.registerCommand('extension-clock.previewReminder', () => {
    const savedLocation = context.globalState.get<LocationData>(LOCATION_STORAGE_KEY) || {
      name: 'Jakarta (Default)',
      lat: -6.2088,
      lng: 106.8456
    };
    ZenPrayerReminderPanel.createOrShow(context.extensionUri, context, {
      name: 'Ashar',
      time: '15:15',
      location: savedLocation.name
    });
  });
  context.subscriptions.push(previewReminderDisposable);

  // 5. Register Webview View Providers (Sidebar View & Bottom Panel View)
  const sidebarProvider = new ZenClockViewProvider(context.extensionUri, context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('zen-clock-sidebar', sidebarProvider)
  );

  const panelProvider = new ZenClockViewProvider(context.extensionUri, context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('zen-clock-panel-view', panelProvider)
  );

  // 6. Initialize Status Bar Item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'extension-clock.focusPanel';
  context.subscriptions.push(statusBarItem);
  statusBarItem.show();

  updateStatusBar(context);
  statusBarTimer = setInterval(() => {
    updateStatusBar(context);
  }, 1000);
}

export function deactivate() {
  if (statusBarTimer) {
    clearInterval(statusBarTimer);
  }
  activeWebviews.clear();
}

class ZenPrayerReminderPanel {
  public static currentPanel: ZenPrayerReminderPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _context: vscode.ExtensionContext;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(
    extensionUri: vscode.Uri,
    context: vscode.ExtensionContext,
    info: PrayerReminderInfo
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : vscode.ViewColumn.One;

    if (ZenPrayerReminderPanel.currentPanel) {
      ZenPrayerReminderPanel.currentPanel._update(info);
      ZenPrayerReminderPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'zenPrayerReminder',
      `🕌 Waktu Sholat ${info.name}`,
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

    this._update(info);
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
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
              'Fitur auto-open pengingat sholat telah dinonaktifkan. Pengingat selanjutnya akan berupa notifikasi.'
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

  private _update(info: PrayerReminderInfo) {
    this._panel.title = `🕌 Waktu Sholat ${info.name}`;
    this._panel.webview.html = this._getHtml(this._panel.webview, info);
  }

  private _getHtml(webview: vscode.Webview, info: PrayerReminderInfo): string {
    const csp = webview.cspSource;
    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${csp} 'unsafe-inline'; script-src ${csp} 'unsafe-inline'; font-src ${csp}; img-src ${csp} https: data:;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Waktu Sholat ${info.name}</title>
  <style>
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
      color: #fbbf24;
      filter: drop-shadow(0 4px 16px rgba(251, 191, 36, 0.35));
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(251, 191, 36, 0.15);
      color: #fbbf24;
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
      border-left: 3px solid #fbbf24;
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
      background: #fbbf24;
      color: #1a1a1a;
    }
    .btn-primary:hover {
      background: #f59e0b;
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
    <div class="badge">Waktu Sholat</div>
    <h1>Panggilan Sholat ${info.name}</h1>
    <div class="meta-info">
      <span class="meta-pill">🕐 ${info.time}</span>
      <span class="meta-pill">📍 ${info.location}</span>
    </div>
    <div class="quote-box">
      "Dirikanlah shalat, sesungguhnya shalat itu mencegah dari (perbuatan) keji dan mungkar."
      <div class="quote-author">— QS. Al-Ankabut: 45</div>
    </div>
    <div class="btn-group">
      <button class="btn btn-primary" onclick="vscode.postMessage({ command: 'CLOSE' })">✓ Saya Siap Sholat (Tutup)</button>
      <button class="btn btn-secondary" onclick="vscode.postMessage({ command: 'OPEN_CLOCK' })">⏱️ Buka Zen Clock</button>
      <button class="btn btn-subtle" onclick="vscode.postMessage({ command: 'DISABLE_AUTO_OPEN' })">⚙️ Matikan Auto-Open Tab Ini</button>
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
    this._panel.webview.html = getWebviewContent(webview, this._extensionUri);
  }
}

class ZenClockViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _context: vscode.ExtensionContext
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    activeWebviews.add(webviewView.webview);

    webviewView.onDidDispose(() => {
      activeWebviews.delete(webviewView.webview);
    });

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'dist')]
    };

    webviewView.webview.html = getWebviewContent(webviewView.webview, this._extensionUri);

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

    case 'GET_SAVED_LOCATION': {
      const saved = context.globalState.get<LocationData>(LOCATION_STORAGE_KEY);
      if (saved) {
        webview.postMessage({ type: 'LOCATION_UPDATED', data: saved });
      }
      break;
    }

    case 'POMODORO_STATUS':
      currentPomodoro = {
        isRunning: !!message.isRunning,
        mode: message.mode || 'work',
        timeLeft: typeof message.timeLeft === 'number' ? message.timeLeft : 25 * 60
      };
      updateStatusBar(context);
      break;
  }
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
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
  <body>
    <h3>Zen Flip Clock</h3>
    <p>Please build the extension first by running <code>npm run build</code>.</p>
  </body>
  </html>`;
}
