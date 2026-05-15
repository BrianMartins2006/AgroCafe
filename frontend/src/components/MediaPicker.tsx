import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '../utils/performance';

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (files: File[]) => void;
  multiple?: boolean;
}

const MediaPicker: React.FC<MediaPickerProps> = ({ isOpen, onClose, onSelect, multiple = true }) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file))
      );
      
      onSelect(compressedFiles as File[]);
      onClose();
    } catch (error) {
      console.error('Erro ao processar imagens:', error);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300" 
        onClick={isProcessing ? undefined : onClose} 
      />
      
      {/* Bottom Sheet */}
      <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300 ease-out z-[210]">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
        
        <div className="text-center mb-8">
          <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-[0.2em] mb-1">Origem da Foto</h3>
          <p className="text-xs text-gray-300">Escolha como deseja capturar</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => cameraInputRef.current?.click()}
            disabled={isProcessing}
            className="flex flex-col items-center gap-3 p-6 bg-gray-50 hover:bg-teal-50 active:scale-95 rounded-[2rem] transition-all group border border-transparent hover:border-whatsapp-teal/20"
          >
            <div className="w-14 h-14 bg-white text-whatsapp-teal rounded-2xl shadow-sm flex items-center justify-center group-hover:shadow-md transition-all">
              <Camera size={28} />
            </div>
            <span className="font-bold text-gray-700 text-sm">Câmera</span>
          </button>

          <button 
            onClick={() => galleryInputRef.current?.click()}
            disabled={isProcessing}
            className="flex flex-col items-center gap-3 p-6 bg-gray-50 hover:bg-blue-50 active:scale-95 rounded-[2rem] transition-all group border border-transparent hover:border-blue-500/20"
          >
            <div className="w-14 h-14 bg-white text-blue-500 rounded-2xl shadow-sm flex items-center justify-center group-hover:shadow-md transition-all">
              <ImageIcon size={28} />
            </div>
            <span className="font-bold text-gray-700 text-sm">Galeria</span>
          </button>
        </div>

        {isProcessing && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-whatsapp-teal border-t-transparent animate-spin rounded-full" />
            <span className="text-[10px] font-bold text-whatsapp-teal uppercase tracking-widest">Otimizando...</span>
          </div>
        )}

        <button 
          onClick={onClose}
          disabled={isProcessing}
          className="mt-8 w-full py-4 text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-[0.3em] transition-all"
        >
          Cancelar
        </button>

        {/* Hidden Inputs */}
        <input 
          type="file" 
          hidden 
          ref={cameraInputRef} 
          accept="image/*" 
          capture="environment" 
          multiple={multiple}
          onChange={handleFileChange} 
        />
        <input 
          type="file" 
          hidden 
          ref={galleryInputRef} 
          accept="image/*" 
          multiple={multiple}
          onChange={handleFileChange} 
        />
      </div>
    </div>
  );
};

export default MediaPicker;
