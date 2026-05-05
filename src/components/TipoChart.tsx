import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

interface TipoChartProps {
  por_tipo: Record<string, number>;
}

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function TipoChart({ por_tipo }: TipoChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = Object.entries(por_tipo)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12);

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-4">Tipos de Peça Mais Frequentes</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 80, bottom: 0 }}>
            <XAxis 
              type="number" 
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} 
              axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} 
              axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
              tickLine={false}
              width={75}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                borderRadius: '8px',
                color: isDark ? '#f1f5f9' : '#1e293b'
              }}
              formatter={(value: number) => [`${value} unidades`, 'Quantidade']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
