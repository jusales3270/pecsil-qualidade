import { Factory, BarChart3, TrendingUp, RefreshCw, Upload } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import KPICards from '../components/KPICards';
import StatusChart from '../components/StatusChart';
import ClienteChart from '../components/ClienteChart';
import TipoChart from '../components/TipoChart';
import AtrasadosTable from '../components/AtrasadosTable';
import DataTable from '../components/DataTable';
import GoogleSyncConfig from '../components/GoogleSyncConfig';
import ThemeToggle from '../components/ThemeToggle';

export default function Home() {
  const { data, loading, error, processExcel, reload, syncMode, googleUrl, configureGoogleSync, lastSync } = useDashboardData();

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Carregando dados da fábrica...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Erro ao carregar dados</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={reload}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Factory className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Pecsil - Controle de Qualidade</h1>
                <p className="text-sm text-muted-foreground">
                  Dashboard de Planejamento e Execução da Fábrica
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Upload Excel (fallback) */}
              <label className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors border border-border cursor-pointer">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Importar Excel</span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => e.target.files?.[0] && processExcel(e.target.files[0])}
                  className="hidden"
                />
              </label>

              {/* Google Sync */}
              <GoogleSyncConfig
                googleUrl={googleUrl}
                onConfigure={configureGoogleSync}
                syncMode={syncMode}
              />

              {/* Refresh */}
              <button
                onClick={reload}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors border border-border disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Sync Status */}
              <div className="text-right hidden md:block">
                <p className="text-xs text-muted-foreground">
                  Fonte: {syncMode === 'google' ? 'Google Sheets (Auto)' : 'Planilha Local'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Sincronizado: {lastSync}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* KPI Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Indicadores Principais</h2>
          </div>
          <KPICards kpis={data.kpis} />
        </section>

        {/* Alert Section - Atrasados */}
        {data.atrasados.length > 0 && (
          <AtrasadosTable atrasados={data.atrasados} />
        )}

        {/* Charts Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Análise Gráfica</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatusChart por_status={data.por_status} />
            <ClienteChart por_cliente={data.por_cliente} status_por_cliente={data.status_por_cliente} />
          </div>
          <div className="mt-6">
            <TipoChart por_tipo={data.por_tipo} />
          </div>
        </section>

        {/* Data Table Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Factory className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Ordens de Serviço</h2>
          </div>
          <DataTable registros={data.registros} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>Pecsil - Dashboard de Controle de Qualidade</p>
          <p className="mt-1">
            {syncMode === 'google' 
              ? `Sincronização ativa com Google Sheets | Atualizações automáticas a cada 60 segundos`
              : `Para sincronização automática, configure a conexão com Google Sheets no botão "Sincronizar"`
            }
          </p>
        </div>
      </footer>
    </div>
  );
}
