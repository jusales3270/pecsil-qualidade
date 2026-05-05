import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardData } from '../hooks/useDashboardData';
import { useTheme } from '../contexts/ThemeContext';

interface ClienteChartProps {
  por_cliente: DashboardData['por_cliente'];
  status_por_cliente: DashboardData['status_por_cliente'];
}

const STATUS_COLORS: Record<string, string> = {
  'FINALIZADO': '#10b981',
  'EM PRODUÇÃO': '#f59e0b',
  'AGUARDANDO': '#ef4444',
  'PENDENTE': '#64748b',
  'PRONTO': '#06b6d4',
  'NÃO NECESSÁRIO': '#6b7280',
};

export default function ClienteChart({ por_cliente, status_por_cliente }: ClienteChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = Object.entries(por_cliente)
    .map(([name, total]) => {
      const statusMap = status_por_cliente[name] || {};
      return {
        name: name.length > 12 ? name.substring(0, 12) + '...' : name,
        fullName: name,
        total,
        finalizado: statusMap['FINALIZADO'] || 0,
        emProducao: statusMap['EM PRODUÇÃO'] || 0,
        aguardando: statusMap['AGUARDANDO'] || 0,
        pendente: statusMap['PENDENTE'] || 0,
        pronto: statusMap['PRONTO'] || 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-4">OS por Cliente / Grupo</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} 
              axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} 
              axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                borderRadius: '8px',
                color: isDark ? '#f1f5f9' : '#1e293b'
              }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  finalizado: 'Finalizado',
                  emProducao: 'Em Produção',
                  aguardando: 'Aguardando',
                  pendente: 'Pendente',
                  pronto: 'Pronto'
                };
                return [`${value} OS`, labels[name] || name];
              }}
              labelFormatter={(label: string) => {
                const item = data.find(d => d.name === label);
                return item?.fullName || label;
              }}
            />
            <Bar dataKey="finalizado" stackId="a" fill={STATUS_COLORS['FINALIZADO']} radius={[0, 0, 0, 0]} />
            <Bar dataKey="emProducao" stackId="a" fill={STATUS_COLORS['EM PRODUÇÃO']} radius={[0, 0, 0, 0]} />
            <Bar dataKey="aguardando" stackId="a" fill={STATUS_COLORS['AGUARDANDO']} radius={[0, 0, 0, 0]} />
            <Bar dataKey="pendente" stackId="a" fill={STATUS_COLORS['PENDENTE']} radius={[0, 0, 0, 0]} />
            <Bar dataKey="pronto" stackId="a" fill={STATUS_COLORS['PRONTO']} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
