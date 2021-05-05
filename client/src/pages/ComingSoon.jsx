import React, { useState } from 'react';

function ComingSoon() {
  const [countdown, setCountdown] = useState({
    days: 0,
    hrs: 0,
    mins: 0,
    secs: 0
  });

  setInterval(() => {
    const targetTime = new Date('May 20, 2021').getTime();
    const remaining = targetTime - new Date().getTime();

    const days = Math.floor(remaining / (60 * 60 * 24 * 1000));
    const hrs = Math.floor(remaining % (60 * 60 * 24 * 1000) / (60 * 60 * 1000));
    const mins = Math.floor(remaining % (60 * 60 * 1000) / (60 * 1000));
    const secs = Math.floor(remaining % (60 * 1000) / 1000);

    setCountdown({ days, hrs, mins, secs });
  }, 1000);

  return (
    <div className="countdownTimer">
      <h1>Coming Soon!</h1>

      <p>{countdown.days} Days</p>
      <p>{countdown.hrs} Hours</p>
      <p>{countdown.mins} Minutes</p>
      <p>{countdown.secs} Seconds</p>
    </div>
  );
}

export default ComingSoon;
