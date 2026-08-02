import React, { useState, useEffect, useRef } from "react";
import * as Tone from "tone";

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms/char
  onComplete?: () => void;
  playSfx?: boolean;
}

export function TypewriterText({
  text,
  speed = 40,
  onComplete,
  playSfx = false,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [prevText, setPrevText] = useState(text);
  const synthRef = useRef<Tone.NoiseSynth | null>(null);

  if (text !== prevText) {
    setPrevText(text);
    setDisplayedText("");
  }

  useEffect(() => {
    if (playSfx && typeof window !== "undefined") {
      try {
        synthRef.current = new Tone.NoiseSynth({
          noise: { type: "pink" },
          envelope: { attack: 0.001, decay: 0.015, sustain: 0 },
        }).toDestination();
        synthRef.current.volume.value = -12; // lower volume so it is subtle
      } catch (e) {
        console.warn("Tone.js synth init failed", e);
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
    };
  }, [playSfx]);

  useEffect(() => {
    if (!text) {
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      setDisplayedText((prev) => {
        if (prev.length < text.length) {
          const char = text[prev.length];
          if (playSfx && synthRef.current && char.trim() !== "") {
            try {
              if (Tone.context.state === "running") {
                synthRef.current.triggerAttackRelease("32n");
              }
            } catch {
              // Autoplay blocks audio context
            }
          }
          return prev + char;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, playSfx, onComplete]);

  useEffect(() => {
    if (text && displayedText === text) {
      onComplete?.();
    }
  }, [displayedText, text, onComplete]);

  return <span className="whitespace-pre-line">{displayedText}</span>;
}

export default TypewriterText;

