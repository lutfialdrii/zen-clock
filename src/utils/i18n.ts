export type Language = 'id' | 'en';

export interface Translations {
  // Prayer names
  prayers: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  // Status bar & countdown
  statusBar: {
    scheduleTitle: string;
    next: string;
    arrivesIn: string;
    now: string;
    todaySchedule: string;
  };
  // Countdown units
  countdown: {
    now: string;
    lessThanMinute: string;
    hours: string;
    minutes: string;
    seconds: string;
    hourSingular: string;
    minuteSingular: string;
    secondSingular: string;
    in: string;
  };
  // Webview UI
  ui: {
    adjustTime: string;
    themeColor: string;
    notifActive: string;
    notifInactive: string;
    clickToChangeCity: string;
    navClock: string;
    navPomodoro: string;
    work: string;
    break: string;
    start: string;
    pause: string;
    reset: string;
    customHexPlaceholder: string;
  };
  // Notifications & Prompts
  notifications: {
    prayerArrived: string;
    openReminder: string;
    openClock: string;
    pomodoroFinished: string;
    breakFinished: string;
    breakPrompt: string;
    workPrompt: string;
  };
  // QuickPick Prompts
  prompts: {
    changeLanguageTitle: string;
    languageChanged: string;
    cityPickerTitle: string;
    citySearchPlaceholder: string;
    adjustPickerTitle: string;
    adjustResetConfirm: string;
    themePickerTitle: string;
  };
  // Reminder Panel
  reminder: {
    title: string;
    readyToPray: string;
    openZenClock: string;
    disableAutoOpen: string;
    quranQuote: string;
    quranSurah: string;
    disclaimer: string;
  };
}

export const translations: Record<Language, Translations> = {
  id: {
    prayers: {
      fajr: 'Subuh',
      sunrise: 'Terbit',
      dhuhr: 'Dzuhur',
      asr: 'Ashar',
      maghrib: 'Maghrib',
      isha: 'Isya'
    },
    statusBar: {
      scheduleTitle: 'Jadwal Sholat Hari Ini',
      next: 'Berikutnya',
      arrivesIn: 'tiba dalam',
      now: 'sekarang',
      todaySchedule: 'Jadwal Hari Ini'
    },
    countdown: {
      now: 'sekarang',
      lessThanMinute: '< 1 menit',
      hours: 'jam',
      minutes: 'menit',
      seconds: 'detik',
      hourSingular: 'jam',
      minuteSingular: 'menit',
      secondSingular: 'detik',
      in: 'dalam'
    },
    ui: {
      adjustTime: 'Sesuaikan Jam',
      themeColor: 'Warna Tema',
      notifActive: 'Notifikasi sholat aktif',
      notifInactive: 'Notifikasi sholat nonaktif',
      clickToChangeCity: 'Klik untuk memilih atau mengubah kota',
      navClock: 'Clock',
      navPomodoro: 'Pomodoro',
      work: 'Work',
      break: 'Break',
      start: 'Mulai',
      pause: 'Jeda',
      reset: 'Reset',
      customHexPlaceholder: 'Input hex kustom'
    },
    notifications: {
      prayerArrived: '🕌 Waktu Sholat {name} telah tiba!',
      openReminder: 'Buka Pengingat',
      openClock: 'Buka Zen Clock',
      pomodoroFinished: '⏱️ Waktu Pomodoro Selesai!',
      breakFinished: '☕ Waktu Istirahat Selesai!',
      breakPrompt: 'Waktunya istirahat sejenak.',
      workPrompt: 'Siap kembali fokus?'
    },
    prompts: {
      changeLanguageTitle: 'Pilih Bahasa Tampilan Zen Clock (Select Display Language)',
      languageChanged: 'Bahasa tampilan Zen Clock berhasil diubah ke: {lang}',
      cityPickerTitle: 'Pilih kota untuk perhitungan jadwal waktu sholat...',
      citySearchPlaceholder: 'Ketik nama kota (contoh: Cairo, London, Surabaya)...',
      adjustPickerTitle: 'Pilih waktu sholat untuk mengatur penyesuaian menit (offset)...',
      adjustResetConfirm: 'Seluruh penyesuaian waktu sholat dikembalikan ke standar Kemenag RI (+2m ihtiyat).',
      themePickerTitle: 'Pilih warna aksen tema Zen Clock'
    },
    reminder: {
      title: 'Panggilan Sholat {name}',
      readyToPray: '✓ Saya Siap Sholat (Tutup)',
      openZenClock: '⏱️ Buka Zen Clock',
      disableAutoOpen: '⚙️ Matikan Auto-Open Tab Ini',
      quranQuote: '“Maka dirikanlah shalat itu (sebagaimana biasa). Sungguh, shalat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman.”',
      quranSurah: 'QS. An-Nisa\': 103',
      disclaimer: 'Halaman ini otomatis terbuka sesuai jadwal waktu sholat lokasi Anda.'
    }
  },
  en: {
    prayers: {
      fajr: 'Fajr',
      sunrise: 'Sunrise',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha'
    },
    statusBar: {
      scheduleTitle: "Today's Prayer Times",
      next: 'Next',
      arrivesIn: 'arrives in',
      now: 'now',
      todaySchedule: "Today's Schedule"
    },
    countdown: {
      now: 'now',
      lessThanMinute: '< 1 min',
      hours: 'hrs',
      minutes: 'mins',
      seconds: 'secs',
      hourSingular: 'hr',
      minuteSingular: 'min',
      secondSingular: 'sec',
      in: 'in'
    },
    ui: {
      adjustTime: 'Adjust Time',
      themeColor: 'Theme Color',
      notifActive: 'Prayer notification active',
      notifInactive: 'Prayer notification inactive',
      clickToChangeCity: 'Click to select or change city',
      navClock: 'Clock',
      navPomodoro: 'Pomodoro',
      work: 'Work',
      break: 'Break',
      start: 'Start',
      pause: 'Pause',
      reset: 'Reset',
      customHexPlaceholder: 'Input custom hex'
    },
    notifications: {
      prayerArrived: '🕌 Prayer Time for {name} has arrived!',
      openReminder: 'Open Reminder',
      openClock: 'Open Zen Clock',
      pomodoroFinished: '⏱️ Pomodoro Session Completed!',
      breakFinished: '☕ Break Time Finished!',
      breakPrompt: 'Take a short refreshing break.',
      workPrompt: 'Ready to focus again?'
    },
    prompts: {
      changeLanguageTitle: 'Select Zen Clock Display Language (Pilih Bahasa)',
      languageChanged: 'Zen Clock display language changed to: {lang}',
      cityPickerTitle: 'Select city for prayer time calculation...',
      citySearchPlaceholder: 'Type a city name (e.g., London, Cairo, New York)...',
      adjustPickerTitle: 'Select prayer time to configure minute offset...',
      adjustResetConfirm: 'All prayer time adjustments reset to Kemenag RI standard (+2m ihtiyat).',
      themePickerTitle: 'Choose Zen Clock theme accent color'
    },
    reminder: {
      title: 'Call to Prayer: {name}',
      readyToPray: '✓ I Am Ready to Pray (Close)',
      openZenClock: '⏱️ Open Zen Clock',
      disableAutoOpen: '⚙️ Turn Off Auto-Open This Tab',
      quranQuote: '“Indeed, prayer has been decreed upon the believers a decree of specified times.”',
      quranSurah: 'Surah An-Nisa: 103',
      disclaimer: 'This tab opens automatically according to your location prayer times.'
    }
  }
};

export function getTranslations(lang: Language = 'id'): Translations {
  return translations[lang] || translations.id;
}
