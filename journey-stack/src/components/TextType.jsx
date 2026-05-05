import React, { useEffect, useState } from 'react';

export default function TextType({ 
  text, 
  speed = 50, 
  delay = 0,
  className = '',
  cursorChar = '|'
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const delayTimer = setTimeout(() => {
        startTyping();
      }, delay);
      return () => clearTimeout(delayTimer);
    } else {
      startTyping();
    }

    function startTyping() {
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(typingInterval);
        }
      }, speed);

      return () => clearInterval(typingInterval);
    }
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && <span className="animate-pulse">{cursorChar}</span>}
    </span>
  );
}
