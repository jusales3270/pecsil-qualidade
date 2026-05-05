import { AlertTriangle, CalendarX, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface AtrasadoItem {
  OS: string;
  CLIENTE: string;
  CLIENTE_GRUPO: string;
  TIPO: string | null;
  DESCRICAO: string | null;
  QTD: number | null;
  DATA_ENTREGA: string | null;
  STATUS: string;
  OBS: string | null;
}

interface AtrasadosTableProps {
  atrasados: AtrasadoItem[];
}

export default function AtrasadosTable({ atrasados }: AtrasadosTableProps) {
  const [expanded, setExpanded] = useState(true);
  const [filterCliente, setFilterCliente] = useState('');

  const clientes = [...new Set(atrasados.map(a => a.CLIENTE_GRUPO))];
  const filtered = filterCliente
    ? atrasados.filter(a => a.CLIENTE_GRUPO === filterCliente)
    : atrasados;

  if (atrasados.length === 0) return null;

  return (
    <div className="chart-container border-red-500/30 bg-red-950/10">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <h3 className="text-lg font-semibold text-red-400">
            Alerta: OS Atrasadas ({atrasados.length})
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterCliente}
            onChange={(e) => { e.stopPropagation(); setFilterCliente(e.target.value); }}
            className="bg-background border border-border rounded-md px-3 py-1 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">Todos os clientes</option>
            {clientes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 px-3">OS</th>
                <th className="text-left py-2 px-3">Cliente</th>
                <th className="text-left py-2 px-3">Tipo</th>
                <th className="text-left py-2 px-3">Descrição</th>
                <th className="text-center py-2 px-3">Qtd</th>
                <th className="text-center py-2 px-3">Data Entrega</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Observação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-white/5">
                  <td className="py-2 px-3 font-medium">{item.OS}</td>
                  <td className="py-2 px-3">{item.CLIENTE_GRUPO}</td>
                  <td className="py-2 px-3">{item.TIPO || '-'}</td>
                  <td className="py-2 px-3 max-w-xs truncate">{item.DESCRICAO || '-'}</td>
                  <td className="py-2 px-3 text-center">{item.QTD || '-'}</td>
                  <td className="py-2 px-3 text-center text-red-400 font-medium">
                    <div className="flex items-center justify-center gap-1">
                      <CalendarX className="h-3 w-3" />
                      {item.DATA_ENTREGA ? new Date(item.DATA_ENTREGA).toLocaleDateString('pt-BR') : '-'}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <StatusBadge status={item.STATUS} />
                  </td>
                  <td className="py-2 px-3 max-w-xs truncate text-muted-foreground">{item.OBS || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">Nenhum resultado para este filtro.</p>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    'FINALIZADO': 'status-finalizado',
    'EM PRODUÇÃO': 'status-em-producao',
    'AGUARDANDO': 'status-aguardando',
    'PENDENTE': 'status-pendente',
    'PRONTO': 'status-pronto',
    'NÃO NECESSÁRIO': 'status-nao-necessario',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes[status] || 'status-pendente'}`}>
      {status}
    </span>
  );
}
