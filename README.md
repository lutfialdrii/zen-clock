# ⏰ Zen Clock: Pomodoro & Muslim Prayer Times

<p align="center">
  <img src="./assets/preview-extension-full.png" alt="Zen Clock: Pomodoro & Muslim Prayer Times" width="100%" />
</p>

<p align="center">
  <b>A mindful 3D retro mechanical flip clock, true background Pomodoro timer, and automated Muslim prayer times with Kemenag RI standards for Visual Studio Code & Antigravity IDE.</b>
</p>

<p align="center">
  <b>English</b> | <a href="./README.id.md">Bahasa Indonesia</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/VS_Code-Extension-007acc?logo=visualstudiocode&logoColor=white" alt="VS Code Extension" />
  <img src="https://img.shields.io/badge/Antigravity_IDE-Compatible-4285F4?logo=google&logoColor=white" alt="Antigravity IDE" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

---

## 🌟 Key Features

### 🕰️ 1. 3D Zen Flip Clock
- Minimalist, distraction-free retro mechanical flip clock.
- Smooth CSS 3D card folding transitions and localized date display.
- Works as a persistent companion in your Activity Bar (Sidebar) or Bottom Panel (alongside Terminal and Output).

### 🍅 2. True Background Pomodoro Engine
- **Immune to Hibernation/Closing**: Powered directly by the **Extension Host (Node.js)** background process. The timer continues ticking accurately even when webviews are closed, minimized, or when you switch files.
- **Synchronized Across Views**: The sidebar, bottom panel, editor tabs, and status bar always share a single, unified timer state.
- **Status Bar Integration**: Displays real-time live seconds ticking (e.g. `$(play) 24:45 [Work]`) in your VS Code status bar.
- **Native OS Notifications**: Interactive dialogs upon work/break completion with quick action buttons (`Start Break`, `Start Work`).

