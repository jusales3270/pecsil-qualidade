import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DashboardData } from '../hooks/useDashboardData';
import { useTheme } from '../contexts/ThemeContext';

interface StatusChartProps {
  por_status: DashboardData['por_status'];
}

const COLORS: Record<string, string> = {
  'FINALIZADO': '#10b981',
  'EM PRODUÇÃO': '#f59e0b',
  'AGUARDANDO': '#ef4444',
  'PENDENTE': '#64748b',
  'PRONTO': '#06b6d4',
  'NÃO NECESSÁRIO': '#6b7280',
};

export default function StatusChart({ por_status }: StatusChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = Object.entries(por_status).map(([name, value]) => ({
    name,
    value,
    color: COLORS[name] || '#94a3b8'
  }));

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-4">Status das Ordens de Serviço</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                borderRadius: '8px',
                color: isDark ? '#f1f5f9' : '#1e293b'
              }}
              formatter={(value: number, name: string) => [`${value} OS (${((value / data.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%)`, name]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value: string) => <span className="text-sm text-muted-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
