import React, { useState, useEffect, useRef } from 'react';
import { Coordinates, PrayerTimes } from 'adhan';
import { MapPin, Map, Bell, BellOff, Edit3, SlidersHorizontal, Palette } from 'lucide-react';
import { sendNotification, requestWebNotificationPermission, getVsCodeApi } from '../utils/notification';
import {
  getKemenagCalculationParameters,
  formatCountdownVerbose,
  formatCountdownDigits,
  PRAYER_NAMES
} from '../utils/prayerHelper';

export default function PrayerTime() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [prayerData, setPrayerData] = useState(null);
  const [allPrayers, setAllPrayers] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [adjustments, setAdjustments] = useState({});

  const lastNotifiedPrayerRef = useRef(null);

  // 1. Initial Load: Check extension saved location or localStorage cache & adjustments
  useEffect(() => {
    const api = getVsCodeApi();
    if (api) {
      api.postMessage({ type: 'GET_SAVED_LOCATION' });
      api.postMessage({ type: 'GET_PRAYER_ADJUSTMENTS' });
    }

    try {
      const cached = localStorage.getItem('zenClock_savedLocation');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.lat && parsed.lng) {
          setCoords({ lat: parsed.lat, lng: parsed.lng });
          setLocationName(parsed.name || '');
          return;
        }
      }
    } catch (e) {}

    // Fallback: Geolocation API or IP fallback
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          fetchIPLocation();
        },
        { timeout: 5000 }
      );
    } else {
      fetchIPLocation();
    }
  }, []);

  // 2. Listen to messages from VS Code extension
  useEffect(() => {
    const handleMessage = (event) => {
      const msg = event.data;
      if (!msg) return;

      if (msg.type === 'LOCATION_UPDATED' && msg.data) {
        setCoords({
          lat: msg.data.lat,
          lng: msg.data.lng
        });
        setLocationName(msg.data.name);
        try {
          localStorage.setItem('zenClock_savedLocation', JSON.stringify(msg.data));
        } catch (e) {}
      } else if (msg.type === 'LOCATION_RESET_AUTO') {
        try {
          localStorage.removeItem('zenClock_savedLocation');
        } catch (e) {}
        setLocationName('');
        fetchIPLocation();
      } else if (msg.type === 'PRAYER_ADJUSTMENTS_UPDATED' && msg.data) {
        setAdjustments(msg.data);
      } else if (msg.type === 'PRAYER_DATA_UPDATED') {
        setCurrentTime(new Date());
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchIPLocation = () => {
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.latitude && data.longitude) {
          setCoords({
            lat: data.latitude,
            lng: data.longitude
          });
          const city = data.city || '';
          const region = data.region || data.country_name || '';
          setLocationName(city ? `${city}, ${region}` : region);
        } else {
          setCoords({ lat: -6.2088, lng: 106.8456 });
          setLocationName('Jakarta (Default)');
        }
      })
      .catch(() => {
        setCoords({ lat: -6.2088, lng: 106.8456 });
        setLocationName('Jakarta (Default)');
      });
  };

  useEffect(() => {
    if (coords && !locationName) {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=14&addressdetails=1`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.address) {
            const addr = data.address;
            const district =
              addr.city_district || addr.suburb || addr.town || addr.village || addr.county || 'Lokasi';
            const city = addr.city || addr.regency || addr.state_district || '';
            setLocationName(`${district}` + (city ? `, ${city}` : ''));
          }
        })
        .catch((err) => console.log('Location fetch error:', err));
    }
  }, [coords, locationName]);

  // Clock ticker for real-time countdown & automatic rollover
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate prayer times using official Kemenag RI parameters
  useEffect(() => {
    if (coords) {
      try {
        const coordinates = new Coordinates(coords.lat, coords.lng);
        const params = getKemenagCalculationParameters(adjustments);
        let times = new PrayerTimes(coordinates, currentTime, params);

        let next = times.nextPrayer();
        let nextTime = times.timeForPrayer(next);

        if (next === 'none' || !nextTime || nextTime <= currentTime) {
          const tomorrow = new Date(currentTime);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowTimes = new PrayerTimes(coordinates, tomorrow, params);
          next = tomorrowTimes.nextPrayer();
          nextTime = tomorrowTimes.timeForPrayer(next);
        }

        const currentPrayerNameId = PRAYER_NAMES[next.toLowerCase()] || next;

        if (nextTime) {
          const diffSeconds = Math.floor((nextTime - currentTime) / 1000);
          if (diffSeconds <= 0 && lastNotifiedPrayerRef.current !== currentPrayerNameId) {
            lastNotifiedPrayerRef.current = currentPrayerNameId;

            const msgText = `Waktu Sholat ${currentPrayerNameId} telah tiba! (${locationName || 'Lokasi Anda'})`;
            if (notifyEnabled) {
              sendNotification('Zen Clock', msgText, 'info');
            }
          }
        }

        setPrayerData({
          name: next,
          time: nextTime
        });

        const formatTime = (dateObj) => {
          return dateObj ? dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--';
        };

        setAllPrayers({
          Subuh: formatTime(times.fajr),
          Terbit: formatTime(times.sunrise),
          Dzuhur: formatTime(times.dhuhr),
          Ashar: formatTime(times.asr),
          Maghrib: formatTime(times.maghrib),
          Isya: formatTime(times.isha)
        });
      } catch (err) {
        console.error('Prayer Calculation Error:', err);
      }
    }
  }, [coords, currentTime, notifyEnabled, locationName, adjustments]);

  const handleChangeLocation = (e) => {
    e.stopPropagation();
    const api = getVsCodeApi();
    if (api) {
      api.postMessage({ type: 'REQUEST_CHANGE_LOCATION' });
    }
  };

  const handleAdjustPrayerTimes = (e) => {
    e.stopPropagation();
    const api = getVsCodeApi();
    if (api) {
      api.postMessage({ type: 'REQUEST_ADJUST_PRAYER' });
    }
  };

  const handleChangeAccentTheme = (e) => {
    e.stopPropagation();
    const api = getVsCodeApi();
    if (api) {
      api.postMessage({ type: 'REQUEST_CHANGE_ACCENT' });
    }
  };

  if (error) {
    return (
      <div className="prayer-container">
        <div className="prayer-display error">{error}</div>
      </div>
    );
  }

  if (!coords || !prayerData || !prayerData.time) {
    return null;
  }

  const diffMs = prayerData.time - currentTime;
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const timeString = formatCountdownVerbose(diffSeconds);
  const nameId = PRAYER_NAMES[prayerData.name.toLowerCase()] || prayerData.name;

  return (
    <div className="prayer-container">
      <div className="prayer-display" title={`Waktu ${nameId} berikutnya tiba dalam ${timeString}`}>
        <MapPin size={16} />
        <span>{nameId} dalam {timeString}</span>
        <button
          className="notify-toggle-btn"
          onClick={(e) => {
            e.stopPropagation();
            const nextState = !notifyEnabled;
            setNotifyEnabled(nextState);
            if (nextState) {
              requestWebNotificationPermission();
            }
          }}
          title={notifyEnabled ? 'Notifikasi sholat aktif' : 'Notifikasi sholat mati'}
        >
          {notifyEnabled ? <Bell size={14} /> : <BellOff size={14} />}
        </button>
      </div>

      <div className="prayer-details">
        <div className="prayer-actions-bar">
          {locationName && (
            <div
              className="prayer-location clickable"
              onClick={handleChangeLocation}
              title="Klik untuk memilih atau mengubah kota"
            >
              <div className="prayer-location-left">
                <Map size={14} />
                <span className="prayer-location-name">{locationName}</span>
              </div>
              <Edit3 size={13} className="prayer-location-edit-icon" />
            </div>
          )}

          <div className="prayer-actions-row">
            <button
              className="prayer-adjust-btn"
              onClick={handleAdjustPrayerTimes}
              title="Sesuaikan koreksi menit waktu sholat (Kemenag RI)"
            >
              <SlidersHorizontal size={13} />
              <span>Sesuaikan Jam</span>
            </button>
            <button
              className="prayer-theme-btn"
              onClick={handleChangeAccentTheme}
              title="Pilih atau ubah warna tema aksen Zen Clock"
            >
              <Palette size={13} />
              <span>Warna Tema</span>
            </button>
          </div>
        </div>

        <div className="prayer-list">
          {allPrayers &&
            Object.entries(allPrayers).map(([name, time]) => (
              <div className={`prayer-item ${nameId === name ? 'active' : ''}`} key={name}>
                <span className="prayer-item-name">{name}</span>
                <span className="prayer-item-time">{time}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
