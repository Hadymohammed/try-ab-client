import React, { useEffect, useRef, useState } from "react";
import Hls, { Level } from "hls.js";

interface Quality {
  label: string;
  index: number;
}

interface CustomPlayerProps {
  url: string;
}

const CustomPlayer: React.FC<CustomPlayerProps> = ({ url }) => {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
  const [qualities, setQualities] = useState<Quality[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1); // -1 for Auto

  useEffect(() => {
    if (Hls.isSupported() && url.endsWith(".m3u8")) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(playerRef.current!);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels: Quality[] = hls.levels.map((level: Level, index: number) => ({
          label: `${level.height}p`, // e.g., 1080p
          index,
        }));
        setQualities([{ label: "Auto", index: -1 }, ...levels]);
      });

      setHlsInstance(hls);

      return () => hls.destroy(); // Cleanup on unmount
    } else if (playerRef.current && !Hls.isSupported()) {
      // Fallback for browsers like Safari with native HLS support
      playerRef.current.src = url;
    }
  }, [url]);

  const handleQualityChange = (index: number) => {
    if (hlsInstance) {
      hlsInstance.currentLevel = index; // Set specific quality (-1 for auto)
    }
    setSelectedQuality(index);
  };

  return (
    <div>
      <video
        ref={playerRef}
        controls
        style={{ width: "100%", height: "auto" }}
      />
      {qualities.length > 0 && (
        <select
          onChange={(e) => handleQualityChange(parseInt(e.target.value, 10))}
          value={selectedQuality}
        >
          {qualities.map((quality) => (
            <option key={quality.index} value={quality.index}>
              {quality.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default CustomPlayer;
