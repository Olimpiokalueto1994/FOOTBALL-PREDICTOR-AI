import React, { useState } from 'react';
import { queryPredictor } from '../services/api';
import { Sparkles, X, Send, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface NaturalLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMatch: (matchId: string) => void;
  language: Language;
}

export const NaturalLanguageModal: React.FC<NaturalLanguageModalProps> = ({
  isOpen,
  onClose,
  onSelectMatch,
  language,
}) => {
  const t = translations[language];
  const [queryText, setQueryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ answer: string; relatedMatchId?: string } | null>(null);

  if (!isOpen) return null;

  const handleSend = async (q: string) => {
    const textToSend = q || queryText;
    if (!textToSend.trim() || loading) return;

    setLoading(true);
    setQueryText(textToSend);
    try {
      const res = await queryPredictor(textToSend);
      setResponse(res);
    } catch (err) {
      console.error('Error querying predictor:', err);
      setResponse({
        answer: 'Erro ao conectar ao motor de linguagem. O modelo estatístico opera normalmente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    'Quais os principais fatores de risco em Arsenal vs Chelsea?',
    'Como o desfalque de Rodri impacta o Real Madrid vs Man City?',
    'Qual partida hoje possui maior probabilidade para o time da casa?',
    'Como o modelo calcula a vantagem de mando de campo?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-xl border border-[#252D3A] bg-[#10151F] p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#252D3A] pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-[#F5F7FA] font-mono">
              Pergunte ao Predictor (AI Football Analyst)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8D98A8] hover:text-[#F5F7FA] p-1 rounded hover:bg-[#151C28]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-3">
          <div className="relative">
            <input
              id="ai-analyst-input"
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(queryText);
              }}
              placeholder="Ex: Como o índice de fadiga influencia o Arsenal hoje?"
              className="w-full rounded-md border border-[#252D3A] bg-[#151C28] py-2.5 pl-4 pr-12 text-sm text-[#F5F7FA] placeholder-[#8D98A8] focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={() => handleSend(queryText)}
              disabled={loading || !queryText.trim()}
              className="absolute right-2 top-2 rounded bg-emerald-500/20 p-1.5 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-40 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Sample Prompts */}
          <div className="flex flex-wrap gap-1.5">
            {sampleQueries.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="rounded border border-[#252D3A] bg-[#151C28] px-2.5 py-1 text-[11px] font-mono text-[#8D98A8] hover:text-[#F5F7FA] hover:border-[#374254] transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        {loading && (
          <div className="rounded-lg border border-[#252D3A] bg-[#151C28] p-4 text-xs font-mono text-emerald-400 flex items-center space-x-2 animate-pulse">
            <Sparkles className="h-4 w-4 animate-spin" />
            <span>Consultando dados do ensemble e gerando síntese analítica...</span>
          </div>
        )}

        {response && !loading && (
          <div className="rounded-lg border border-emerald-500/30 bg-[#151C28] p-4 space-y-3">
            <div className="text-xs text-[#F5F7FA] leading-relaxed whitespace-pre-line">
              {response.answer}
            </div>

            {response.relatedMatchId && (
              <div className="pt-2 border-t border-[#252D3A] flex justify-end">
                <button
                  onClick={() => {
                    onSelectMatch(response.relatedMatchId!);
                    onClose();
                  }}
                  className="flex items-center space-x-1 text-xs font-mono text-emerald-400 hover:underline"
                >
                  <span>Abrir análise completa desta partida</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
