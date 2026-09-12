import React, { useState, useEffect } from 'react';

const AnimatedCard = ({ digit, position, animation }) => {
  return (
    <div className={`flip-card-half flip-card-${position} ${animation}`}>
      <span>{digit}</span>
    </div>
  );
};

const StaticCard = ({ digit, position }) => {
  return (
    <div className={`flip-card-half flip-card-${position} flip-card-${position}-static`}>
      <span>{digit}</span>
    </div>
  );
};

export default function FlipUnit({ digit }) {
  const [currentDigit, setCurrentDigit] = useState(digit);
  const [nextDigit, setNextDigit] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (digit !== currentDigit) {
      setNextDigit(digit);
      setIsFlipping(true);
      
      const timeout = setTimeout(() => {
        setIsFlipping(false);
        setCurrentDigit(digit);
      }, 800);
      
      return () => clearTimeout(timeout);
    }
  }, [digit, currentDigit]);

  const format = (num) => num.toString().padStart(2, '0');
  
  const displayStaticTop = format(isFlipping ? nextDigit : currentDigit);
  const displayStaticBottom = format(currentDigit);

  return (
    <div className="flip-unit-container">
      <div className="flip-card">
        <StaticCard position="top" digit={displayStaticTop} />
        <StaticCard position="bottom" digit={displayStaticBottom} />
        
        {isFlipping && (
          <>
            <AnimatedCard position="top" digit={format(currentDigit)} animation="flip-anim-top" />
            <AnimatedCard position="bottom" digit={format(nextDigit)} animation="flip-anim-bottom" />
          </>
        )}
      </div>
    </div>
  );
}
