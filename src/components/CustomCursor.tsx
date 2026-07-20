'use client';
import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    // Only activate on devices with a fine pointer (mouse)
    if (window.matchMedia("(pointer: coarse)").matches) return;

    document.body.classList.add('hide-default-cursor');

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);
    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]')
      ) {
        setIsPointer(true);
      } else {
        setIsPointer(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      document.body.classList.remove('hide-default-cursor');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isVisible]);

  if (typeof window !== 'undefined' && window.matchMedia("(pointer: coarse)").matches) {
      return null;
  }

  return (
    <>
      <div 
        className="fixed top-0 left-0 w-10 h-10 rounded-full border-[1.5px] border-white pointer-events-none z-[99999] transition-transform duration-300 ease-out flex items-center justify-center mix-blend-difference hidden md:flex"
        style={{ 
          transform: `translate(${position.x - 20}px, ${position.y - 20}px) scale(${isClicking ? 0.8 : isPointer ? 1.5 : 1})`,
          opacity: isVisible ? 1 : 0
        }}
      />
      <div 
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[100000] transition-all duration-75 ease-out mix-blend-difference hidden md:block"
        style={{ 
          transform: `translate(${position.x - 4}px, ${position.y - 4}px) scale(${isPointer || isClicking ? 0 : 1})`,
          opacity: isVisible ? 1 : 0
        }}
      />
    </>
  );
}
