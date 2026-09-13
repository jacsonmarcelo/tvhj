import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  RotateCcw,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { MatchEvent } from '../types';

interface AdminUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScheduleCount: number;
  currentScheduleDate: string;
  onScheduleUpdated: (newMatches: MatchEvent[], newDateTitle: string) => void;
  onResetToDefault: () => void;
  isUsingCustomSchedule: boolean;
}

interface UploadedFilePreview {
  id: string;
  name: string;
  sizeFormatted: string;
  dataUrl: string;
  mimeType: string;
}

export const AdminUploadModal: React.FC<AdminUploadModalProps> = ({
  isOpen,
  onClose,
  currentScheduleCount,
  currentScheduleDate,
  onScheduleUpdated,
  onResetToDefault,
  isUsingCustomSchedule,
}) => {
  const [images, setImages] = useState<UploadedFilePreview[]>([]);
  const [dateTitleInput, setDateTitleInput] = useState<string>(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateFormatted = today.toLocaleDateString('pt-BR', options);
    return dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractedPreview, setExtractedPreview] = useState<{
    matches: MatchEvent[];
    dateFound: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle files selected via input or drag-and-drop
  const handleFiles = (files: FileList | File[]) => {
    setErrorMsg(null);
    const validFiles: File[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        validFiles.push(file);
      }
    });

    if (validFiles.length === 0) {
      setErrorMsg('Por favor, selecione arquivos de imagem válidos (PNG, JPEG ou WebP).');
      return;
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const sizeKb = Math.round(file.size / 1024);
          const sizeFormatted = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

          setImages((prev) => [
            ...prev,
            {
              id: `img-${Date.now()}-${Math.random()}`,
              name: file.name,
              sizeFormatted,
              dataUrl: result,
              mimeType: file.type || 'image/jpeg',
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Envia para o backend para leitura e OCR via Gemini
  const handleProcessImages = async () => {
    if (images.length === 0) {
      setErrorMsg('Adicione pelo menos uma imagem com a tabela de programação antes de processar.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const payload = {
        images: images.map((img) => ({
          data: img.dataUrl,
          mimeType: img.mimeType,
        })),
        dateTitle: dateTitleInput.trim() || undefined,
      };

      const response = await fetch('/api/extract-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar imagem.');
      }

      if (!data.matches || data.matches.length === 0) {
        throw new Error('Nenhum horário ou partida foi identificado nas imagens. Verifique se a foto está nítida.');
      }

      setExtractedPreview({
        matches: data.matches,
        dateFound: data.dateFound || dateTitleInput,
      });
    } catch (err: any) {
      console.error('Erro na extração de agenda:', err);
      setErrorMsg(err.message || 'Falha na comunicação com o servidor de inteligência artificial.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Aplica as partidas extraídas na aplicação
  const handleApplySchedule = () => {
    if (!extractedPreview) return;
    onScheduleUpdated(extractedPreview.matches, extractedPreview.dateFound);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Atualizar Programação Diária
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  IA Gemini
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Envie as fotos das tabelas baixadas do X ou Instagram para atualizar os horários
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-neutral-200">
          {/* Status info bar */}
          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-neutral-850/80 border border-neutral-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>
                Grade Atual: <strong className="text-white">{currentScheduleDate}</strong>
              </span>
              <span className="text-neutral-500">({currentScheduleCount} jogos)</span>
            </div>
            {isUsingCustomSchedule && (
              <button
                onClick={onResetToDefault}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                title="Restaurar a grade original padrão de 13/09/2026"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Grade Padrão</span>
              </button>
            )}
          </div>

          {!extractedPreview ? (
            <>
              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Identificação da Data ou Título da Grade:
                </label>
                <input
                  type="text"
                  value={dateTitleInput}
                  onChange={(e) => setDateTitleInput(e.target.value)}
                  placeholder="Ex: Domingo, 13 de Setembro de 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-neutral-500 outline-none transition-all"
                />
              </div>

              {/* Upload Drop Zone */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Imagens da Programação do Dia (1 a 3 tabelas):
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-750 hover:border-emerald-500/70 bg-neutral-950/60 hover:bg-neutral-950/90 rounded-2xl p-6 text-center cursor-pointer transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  />
                  <div className="w-12 h-12 mx-auto rounded-full bg-neutral-850 group-hover:bg-emerald-950/60 border border-neutral-750 group-hover:border-emerald-500/40 flex items-center justify-center text-neutral-400 group-hover:text-emerald-400 transition-colors mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-200 mb-1">
                    Arraste as imagens aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-neutral-500">
                    Suporta imagens PNG, JPG ou WebP de qualquer resolução
                  </p>
                </div>
              </div>

              {/* Uploaded Images List */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Imagens Selecionadas ({images.length})</span>
                    <button
                      onClick={() => setImages([])}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors lowercase"
                    >
                      remover todas
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-850 border border-neutral-800 group"
                      >
                        <img
                          src={img.dataUrl}
                          alt={img.name}
                          className="w-12 h-12 object-cover rounded-lg border border-neutral-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{img.name}</p>
                          <p className="text-[11px] text-neutral-400">{img.sizeFormatted}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveImage(img.id)}
                          className="p-1 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
                          title="Remover imagem"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block mb-0.5">Aviso</strong>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Results preview step */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h3 className="font-bold text-emerald-200 text-sm mb-1">
                    Extração Realizada com Sucesso!
                  </h3>
                  <p className="text-neutral-300 mb-2">
                    A IA identificou <strong>{extractedPreview.matches.length} confrontos</strong> e transmissões para o dia:{' '}
                    <span className="text-white font-bold underline decoration-emerald-500/60">
                      {extractedPreview.dateFound}
                    </span>
                    .
                  </p>
                  <p className="text-neutral-400">
                    Clique em <strong>"Aplicar Nova Grade"</strong> para carregar esses jogos no seu aplicativo imediatamente.
                  </p>
                </div>
              </div>

              {/* Sample list */}
              <div>
                <div className="text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider flex items-center justify-between">
                  <span>Prévia dos Primeiros Jogos Identificados</span>
                  <span className="text-emerald-400 font-semibold">{extractedPreview.matches.length} no total</span>
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1.5 border border-neutral-800 rounded-xl p-2 bg-neutral-950">
                  {extractedPreview.matches.slice(0, 10).map((m, idx) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-neutral-900 border border-neutral-850"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-black text-emerald-400 shrink-0">{m.time}</span>
                        <span className="text-neutral-400 shrink-0">•</span>
                        <span className="font-bold text-white truncate">{m.matchTitle}</span>
                        <span className="text-neutral-500 text-[11px] truncate hidden sm:inline">
                          ({m.leagueOrSport})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {m.highlight && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Destaque
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-400 font-medium bg-neutral-800 px-2 py-0.5 rounded">
                          {m.channels[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                  {extractedPreview.matches.length > 10 && (
                    <div className="text-center py-2 text-xs text-neutral-500 font-medium">
                      + mais {extractedPreview.matches.length - 10} eventos esportivos prontos
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between gap-3">
          {!extractedPreview ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProcessImages}
                disabled={images.length === 0 || isProcessing}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                  images.length === 0 || isProcessing
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Lendo Tabelas com Gemini IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extrair Programação das Fotos</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setExtractedPreview(null)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Voltar e Ajustar Fotos</span>
              </button>
              <button
                type="button"
                onClick={handleApplySchedule}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Aplicar Nova Grade no App</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
