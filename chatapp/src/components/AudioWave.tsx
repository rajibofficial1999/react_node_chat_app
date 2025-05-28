const AudioWave = () => {
  const bars = [
    "h-6 bg-primary/60",
    "h-14 bg-primary/60",
    "h-4 bg-primary/60",
    "h-10 bg-primary/60",
    "h-20 bg-primary/60",
    "h-18 bg-primary/60",
    "h-18 bg-primary/60",
    "h-10 bg-primary/60",
    "h-4 bg-primary/60",
    "h-14 bg-primary/60",
    "h-4 bg-primary/60",
  ];

  return (
    <div className="">
      <div className="flex flex-row gap-x-2 items-center justify-center">
        {bars.map((bar, index) => (
          <div
            key={index}
            className={`wave rounded-full w-1 ${bar}`}
            style={
              { "--i": `${0.1 + (index % 5) * 0.1}s` } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Scoped CSS */}
      <style>{`
        .wave {
          animation: wave 1s linear infinite;
          animation-delay: calc(1s - var(--i));
        }

        @keyframes wave {
          0%, 100% {
            transform: scaleY(0.2);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
};

export default AudioWave;
