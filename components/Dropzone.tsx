import React, { useCallback } from 'react';

interface DropzoneProps {
  onFilesDropped: (files: File[]) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesDropped }) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const txtFiles = Array.from(e.dataTransfer.files).filter((f: File) => f.name.endsWith('.txt') || f.name.endsWith('.zpl'));
      onFilesDropped(txtFiles);
      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    }
  }, [onFilesDropped]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const txtFiles = Array.from(e.target.files).filter((f: File) => f.name.endsWith('.txt') || f.name.endsWith('.zpl'));
      onFilesDropped(txtFiles);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer transition-colors duration-200 hover:border-blue-400 hover:bg-gray-50 bg-white shadow-sm"
    >
      <input
        type="file"
        multiple
        accept=".txt,.zpl"
        onChange={handleFileInput}
        className="hidden"
        id="fileInput"
      />
      <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-700">Arraste arquivos ZPL ou TXT aqui</h3>
        <p className="text-sm text-gray-500 mt-2">ou clique para selecionar do computador</p>
      </label>
    </div>
  );
};