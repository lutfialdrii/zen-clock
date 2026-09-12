import React, { useState, useEffect, useRef } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { MapPin, Map, Bell, BellOff } from 'lucide-react';
import { sendNotification, requestWebNotificationPermission } from '../utils/notification';

export default function PrayerTime() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [prayerData, setPrayerData] = useState(null);
  const [allPrayers, setAllPrayers] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifyEnabled, setNotifyEnabled] = useState(true);

  const lastNotifiedPrayerRef = useRef(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          fetchIPLocation();
        },
        { timeout: 5000 }
      );
    } else {
      fetchIPLocation();
    }
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
      .catch((err) => {
        setCoords({ lat: -6.2088, lng: 106.8456 });
        setLocationName('Jakarta (Default)');
      });
  };

  useEffect(() => {
    if (coords && !locationName) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=14&addressdetails=1`)
        .then(res => res.json())
        .then(data => {
            if (data && data.address) {
              const addr = data.address;
              const district = addr.city_district || addr.suburb || addr.town || addr.village || addr.county || 'Lokasi';
              const city = addr.city || addr.regency || addr.state_district || '';
              setLocationName(`${district}` + (city ? `, ${city}` : ''));
            }
        })
        .catch(err => console.log('Location fetch error:', err));
    }
  }, [coords, locationName]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (coords) {
      try {
        const coordinates = new Coordinates(coords.lat, coords.lng);
        let params = CalculationMethod.MuslimWorldLeague();
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

        const prayerNames = {
          fajr: 'Subuh',
          sunrise: 'Terbit',
          dhuhr: 'Dzuhur',
          asr: 'Ashar',
          maghrib: 'Maghrib',
          isha: 'Isya'
        };
        const currentPrayerNameId = prayerNames[next.toLowerCase()] || next;

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
          Isya: formatTime(times.isha),
        });
      } catch (err) {
        console.error('Prayer Calculation Error:', err);
      }
    }
  }, [coords, currentTime, notifyEnabled, locationName]);

  if (error) {
    return <div className="prayer-container"><div className="prayer-display error">{error}</div></div>;
  }

  if (!coords || !prayerData || !prayerData.time) {
    return null;
  }

  const diffMs = prayerData.time - currentTime;
  const diffMins = Math.max(0, Math.floor(diffMs / 1000 / 60));
  const hoursLeft = Math.floor(diffMins / 60);
  const minsLeft = diffMins % 60;

  let timeString = '';
  if (hoursLeft > 0) {
    timeString = `${hoursLeft} jam ${minsLeft} menit`;
  } else {
    timeString = `${minsLeft} menit`;
  }

  const prayerNames = {
    fajr: 'Subuh',
    sunrise: 'Terbit',
    dhuhr: 'Dzuhur',
    asr: 'Ashar',
    maghrib: 'Maghrib',
    isha: 'Isya'
  };

  const nameId = prayerNames[prayerData.name.toLowerCase()] || prayerData.name;

  return (
    <div className="prayer-container">
      <div className="prayer-display">
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
        {locationName && (
           <div className="prayer-location">
             <Map size={14} />
             <span>{locationName}</span>
           </div>
        )}
        <div className="prayer-list">
           {allPrayers && Object.entries(allPrayers).map(([name, time]) => (
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
