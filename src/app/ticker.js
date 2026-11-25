'use client';

import { useEffect, useRef, useState } from 'react';

const tickerItems = [
  'CYBER SECURITY',
  'NETWORK INFRASTRUCTURE',
  'CCTV & ACCESS CONTROL',
  'RISK MANAGEMENT',
];

export default function Ticker() {
  const bandRef = useRef(null);
  const sequenceRef = useRef(null);
  const [animation, setAnimation] = useState({ repeats: 1, duration: 25 });

  useEffect(() => {
    const band = bandRef.current;
    const sequence = sequenceRef.current;
    if (!band || !sequence) return;

    const observer = new ResizeObserver(() => {
      const sequenceWidth = sequence.getBoundingClientRect().width;
      if (!sequenceWidth) return;
      const repeats = Math.max(1, Math.ceil(band.clientWidth / sequenceWidth));
      const duration = sequenceWidth * repeats / 48;
      setAnimation((current) => (
        current.repeats === repeats && current.duration === duration
          ? current
          : { repeats, duration }
      ));
    });

    observer.observe(band);
    observer.observe(sequence);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={bandRef} aria-hidden="true" className="overflow-hidden bg-[#E58E17] py-3 text-black">
      <div className="marquee-track font-mono text-sm font-extrabold tracking-[0.18em]" style={{ animationDuration: `${animation.duration}s` }}>
        {[0, 1].map((group) => (
          <div key={group} className="marquee-group">
            {Array.from({ length: animation.repeats }, (_, index) => (
              <span key={index} ref={group === 0 && index === 0 ? sequenceRef : undefined} className="marquee-sequence">
                {tickerItems.map((item) => (
                  <span key={item}>{item}<span className="marquee-separator">✦</span></span>
                ))}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
