import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Dropzone } from './components/Dropzone';
import { LabelCard } from './components/LabelCard';
import { renderZplToImage } from './services/zplService';
import { analyzeZplContent } from './services/geminiService';
import { generateLabelsPdf } from './services/pdfService';
import { printZplDirectly, hasWebSerial } from './services/printerService';
import { ZplFile } from './types';

const App: React.FC = () => {
  const [files, setFiles] = useState<ZplFile[]>([]);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);

  const handleFilesDropped = async (droppedFiles: File[]) => {
    const newFiles: ZplFile[] = droppedFiles.map(f => ({
      id: uuidv4(),
      name: f.name,
      rawContent: '',
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Process each file
    for (const newFile of newFiles) {
      const originalFile = droppedFiles.find(f => f.name === newFile.name);
      if (originalFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          
          setFiles(current => 
            current.map(f => f.id === newFile.id ? { ...f, rawContent: content, status: 'processing' } : f)
          );

          // 1. Render Image (Parallel)
          const imagePromise = renderZplToImage(content);
          // 2. Analyze with Gemini (Parallel)
          const analysisPromise = analyzeZplContent(content);

          const [imageUrl, analysis] = await Promise.all([imagePromise, analysisPromise]);

          setFiles(current => 
            current.map(f => f.id === newFile.id ? { 
              ...f, 
              imageUrl, 
              analysis,
              status: imageUrl ? 'ready' : 'error' 
            } : f)
          );
        };
        reader.readAsText(originalFile);
      }
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const handlePrintSingle = async (zpl: string) => {
    try {
      await printZplDirectly(zpl);
      alert("Enviado para impressora!");
    } catch (e) {
      alert("Erro ao imprimir. Verifique se a impressora térmica está conectada via USB e se você selecionou a porta correta.");
    }
  };

  const handleGeneratePdf = async () => {
    if (files.filter(f => f.status === 'ready').length === 0) return;
    setIsProcessingPdf(true);
    await generateLabelsPdf(files.filter(f => f.status === 'ready'));
    setIsProcessingPdf(false);
  };

  const hasFiles = files.length > 0;
  const readyFiles = files.filter(f => f.status === 'ready');
  const webSerialAvailable = hasWebSerial();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
             </div>
             <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">ZPL Master Pro</h1>
                <p className="text-xs text-gray-500">Gerenciador de Etiquetas Inteligente</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             {!process.env.API_KEY && (
                <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Modo Offline (Sem Chave API)
                </span>
             )}
             {webSerialAvailable ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                   Impressão USB Disponível
                </span>
             ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                   Impressão USB Indisponível
                </span>
             )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Upload Section */}
        <section className="mb-8">
          <Dropzone onFilesDropped={handleFilesDropped} />
        </section>

        {/* Toolbar */}
        {hasFiles && (
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">Fila de Impressão</h2>
                    <p className="text-sm text-gray-500">{readyFiles.length} etiquetas prontas</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                        onClick={() => setFiles([])}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                        Limpar Tudo
                    </button>
                    <button 
                        onClick={handleGeneratePdf}
                        disabled={isProcessingPdf || readyFiles.length === 0}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md font-medium text-white shadow-sm transition-all
                            ${isProcessingPdf || readyFiles.length === 0 ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'}
                        `}
                    >
                        {isProcessingPdf ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Gerando PDF...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                Baixar PDF Único
                            </>
                        )}
                    </button>
                </div>
            </div>
        )}

        {/* List Section */}
        {hasFiles ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                {files.map(file => (
                    <LabelCard 
                        key={file.id} 
                        file={file} 
                        onPrint={handlePrintSingle} 
                        onRemove={handleRemoveFile}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-20 opacity-50">
                <p className="text-gray-400">Nenhum arquivo carregado ainda.</p>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;