### 🕌 3. Automated Islamic Prayer Times (Kemenag RI Standard)
- Accurate astronomical prayer calculation using [`adhan`](https://github.com/batoulapps/adhan-js).
- **Official Kemenag RI Parameters**:
  - Fajr angle: **20°**, Isha angle: **18°**
  - Madhab: **Shafi'i**
  - Rounding: **Rounding Up**
  - Ihtiyat (safety buffer): **+2 minutes** on all prayer times (Sunrise: -2m).
- **Interactive Time Adjustments**: Easily fine-tune minutes offset per prayer time using the QuickPick menu or in-webview adjustment button.

### ⏳ 4. Precision Countdown on Hover & Real-Time Auto-Refresh
- **Status Bar Hover Tooltip**: Hovering over the status bar item reveals a rich Markdown tooltip with exact seconds countdown (`⏳ Subuh arrives in: 01h 23m 45s (01:23:45)`).
- **Live Active Indicators**: The upcoming prayer row in the schedule table displays the live ticking countdown.
- **Zero-Reload Auto-Refresh**: The moment prayer time arrives (`00:00:00`), the extension host automatically notifies you and smoothly rolls over to the next prayer schedule without requiring a reload.

### 📖 5. Dedicated Peaceful Prayer Reminder Page
- A peaceful, elegant editor tab (`zenPrayerReminder`) with a calm dark theme, prayer info, and inspirational Quranic quote.
- Configurable via `zenClock.autoOpenPrayerReminder`: choose between automatic tab opening or subtle notification prompts.

### 📍 6. Smart Geolocation & City Selector
- QuickPick city selector with popular Indonesian cities and global city search via OpenStreetMap Nominatim.
- Automatic IP geolocation fallback.

---

## 📸 Interface Gallery

### 1. Flexible Viewport Layouts
| 📌 Primary Sidebar View | 🗂️ Bottom Panel (Terminal Area) |
| :---: | :---: |
| <img src="./assets/preview-sidebar.png" alt="Zen Clock Primary Sidebar View" width="100%" /> | <img src="./assets/preview-bottom-panel.png" alt="Zen Clock Bottom Panel View" width="100%" /> |
| *Compact vertical layout for continuous background presence.* | *Expansive widescreen layout docking alongside Terminal & Output.* |

| 📑 Full Editor Tab (Zen Focus Mode) |
| :---: |
| <img src="./assets/preview-extension-full.png" alt="Zen Clock Full Editor View" width="100%" /> |
| *Large mechanical 3D flip cards in an editor tab for dedicated desk clock mode.* |

### 2. Status Bar & Precision Countdown
| ⏱️ Live Status Bar Indicator & Rich Hover Tooltip |
| :---: |
| <img src="./assets/preview-statusbar-hover.png" alt="Status Bar Indicator & Hover Schedule Tooltip" width="100%" /> |
| *Right-aligned status bar widget with a hover popover showing today's schedule and exact ticking seconds countdown.* |

### 3. Pomodoro Timer & Visual Customization
| 🍅 2-Card Pomodoro Timer Engine | 🎨 Theme Accent Colors & Custom HEX |
| :---: | :---: |
| <img src="./assets/preview-pomodoro.png" alt="Pomodoro Timer Engine" width="100%" /> | <img src="./assets/preview-theme.png" alt="Theme Accent Color Customization" width="100%" /> |
| *Bold proportional 2-card flip timer running reliably in Extension Host.* | *Curated palette (Warm Amber, Islamic Emerald, Cyan, Rose, Purple) + Custom HEX.* |

### 4. Peaceful Prayer Reminder
| 🕌 Auto-Opening Prayer Reminder Tab |
| :---: |
| <img src="./assets/preview-prayer-reminder.png" alt="Zen Prayer Reminder Tab" width="100%" /> |
| *Serene editor tab that opens at prayer time with local prayer info and inspirational Quranic verses.* |

---

## 📦 Installation (.vsix)

Download the `.vsix` extension package from the [Releases](https://github.com/lutfialdrii/zen-clock/releases) page.

### Method 1: Via VS Code / Antigravity IDE UI (Recommended)
1. Open **VS Code** or **Antigravity IDE**.
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on macOS) to open the **Extensions** panel.
3. Click the three dots menu (**`...`**) in the top-right corner.
4. Select **Install from VSIX...**
5. Select the downloaded `extension-clock-0.0.1.vsix` file.
6. The **Zen Clock** icon will appear on your Activity Bar!

### Method 2: Via Terminal / Command Line
```bash
code --install-extension extension-clock-0.0.1.vsix
```
*(Or `antigravity --install-extension extension-clock-0.0.1.vsix` for Antigravity IDE CLI)*

---

## ⌨️ Commands

Access these commands from the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | Title | Description |
| :--- | :--- | :--- |
| `extension-clock.openClock` | **Zen Clock: Open in Editor Tab** | Opens the Zen Clock in a full editor tab |
| `extension-clock.focusSidebar` | **Zen Clock: Open in Sidebar** | Opens and focuses the Zen Clock sidebar view |
| `extension-clock.focusPanel` | **Zen Clock: Open in Bottom Panel** | Focuses the Zen Clock view in the bottom panel |
| `extension-clock.togglePomodoro` | **Zen Clock: Pomodoro: Start / Pause Timer** | Toggles Pomodoro timer on/off |
| `extension-clock.resetPomodoro` | **Zen Clock: Pomodoro: Reset Timer** | Resets Pomodoro timer to default duration |
| `extension-clock.changeLocation` | **Zen Clock: Prayer Times: Change City / Location** | Select popular cities or search global cities |
| `extension-clock.adjustPrayerTimes`| **Zen Clock: Prayer Times: Adjust Minutes** | Adjust minutes offset (+/-) per prayer time |
| `extension-clock.previewReminder` | **Zen Clock: Prayer Times: Preview Reminder Page** | Previews the prayer reminder tab |
| `extension-clock.changeAccentColor` | **Zen Clock: Theme: Change Accent Color** | Select or customize accent color for clock, timer, & reminder |

---

## ⚙️ Extension Settings

Configure via **Settings** (`Ctrl+,` or `Cmd+,` $\rightarrow$ Search `Zen Clock`):

| Setting | Type | Default | Description |
| :--- | :---: | :---: | :--- |
| `zenClock.autoOpenPrayerReminder` | `boolean` | `true` | Automatically open the dedicated reminder tab when prayer time arrives |
| `zenClock.accentColor` | `string` | `"#fbbf24"` | Theme accent color preset or hex code for clock digits, buttons, and prayer reminder |

---

## 💻 Development & Building

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Compile TypeScript & Build Webview
npm run compile

# 3. Package extension into .vsix
npm run package:vsix
```

### Local Debugging
1. Open this repository in VS Code or Antigravity IDE.
2. Press `F5` (Launch Extension). A new Extension Development Host window will open with Zen Clock active.

---

## 🌐 Standalone Web & PWA Version

Looking for the standalone web app / Progressive Web App (PWA) version of Zen Clock?  
The web edition is maintained in its dedicated repository: [`zen-flip-clock`](https://github.com/lutfialdrii/zen-flip-clock).

---

## 📄 License

Distributed under the MIT License. See [LICENSE](./LICENSE) for details.
