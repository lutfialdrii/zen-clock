import React, { useState, useEffect } from 'react';
import FlipUnit from './FlipUnit';

export default function FlipClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const syncTimeout = setTimeout(() => {
      setTime(new Date());
      const interval = setInterval(() => {
        setTime(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }, 1000 - new Date().getMilliseconds());
    
    return () => clearTimeout(syncTimeout);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  
  return (
    <div className="clock-wrapper">
      <div className="flip-clock">
        <FlipUnit digit={hours} />
        <FlipUnit digit={minutes} />
        <FlipUnit digit={seconds} />
      </div>
      <div className="date-display">
        {time.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}
      </div>
    </div>
  );
}
