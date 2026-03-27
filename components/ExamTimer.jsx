"use client";

import React, { useState, useEffect } from "react";

export default function ExamTimer({ durationMinutes, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }
    
    const intervalId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const isUrgent = timeLeft < 600; // Under 10 minutes

  return (
    <div className={`px-4 py-2 font-mono text-lg font-bold rounded-xl border shadow-sm transition-colors ${
      isUrgent 
        ? "bg-red-50 border-red-200 text-red-700 animate-pulse" 
        : "bg-gray-50 border-gray-200 text-gray-700"
    }`}>
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}
