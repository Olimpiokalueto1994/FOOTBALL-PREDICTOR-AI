import React from 'react';
import { X, ShieldCheck, Cpu, Database, CheckCircle2 } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface TransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const TransparencyModal: React.FC<TransparencyModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-xl border border-[#252D3A] bg-[#10151F] p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#252D3A] pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-[#F5F7FA]">
              Metodologia de Cálculo & Formulações Matemáticas
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8D98A8] hover:text-[#F5F7FA] p-1 rounded hover:bg-[#151C28]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section 1: Dixon-Coles Bivariate Poisson */}
        <div className="space-y-2 rounded-lg border border-[#252D3A] bg-[#151C28] p-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#F5F7FA] text-sm">1. Poisson Bivariado Modificado (Dixon-Coles)</span>
            <span className="text-emerald-400 font-bold">Peso: 35%</span>
          </div>
          <p className="text-[#8D98A8] font-sans leading-relaxed">
            Modela a taxa esperada de gols (xG) para o mandante ($\lambda$) e visitante ($\mu$) ajustando a dependência mútua em placares baixos (0-0, 1-0, 0-1, 1-1) através do fator de correlação $\tau(x, y)$:
          </p>
          <div className="rounded bg-[#10151F] p-3 text-emerald-300 overflow-x-auto text-[11px]">
            {`P(X = x, Y = y) = τ(x, y) × [ (λ^x · e^(-λ)) / x! ] × [ (μ^y · e^(-μ)) / y! ]`}
            <br />
            {`onde τ(0,0) = 1 - λ·μ·ρ ; τ(1,0) = 1 + μ·ρ ; τ(0,1) = 1 + λ·ρ ; τ(1,1) = 1 - ρ`}
          </div>
        </div>

        {/* Section 2: Dynamic Elo Rating */}
        <div className="space-y-2 rounded-lg border border-[#252D3A] bg-[#151C28] p-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#F5F7FA] text-sm">2. Rating Elo Dinâmico com Vantagem Caseira</span>
            <span className="text-emerald-400 font-bold">Peso: 25%</span>
          </div>
          <p className="text-[#8D98A8] font-sans leading-relaxed">
            Avalia a força intrínseca e o nível competitivo acumulado, incorporando bônus de mando de campo ($H = +65$ pontos Elo) e ajustando a probabilidade empírica de empate:
          </p>
          <div className="rounded bg-[#10151F] p-3 text-blue-300 overflow-x-auto text-[11px]">
            {`E_A = 1 / [ 1 + 10^((R_B - R_A - H) / 400) ]`}
            <br />
            {`P(Empate) = γ · exp( - (E_A - 0.5)^2 / (2σ^2) )`}
          </div>
        </div>

        {/* Section 3: Platt Scaling Calibration */}
        <div className="space-y-2 rounded-lg border border-[#252D3A] bg-[#151C28] p-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#F5F7FA] text-sm">3. Calibração por Platt Scaling</span>
            <span className="text-purple-400 font-bold">Garantia Probabilística</span>
          </div>
          <p className="text-[#8D98A8] font-sans leading-relaxed">
            As probabilidades brutas combinadas do ensemble passam por uma transformação sigmoide de calibração paramétrica, garantindo que quando o modelo aponta 70% de probabilidade, o evento ocorra em exatamente 7 de cada 10 vezes no longo prazo:
          </p>
          <div className="rounded bg-[#10151F] p-3 text-purple-300 overflow-x-auto text-[11px]">
            {`P_calibrada(Y=1 | f) = 1 / [ 1 + exp(A · f + B) ]`}
          </div>
        </div>

        {/* Section 4: Walk-Forward Validation Integrity */}
        <div className="space-y-2 rounded-lg border border-[#252D3A] bg-[#151C28] p-4">
          <span className="font-bold text-[#F5F7FA] text-sm block">4. Validação Walk-Forward (Sem Vazamento Temporal)</span>
          <p className="text-[#8D98A8] font-sans leading-relaxed">
            Nenhum dado futuro (como notícias pós-partida ou gols já ocorridos) é utilizado nas previsões. Cada estimativa histórica no nosso motor de backtest é executada estritamente com o estado dos dados disponíveis 1 hora antes do apito inicial.
          </p>
        </div>

        {/* Section 5: Ethical & Legal Disclaimer */}
        <div className="rounded-lg border border-[#252D3A] bg-[#10151F] p-4 text-[#8D98A8] space-y-1 font-sans">
          <span className="font-bold text-[#F5F7FA] block font-mono text-xs uppercase">Aviso Ético & Isenção de Responsabilidade</span>
          <p className="text-xs leading-relaxed">
            O Football Predictor AI é uma ferramenta acadêmica, analítica e probabilística. Não oferecemos apostas, garantias de resultados ou aconselhamento financeiro. Futebol é um esporte estocástico com elevada variância inerente.
          </p>
        </div>
      </div>
    </div>
  );
};
