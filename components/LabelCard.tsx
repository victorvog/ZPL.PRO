import React from 'react';
import { ZplFile } from '../types';

interface LabelCardProps {
  file: ZplFile;
  onPrint: (zpl: string) => void;
  onRemove: (id: string) => void;
}

export const LabelCard: React.FC<LabelCardProps> = ({ file, onPrint, onRemove }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col">
      <div className="relative h-64 bg-gray-100 flex items-center justify-center p-4">
        {file.status === 'processing' && (
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-sm text-gray-500">Processando...</span>
          </div>
        )}
        
        {file.status === 'error' && (
          <div className="text-red-500 flex flex-col items-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="text-sm">Erro ao renderizar</span>
          </div>
        )}

        {file.status === 'ready' && file.imageUrl && (
          <img 
            src={file.imageUrl} 
            alt="Preview Etiqueta" 
            className="max-h-full max-w-full object-contain shadow-sm border border-gray-200 bg-white" 
          />
        )}

        <div className="absolute top-2 right-2">
            <button 
                onClick={() => onRemove(file.id)}
                className="p-1 bg-white/80 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                title="Remover"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
            </button>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-900 truncate" title={file.name}>{file.name}</h4>
        </div>
        
        {file.analysis ? (
           <div className="text-xs space-y-2 mb-4 bg-blue-50 p-3 rounded-md border border-blue-100">
             <div className="flex items-start">
               <span className="text-blue-500 mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A9.948 9.948 0 0010 18a9.948 9.948 0 004.793-1.61A5.99 5.99 0 0010 12z" clipRule="evenodd" />
                  </svg>
               </span>
               <div>
                  <p className="font-medium text-blue-900">{file.analysis.recipientName}</p>
                  <p className="text-blue-700">{file.analysis.destination}</p>
               </div>
             </div>
             <div className="flex items-center">
                <span className="text-blue-500 mr-2">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                     <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                   </svg>
                </span>
                <span className="font-mono text-blue-800">{file.analysis.trackingNumber}</span>
             </div>
             <div className="flex items-center">
                <span className="text-blue-400 mr-2 text-[10px] uppercase font-bold tracking-wider">VIA</span>
                <span className="text-blue-800 font-semibold">{file.analysis.carrier}</span>
             </div>
           </div>
        ) : (
            <div className="text-xs text-gray-400 mb-4 italic flex-1">
                {file.status === 'processing' ? 'IA analisando conteúdo...' : 'Sem análise disponível'}
            </div>
        )}

        <button 
            onClick={() => onPrint(file.rawContent)}
            className="mt-auto w-full py-2 px-3 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded shadow transition-colors flex items-center justify-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.198-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            Imprimir Única
        </button>
      </div>
    </div>
  );
};