import { useState } from 'react';
import { Settings, Link, Check, X, ExternalLink } from 'lucide-react';

interface GoogleSyncConfigProps {
  googleUrl: string;
  onConfigure: (url: string) => void;
  syncMode: 'local' | 'google';
}

export default function GoogleSyncConfig({ googleUrl, onConfigure, syncMode }: GoogleSyncConfigProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(googleUrl);
  const [showHelp, setShowHelp] = useState(false);

  const handleSave = () => {
    onConfigure(url);
    setOpen(false);
  };

  const handleDisconnect = () => {
    onConfigure('');
    setUrl('');
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
          syncMode === 'google'
            ? 'bg-emerald-500/20 text-emerald-600 border-emerald-400/50 dark:text-emerald-400'
            : 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80'
        }`}
        title="Configurar sincronização com Google Sheets"
      >
        <Link className="h-4 w-4" />
        {syncMode === 'google' ? 'Sincronizado' : 'Sincronizar'}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 z-50 rounded-xl border border-border bg-card shadow-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Sincronização Google Sheets
            </h3>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">URL do Apps Script</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
              >
                <Check className="h-4 w-4" />
                Conectar
              </button>
              {syncMode === 'google' && (
                <button
                  onClick={handleDisconnect}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-destructive/20 text-destructive rounded-lg text-sm hover:bg-destructive/30"
                >
                  Desconectar
                </button>
              )}
            </div>

            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              {showHelp ? 'Ocultar instruções' : 'Como configurar?'}
            </button>

            {showHelp && (
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 space-y-2">
                <p className="font-medium text-foreground">Passo a passo:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Abra sua planilha no Google Sheets</li>
                  <li>Clique em <b>Extensões → Apps Script</b></li>
                  <li>Cole o código do webhook (ver abaixo)</li>
                  <li>Clique em <b>Implantar → Nova implantação</b></li>
                  <li>Tipo: <b>Aplicativo Web</b>, Acesso: <b>Qualquer pessoa</b></li>
                  <li>Copie a URL gerada e cole aqui</li>
                </ol>
                <p className="mt-2 pt-2 border-t border-border">
                  O dashboard buscará atualizações <b>a cada 60 segundos</b> automaticamente.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
