import { useEffect, useState } from "react";

export const useCountdown = (expiryTime: string) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const calculateTimeLeft = () => {
    if (!expiryTime) return 0;

    const difference = new Date(expiryTime).getTime() - new Date().getTime();
    return difference > 0 ? difference : 0;
  };

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
  }, [expiryTime]);

  // Convert ms to mm:ss format
  const minutes = Math.floor(timeLeft / 1000 / 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return {
    timeLeft,
    formatted: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`,
    isExpired: timeLeft <= 0,
  };
};
