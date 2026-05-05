import { useRef, useState, MouseEvent } from 'react';

export function useDraggableScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: MouseEvent) => {
    if (!ref.current) return;
    setIsDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Velocidade do arrasto
    
    // Se arrastou muito, adiciona uma flag no elemento para previnir o click
    if (Math.abs(walk) > 5) {
      ref.current.classList.add('is-dragging');
    }
    
    ref.current.scrollLeft = scrollLeft - walk;
  };

  // Limpa a flag de dragging após um curto atraso para permitir o click
  const onClickCapture = (e: MouseEvent) => {
    if (ref.current?.classList.contains('is-dragging')) {
      e.stopPropagation();
      e.preventDefault();
      setTimeout(() => ref.current?.classList.remove('is-dragging'), 100);
    }
  };

  return {
    ref,
    onMouseDown,
    onMouseLeave,
    onMouseUp,
    onMouseMove,
    onClickCapture,
    className: isDragging ? 'cursor-grabbing select-none' : 'cursor-grab',
  };
}
