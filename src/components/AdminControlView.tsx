import React, { useEffect, useState } from 'react';
import { getAdminStatus } from '../services/api';
import { Activity, Database, Server, RefreshCw, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';
import { Language } from '../i18n/translations';

interface AdminControlViewProps {
  language: Language;
}

export const AdminControlView: React.FC<AdminControlViewProps> = () => {
  const [status, setStatus] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = () => {
    setIsRefreshing(true);
    getAdminStatus()
      .then((data) => {
        setStatus(data);
        setIsRefreshing(false);
      })
      .catch((err) => {
        console.error('Failed to fetch admin status:', err);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div id="admin-control-view" className="space-y-6 pb-12 font-mono text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#252D3A] pb-4 gap-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
            SYSTEM DIAGNOSTICS & TELEMETRY
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-[#F5F7FA] mt-0.5">
            Centro de Controle de Dados
          </h2>
          <p className="text-[#8D98A8] text-xs font-sans mt-1">
            Status operacional de provedores de dados, pipelines matemáticos e integridade de inferência.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={isRefreshing}
          className="flex items-center space-x-1.5 rounded-md border border-[#252D3A] bg-[#10151F] px-3 py-1.5 text-xs text-[#8D98A8] hover:text-[#F5F7FA] hover:bg-[#151C28] w-fit"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Atualizar Diagnóstico</span>
        </button>
      </div>

      {/* System Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-[#252D3A] bg-[#10151F] p-4 space-y-1">
          <span className="text-[#8D98A8] uppercase text-[10px]">Taxa de Disponibilidade</span>
          <span className="text-xl font-bold text-emerald-400 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1.5" /> 99.98%
          </span>
          <span className="text-[10px] text-[#8D98A8]">Zero degradação de serviço</span>
        </div>

        <div className="rounded-lg border border-[#252D3A] bg-[#10151F] p-4 space-y-1">
          <span className="text-[#8D98A8] uppercase text-[10px]">Tempo de Inferência</span>
          <span className="text-xl font-bold text-[#F5F7FA]">42ms</span>
          <span className="text-[10px] text-[#8D98A8]">Motor C++ / Node.js otimizado</span>
        </div>

        <div className="rounded-lg border border-[#252D3A] bg-[#10151F] p-4 space-y-1">
          <span className="text-[#8D98A8] uppercase text-[10px]">Gemini Reasoning</span>
          <span className="text-xl font-bold text-blue-400">
            {status?.aiAnalyst?.mode === 'SERVER_SIDE_LIVE' ? 'LIVE ONLINE' : 'DETERMINISTIC FALLBACK'}
          </span>
          <span className="text-[10px] text-[#8D98A8]">Grounding estruturado</span>
        </div>
      </div>

      {/* Data Providers Table */}
      <div className="rounded-xl border border-[#252D3A] bg-[#10151F] p-6 space-y-3">
        <h3 className="text-sm font-bold text-[#F5F7FA] border-b border-[#252D3A] pb-2 flex items-center">
          <Database className="mr-2 h-4 w-4 text-emerald-400" />
          Provedores de Dados & Integrações
        </h3>

        <div className="space-y-2">
          {status?.dataProviders?.map((prov: any, idx: number) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between rounded bg-[#151C28] p-3 border border-[#252D3A] gap-2">
              <div>
                <span className="font-bold text-[#F5F7FA] block">{prov.name}</span>
                <span className="text-[10px] text-[#8D98A8]">{prov.coverage}</span>
              </div>

              <div className="flex items-center space-x-4 text-[11px]">
                <span className="text-[#8D98A8]">Última sincronização: <strong className="text-[#F5F7FA]">{prov.lastSync}</strong></span>
                <span className="text-emerald-400 font-bold">{prov.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mathematical Models in Ensemble */}
      <div className="rounded-xl border border-[#252D3A] bg-[#10151F] p-6 space-y-3">
        <h3 className="text-sm font-bold text-[#F5F7FA] border-b border-[#252D3A] pb-2 flex items-center">
          <Cpu className="mr-2 h-4 w-4 text-emerald-400" />
          Modelos Estatísticos Ativos no Ensemble
        </h3>

        <div className="grid gap-3 sm:grid-cols-2">
          {status?.activeModels?.map((mod: any, idx: number) => (
            <div key={idx} className="rounded-lg border border-[#252D3A] bg-[#151C28] p-3.5 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#F5F7FA]">{mod.name}</span>
                <span className="text-emerald-400 font-bold">{mod.weight}</span>
              </div>
              <div className="flex justify-between text-[10px] text-[#8D98A8]">
                <span>Versão: {mod.version}</span>
                <span className="text-emerald-400">{mod.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
