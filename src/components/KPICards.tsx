import { CheckCircle2, Clock, AlertTriangle, Package, Loader2, CalendarX } from 'lucide-react';
import type { DashboardData } from '../hooks/useDashboardData';

interface KPICardsProps {
  kpis: DashboardData['kpis'];
}

export default function KPICards({ kpis }: KPICardsProps) {
  const cards = [
    {
      title: 'Total de OS',
      value: kpis.total_os,
      subtitle: `${kpis.total_pecas.toLocaleString()} peças`,
      icon: Package,
      color: 'bg-blue-500/20 text-blue-400',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Finalizados',
      value: kpis.finalizados,
      subtitle: `${((kpis.finalizados / kpis.total_os) * 100).toFixed(1)}% do total`,
      icon: CheckCircle2,
      color: 'bg-emerald-500/20 text-emerald-400',
      borderColor: 'border-emerald-500/30',
    },
    {
      title: 'Em Produção',
      value: kpis.em_producao,
      subtitle: 'Ordens ativas',
      icon: Loader2,
      color: 'bg-amber-500/20 text-amber-400',
      borderColor: 'border-amber-500/30',
    },
    {
      title: 'Aguardando',
      value: kpis.aguardando,
      subtitle: 'Bloqueados',
      icon: Clock,
      color: 'bg-red-500/20 text-red-400',
      borderColor: 'border-red-500/30',
    },
    {
      title: 'Pendentes',
      value: kpis.pendentes,
      subtitle: 'Sem status definido',
      icon: AlertTriangle,
      color: 'bg-slate-500/20 text-slate-400',
      borderColor: 'border-slate-500/30',
    },
    {
      title: 'Atrasados',
      value: kpis.atrasados,
      subtitle: `${kpis.sem_data} sem data de entrega`,
      icon: CalendarX,
      color: 'bg-rose-500/20 text-rose-400',
      borderColor: 'border-rose-500/30',
      alert: kpis.atrasados > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`kpi-card ${card.alert ? 'alert-pulse border-rose-500/40' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="text-3xl font-bold mt-1">{card.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              </div>
              <div className={`kpi-icon ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
