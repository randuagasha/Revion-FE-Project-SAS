"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";

import revBotAnimation from "@/assets/lottie/revbot.json";

export default function RevBotFloating() {
  const router = useRouter();

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    translateX: 0,
    translateY: 0,
  });

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;

    if (!button) return;

    const rect = button.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 6;
    const rotateX = -((y - centerY) / centerY) * 6;

    const translateX = ((x - centerX) / centerX) * 2;
    const translateY = ((y - centerY) / centerY) * 2;

    setTransform({
      rotateX,
      rotateY,
      translateX,
      translateY,
    });
  };

  const handleMouseLeave = () => {
    setTransform({
      rotateX: 0,
      rotateY: 0,
      translateX: 0,
      translateY: 0,
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => router.push("/customers/revbot")}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-label="Open RevBot"
        className="group h-24 w-24 outline-none"
        style={{
          perspective: "700px",
        }}
      >
        <div
          className="h-full w-full transition-transform duration-150 ease-out group-hover:scale-105"
          style={{
            transform: `translate(${transform.translateX}px, ${transform.translateY}px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
            transformStyle: "preserve-3d",
            filter: "drop-shadow(0 10px 25px rgba(201, 111, 50, 0.18))",
          }}
        >
          <div className="h-full w-full animate-[revbot-float_3s_ease-in-out_infinite]">
            <Lottie
              animationData={revBotAnimation}
              loop
              autoplay
              className="h-full w-full"
            />
          </div>
        </div>
      </button>
    </div>
  );
}