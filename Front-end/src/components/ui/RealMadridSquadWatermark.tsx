import { useEffect, useState } from 'react';

export function RealMadridSquadWatermark() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg";
    img.onload = () => setIsLoaded(true);
  }, []);

  if (!isLoaded) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
      style={{
        backgroundImage: `url("https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg")`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transform: 'rotate(-15deg)',
      }}
    />
  );
} 