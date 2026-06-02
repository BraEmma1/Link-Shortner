'use client';

import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Max width class — defaults to 'max-w-lg' */
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-on-background/40 backdrop-blur-sm"
      onClick={(e) => {
        // Close on backdrop click (not on modal content click)
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Modal Container */}
      <div
        className={`bg-surface-container-lowest rounded-xl border border-border-light shadow-[0px_12px_32px_rgba(39,58,100,0.08)] w-full ${maxWidth} flex flex-col max-h-[90vh] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-light flex justify-between items-center bg-background-subtle/50">
          <h2
            id="modal-title"
            className="font-headline-md text-headline-md text-on-surface"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-secondary hover:text-primary p-1 rounded-md hover:bg-surface-variant/50 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
