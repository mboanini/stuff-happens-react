import { useEffect, useState } from 'react';
import { API } from '../API.mjs';

export default function Timer({ duration = 30, gameId, onExpire, active = true }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!active) return;

        if (gameId) {
            let interval;
            const fetchTime = async () => {
                try {
                    const data = await API.getTimeLeft(gameId);
                    setTimeLeft(data.timeLeft);
                    if (data.timeLeft === 0) onExpire();
                } catch {
                    setTimeLeft(0);
                    onExpire();
                }
            };
            fetchTime();
            interval = setInterval(fetchTime, 1000);
            return () => clearInterval(interval);
        } else {
            if (timeLeft === 0) {
                onExpire();
                return;
            }
            const timerId = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [gameId, active, timeLeft]);

    return <p>00:{String(timeLeft).padStart(2, '0')} s</p>;
}