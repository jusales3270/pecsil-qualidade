import { useState, useMemo } from 'react';
import { Search, Download } from 'lucide-react';
import type { Registro } from '../hooks/useDashboardData';

interface DataTableProps {
  registros: Registro[];
}

export default function DataTable({ registros }: DataTableProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCliente, setFilterCliente] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const statusOptions = useMemo(() => [...new Set(registros.map(r => r.STATUS))], [registros]);
  const clienteOptions = useMemo(() => [...new Set(registros.map(r => r.CLIENTE_GRUPO))], [registros]);

  const filtered = useMemo(() => {
    return registros.filter(r => {
      const matchSearch = !search ||
        r.OS.toLowerCase().includes(search.toLowerCase()) ||
        (r.DESCRICAO && r.DESCRICAO.toLowerCase().includes(search.toLowerCase())) ||
        (r.TIPO && r.TIPO.toLowerCase().includes(search.toLowerCase())) ||
        (r.ART && r.ART.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = !filterStatus || r.STATUS === filterStatus;
      const matchCliente = !filterCliente || r.CLIENTE_GRUPO === filterCliente;
      return matchSearch && matchStatus && matchCliente;
    });
  }, [registros, search, filterStatus, filterCliente]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportCSV = () => {
    const headers = ['OS', 'CLIENTE', 'GRUPO', 'TIPO', 'ART', 'DESCRICAO', 'QTD', 'DATA_PEDIDO', 'DATA_ENTREGA', 'STATUS', 'OBS'];
    const rows = filtered.map(r => [
      r.OS, r.CLIENTE, r.CLIENTE_GRUPO, r.TIPO || '', r.ART || '', r.DESCRICAO || '',
      r.QTD || '', r.DATA_PEDIDO || '', r.DATA_ENTREGA || '', r.STATUS, r.OBS || ''
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pecsis_dashboard_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="chart-container">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold">Ordens de Serviço Detalhadas</h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar OS, descrição, tipo..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm w-64"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
          >
            <option value="">Todos os status</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filterCliente}
            onChange={(e) => { setFilterCliente(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
          >
            <option value="">Todos os clientes</option>
            {clienteOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-2">
        Mostrando {filtered.length} resultados
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 px-3">OS</th>
              <th className="text-left py-2 px-3">Cliente</th>
              <th className="text-left py-2 px-3">Tipo</th>
              <th className="text-left py-2 px-3">Descrição</th>
              <th className="text-center py-2 px-3">Qtd</th>
              <th className="text-center py-2 px-3">Data Pedido</th>
              <th className="text-center py-2 px-3">Data Entrega</th>
              <th className="text-left py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((r, idx) => (
              <tr key={idx} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                <td className="py-2 px-3 font-medium">{r.OS}</td>
                <td className="py-2 px-3">{r.CLIENTE_GRUPO}</td>
                <td className="py-2 px-3">{r.TIPO || '-'}</td>
                <td className="py-2 px-3 max-w-xs truncate">{r.DESCRICAO || '-'}</td>
                <td className="py-2 px-3 text-center">{r.QTD || '-'}</td>
                <td className="py-2 px-3 text-center text-muted-foreground">
                  {r.DATA_PEDIDO ? new Date(r.DATA_PEDIDO).toLocaleDateString('pt-BR') : '-'}
                </td>
                <td className="py-2 px-3 text-center">
                  {r.DATA_ENTREGA ? (
                    <span className={r.DATA_ENTREGA < new Date().toISOString().split('T')[0] && r.STATUS !== 'FINALIZADO' ? 'text-red-400 font-medium' : 'text-muted-foreground'}>
                      {new Date(r.DATA_ENTREGA).toLocaleDateString('pt-BR')}
                    </span>
                  ) : '-'}
                </td>
                <td className="py-2 px-3">
                  <StatusBadge status={r.STATUS} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-border rounded-md text-sm hover:bg-white/5 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-border rounded-md text-sm hover:bg-white/5 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
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
