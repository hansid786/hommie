import React, { useRef, useState, useCallback } from 'react';

/**
 * Spatial3DCard - Interactive 3D Tilt Card with dynamic lighting and Z-plane pop-out.
 */
export default function Spatial3DCard({
  children,
  className = '',
  maxTilt = 10,
  perspective = 1000,
  enableGlare = true,
  glareColor = 'rgba(255, 255, 255, 0.18)',
  onClick,
  ...rest
}) {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease'
  });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = useCallback(
    (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles (-maxTilt to +maxTilt)
      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      // Glare position in percentage
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      setTransformStyle({
        transform: `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`,
        transition: 'transform 0.08s ease-out, box-shadow 0.08s ease-out'
      });

      setGlarePosition({
        x: glareX,
        y: glareY,
        opacity: 0.6
      });
    },
    [maxTilt, perspective]
  );

  const handleMouseLeave = useCallback(() => {
    setTransformStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease'
    });
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  }, [perspective]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        ...transformStyle,
        transformStyle: 'preserve-3d'
      }}
      className={`relative will-change-transform select-none ${className}`}
      {...rest}
    >
      {/* Card Content with 3D Depth capability */}
      <div style={{ transformStyle: 'preserve-3d' }} className="w-full h-full relative z-10">
        {children}
      </div>

      {/* Dynamic Specular Glare Sheen Overlay */}
      {enableGlare && (
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none overflow-hidden z-20 transition-opacity duration-300"
          style={{
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, ${glareColor} 0%, transparent 65%)`
          }}
        />
      )}
    </div>
  );
}
