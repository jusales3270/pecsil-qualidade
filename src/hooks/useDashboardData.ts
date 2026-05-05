import { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';

export interface Registro {
  OS: string;
  CLIENTE: string;
  CLIENTE_GRUPO: string;
  TIPO: string | null;
  ART: string | null;
  DESCRICAO: string | null;
  QTD: number | null;
  DATA_PEDIDO: string | null;
  DATA_ENTREGA: string | null;
  STATUS: string;
  STATUS_ORIGINAL: string | null;
  OBS: string | null;
  MATERIAL: string | null;
}

export interface DashboardData {
  meta: {
    gerado_em: string;
    total_registros: number;
    total_pecas: number;
  };
  kpis: {
    total_os: number;
    total_pecas: number;
    finalizados: number;
    em_producao: number;
    aguardando: number;
    pendentes: number;
    prontos: number;
    nao_necessario: number;
    atrasados: number;
    sem_data: number;
  };
  por_status: Record<string, number>;
  por_cliente: Record<string, number>;
  status_por_cliente: Record<string, Record<string, number>>;
  por_tipo: Record<string, number>;
  atrasados: Array<{
    OS: string;
    CLIENTE: string;
    CLIENTE_GRUPO: string;
    TIPO: string | null;
    DESCRICAO: string | null;
    QTD: number | null;
    DATA_ENTREGA: string | null;
    STATUS: string;
    OBS: string | null;
  }>;
  sem_data: Array<{
    OS: string;
    CLIENTE: string;
    CLIENTE_GRUPO: string;
    TIPO: string | null;
    DESCRICAO: string | null;
    QTD: number | null;
    STATUS: string;
  }>;
  registros: Registro[];
}

function cleanValue(val: any): any {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number' && isNaN(val)) return null;
  if (val instanceof Date) return val.toISOString().split('T')[0];
  const str = String(val).trim();
  if (str === '' || str.toUpperCase() === 'NAN' || str.toUpperCase() === 'NAT') return null;
  return str;
}

function parseDate(val: any): string | null {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString().split('T')[0];
  if (typeof val === 'number') {
    const date = XLSX.SSF.parse_date_code(val);
    if (date) return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }
  const str = String(val).trim();
  const match = str.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  return null;
}

function extractStatus(obs: string | null, statusCol: string | null): string {
  const obsStr = (obs || '').toUpperCase();
  const statusStr = (statusCol || '').toUpperCase();
  const combined = `${obsStr} ${statusStr}`;

  if (combined.includes('FINALIZADO') || combined.includes('ENTREGUE')) return 'FINALIZADO';
  if (combined.includes('AGUARDANDO') || combined.includes('ATRASADO')) return 'AGUARDANDO';
  if (combined.includes('PRODUÇÃO') || combined.includes('TORNO') || combined.includes('CENTRO')) return 'EM PRODUÇÃO';
  if (combined.includes('PRONTO')) return 'PRONTO';
  if (combined.includes('DESBASTE') || combined.includes('FUNDIÇÃO') || combined.includes('FURAÇÃO')) return 'EM PRODUÇÃO';
  if (combined.includes('FAKE') || combined.includes('N-PRECISA') || combined.includes('N.PRECISA')) return 'NÃO NECESSÁRIO';
  return 'PENDENTE';
}

function processExcelData(workbook: XLSX.WorkBook): DashboardData {
  const allRecords: Registro[] = [];
  const sheetNames = workbook.SheetNames;

  for (const sheetName of sheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as any[][];
    
    if (jsonData.length < 2) continue;

    let headerRow = -1;
    for (let i = 0; i < Math.min(5, jsonData.length); i++) {
      const row = jsonData[i];
      if (!row) continue;
      const rowStr = row.map(v => String(v || '').toUpperCase()).join(' ');
      if (rowStr.includes('OS') && (rowStr.includes('CLIENTE') || rowStr.includes('TIPO') || rowStr.includes('DESCRIÇÃO') || rowStr.includes('DESCRICAO'))) {
        headerRow = i;
        break;
      }
    }

    if (headerRow === -1) continue;

    const headers = jsonData[headerRow].map(h => String(h || '').toUpperCase().trim());
    const colMap: Record<string, number> = {};
    
    headers.forEach((h, idx) => {
      if (h === 'OS' || h === 'O.S') colMap['OS'] = idx;
      else if (h.includes('CLIENTE')) colMap['CLIENTE'] = idx;
      else if (h.includes('MATERIAL') && !h.includes('LISTA')) colMap['MATERIAL'] = idx;
      else if (h.includes('TIPO')) colMap['TIPO'] = idx;
      else if (h === 'ART.' || h === 'ART') colMap['ART'] = idx;
      else if (h.includes('DESCRIÇÃO') || h.includes('DESCRICAO')) colMap['DESCRICAO'] = idx;
      else if (h === 'QTD.' || h === 'QTD') colMap['QTD'] = idx;
      else if (h.includes('PEDIDO') && (h.includes('DATA') || h.includes('DE'))) colMap['DATA_PEDIDO'] = idx;
      else if ((h.includes('ENTREGA') || h.includes('ENT')) && (h.includes('DATA') || h.includes('DE'))) colMap['DATA_ENTREGA'] = idx;
      else if (h.includes('OBS')) colMap['OBS'] = idx;
      else if (h.includes('STATUS') && !h.includes('FUNDIÇÃO') && !h.includes('PECSIL')) colMap['STATUS'] = idx;
      else if (h.includes('FUNDIÇÃO') || h.includes('FUNDICAO')) colMap['OS_FUNDIÇÃO'] = idx;
      else if (h.includes('PECSIL') || h.includes('PICSIL')) colMap['OS_PECSIL'] = idx;
      else if (h.includes('CAIXA')) colMap['CAIXA'] = idx;
      else if (h.includes('LISTA') && h.includes('MATERIAL')) colMap['LISTA_MATERIAL'] = idx;
      else if (h.includes('CHAVETA')) colMap['CHAVETA'] = idx;
    });

    if (!colMap['OS']) continue;

    for (let i = headerRow + 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row) continue;

      const osVal = cleanValue(row[colMap['OS']]);
      if (!osVal || String(osVal).toUpperCase() === 'OS') continue;

      const cliente = cleanValue(colMap['CLIENTE'] !== undefined ? row[colMap['CLIENTE']] : null) || sheetName;
      const tipo = cleanValue(colMap['TIPO'] !== undefined ? row[colMap['TIPO']] : null);
      if (tipo && String(tipo).toUpperCase().includes('OS')) continue;

      let qtd = cleanValue(colMap['QTD'] !== undefined ? row[colMap['QTD']] : null);
      try {
        qtd = qtd !== null ? parseInt(String(qtd).replace(/[^\d]/g, '')) : null;
        if (isNaN(qtd as any)) qtd = null;
      } catch { qtd = null; }

      const obs = cleanValue(colMap['OBS'] !== undefined ? row[colMap['OBS']] : null);
      const statusCol = cleanValue(colMap['STATUS'] !== undefined ? row[colMap['STATUS']] : null);
      const status = extractStatus(obs, statusCol);

      const record: Registro = {
        OS: String(osVal),
        CLIENTE: String(cliente).toUpperCase(),
        CLIENTE_GRUPO: sheetName === 'PRIORIDADES' ? String(cliente).toUpperCase() : sheetName,
        TIPO: tipo,
        ART: cleanValue(colMap['ART'] !== undefined ? row[colMap['ART']] : null),
        DESCRICAO: cleanValue(colMap['DESCRICAO'] !== undefined ? row[colMap['DESCRICAO']] : null),
        QTD: qtd as number | null,
        DATA_PEDIDO: parseDate(colMap['DATA_PEDIDO'] !== undefined ? row[colMap['DATA_PEDIDO']] : null),
        DATA_ENTREGA: parseDate(colMap['DATA_ENTREGA'] !== undefined ? row[colMap['DATA_ENTREGA']] : null),
        STATUS: status,
        STATUS_ORIGINAL: statusCol,
        OBS: obs,
        MATERIAL: cleanValue(colMap['MATERIAL'] !== undefined ? row[colMap['MATERIAL']] : null),
      };

      allRecords.push(record);
    }
  }

  const totalOs = allRecords.length;
  const totalPecas = allRecords.reduce((sum, r) => sum + (r.QTD || 0), 0);
  const porStatus: Record<string, number> = {};
  const porCliente: Record<string, number> = {};
  const statusPorCliente: Record<string, Record<string, number>> = {};
  const porTipo: Record<string, number> = {};

  const hoje = new Date().toISOString().split('T')[0];

  for (const r of allRecords) {
    porStatus[r.STATUS] = (porStatus[r.STATUS] || 0) + 1;
    porCliente[r.CLIENTE_GRUPO] = (porCliente[r.CLIENTE_GRUPO] || 0) + 1;
    if (!statusPorCliente[r.CLIENTE_GRUPO]) statusPorCliente[r.CLIENTE_GRUPO] = {};
    statusPorCliente[r.CLIENTE_GRUPO][r.STATUS] = (statusPorCliente[r.CLIENTE_GRUPO][r.STATUS] || 0) + 1;
    if (r.TIPO) porTipo[r.TIPO] = (porTipo[r.TIPO] || 0) + 1;
  }

  const atrasados = allRecords.filter(r =>
    r.DATA_ENTREGA && r.DATA_ENTREGA < hoje && r.STATUS !== 'FINALIZADO' && r.STATUS !== 'NÃO NECESSÁRIO'
  ).map(r => ({
    OS: r.OS, CLIENTE: r.CLIENTE, CLIENTE_GRUPO: r.CLIENTE_GRUPO,
    TIPO: r.TIPO, DESCRICAO: r.DESCRICAO, QTD: r.QTD,
    DATA_ENTREGA: r.DATA_ENTREGA, STATUS: r.STATUS, OBS: r.OBS
  }));

  const semData = allRecords.filter(r =>
    !r.DATA_ENTREGA && r.STATUS !== 'FINALIZADO' && r.STATUS !== 'NÃO NECESSÁRIO'
  ).map(r => ({
    OS: r.OS, CLIENTE: r.CLIENTE, CLIENTE_GRUPO: r.CLIENTE_GRUPO,
    TIPO: r.TIPO, DESCRICAO: r.DESCRICAO, QTD: r.QTD, STATUS: r.STATUS
  }));

  return {
    meta: { gerado_em: new Date().toISOString(), total_registros: totalOs, total_pecas: totalPecas },
    kpis: {
      total_os: totalOs,
      total_pecas: totalPecas,
      finalizados: porStatus['FINALIZADO'] || 0,
      em_producao: porStatus['EM PRODUÇÃO'] || 0,
      aguardando: porStatus['AGUARDANDO'] || 0,
      pendentes: porStatus['PENDENTE'] || 0,
      prontos: porStatus['PRONTO'] || 0,
      nao_necessario: porStatus['NÃO NECESSÁRIO'] || 0,
      atrasados: atrasados.length,
      sem_data: semData.length
    },
    por_status: porStatus,
    por_cliente: porCliente,
    status_por_cliente: statusPorCliente,
    por_tipo: porTipo,
    atrasados,
    sem_data: semData,
    registros: allRecords
  };
}

function buildDashboardData(records: Registro[]): DashboardData {
  const totalOs = records.length;
  const totalPecas = records.reduce((sum, r) => sum + (r.QTD || 0), 0);
  const porStatus: Record<string, number> = {};
  const porCliente: Record<string, number> = {};
  const statusPorCliente: Record<string, Record<string, number>> = {};
  const porTipo: Record<string, number> = {};

  const hoje = new Date().toISOString().split('T')[0];

  for (const r of records) {
    porStatus[r.STATUS] = (porStatus[r.STATUS] || 0) + 1;
    porCliente[r.CLIENTE_GRUPO] = (porCliente[r.CLIENTE_GRUPO] || 0) + 1;
    if (!statusPorCliente[r.CLIENTE_GRUPO]) statusPorCliente[r.CLIENTE_GRUPO] = {};
    statusPorCliente[r.CLIENTE_GRUPO][r.STATUS] = (statusPorCliente[r.CLIENTE_GRUPO][r.STATUS] || 0) + 1;
    if (r.TIPO) porTipo[r.TIPO] = (porTipo[r.TIPO] || 0) + 1;
  }

  const atrasados = records.filter(r =>
    r.DATA_ENTREGA && r.DATA_ENTREGA < hoje && r.STATUS !== 'FINALIZADO' && r.STATUS !== 'NÃO NECESSÁRIO'
  ).map(r => ({
    OS: r.OS, CLIENTE: r.CLIENTE, CLIENTE_GRUPO: r.CLIENTE_GRUPO,
    TIPO: r.TIPO, DESCRICAO: r.DESCRICAO, QTD: r.QTD,
    DATA_ENTREGA: r.DATA_ENTREGA, STATUS: r.STATUS, OBS: r.OBS
  }));

  const semData = records.filter(r =>
    !r.DATA_ENTREGA && r.STATUS !== 'FINALIZADO' && r.STATUS !== 'NÃO NECESSÁRIO'
  ).map(r => ({
    OS: r.OS, CLIENTE: r.CLIENTE, CLIENTE_GRUPO: r.CLIENTE_GRUPO,
    TIPO: r.TIPO, DESCRICAO: r.DESCRICAO, QTD: r.QTD, STATUS: r.STATUS
  }));

  return {
    meta: { gerado_em: new Date().toISOString(), total_registros: totalOs, total_pecas: totalPecas },
    kpis: {
      total_os: totalOs,
      total_pecas: totalPecas,
      finalizados: porStatus['FINALIZADO'] || 0,
      em_producao: porStatus['EM PRODUÇÃO'] || 0,
      aguardando: porStatus['AGUARDANDO'] || 0,
      pendentes: porStatus['PENDENTE'] || 0,
      prontos: porStatus['PRONTO'] || 0,
      nao_necessario: porStatus['NÃO NECESSÁRIO'] || 0,
      atrasados: atrasados.length,
      sem_data: semData.length
    },
    por_status: porStatus,
    por_cliente: porCliente,
    status_por_cliente: statusPorCliente,
    por_tipo: porTipo,
    atrasados,
    sem_data: semData,
    registros: records
  };
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncMode, setSyncMode] = useState<'local' | 'google'>('local');
  const [googleUrl, setGoogleUrl] = useState<string>(() => localStorage.getItem('pecsil-google-url') || '');
  const [lastSync, setLastSync] = useState<string>('Nunca');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load local JSON
  const loadFromJson = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/dashboard_data.json');
      if (!response.ok) throw new Error('Falha ao carregar dados');
      const jsonData = await response.json();
      setData(jsonData);
      setSyncMode('local');
      setLastSync(new Date().toLocaleString('pt-BR'));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Process uploaded Excel
  const processExcel = useCallback(async (file: File) => {
    try {
      setLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const processedData = processExcelData(workbook);
      setData(processedData);
      setSyncMode('local');
      setLastSync(new Date().toLocaleString('pt-BR'));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar Excel');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync from Google Apps Script URL
  const syncFromGoogle = useCallback(async (url: string) => {
    if (!url) return;
    try {
      setLoading(true);
      const response = await fetch(url, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error('Falha na sincronização');
      const records: Registro[] = await response.json();
      const dashboardData = buildDashboardData(records);
      setData(dashboardData);
      setSyncMode('google');
      setLastSync(new Date().toLocaleString('pt-BR'));
      setError(null);
      localStorage.setItem('pecsil-google-url', url);
    } catch (err) {
      setError('Erro ao sincronizar com Google: ' + (err instanceof Error ? err.message : 'Falha de conexão'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Configure Google sync URL
  const configureGoogleSync = useCallback((url: string) => {
    setGoogleUrl(url);
    localStorage.setItem('pecsil-google-url', url);
    syncFromGoogle(url);
  }, [syncFromGoogle]);

  // Auto-polling for Google sync
  useEffect(() => {
    if (syncMode === 'google' && googleUrl) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        syncFromGoogle(googleUrl);
      }, 60000); // 60 seconds
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [syncMode, googleUrl, syncFromGoogle]);

  // Initial load
  useEffect(() => {
    // If Google URL is configured, try it first, otherwise load local
    if (googleUrl) {
      syncFromGoogle(googleUrl).catch(() => loadFromJson());
    } else {
      loadFromJson();
    }
  }, [loadFromJson, syncFromGoogle, googleUrl]);

  const manualSync = useCallback(() => {
    if (syncMode === 'google' && googleUrl) {
      syncFromGoogle(googleUrl);
    } else {
      loadFromJson();
    }
  }, [syncMode, googleUrl, syncFromGoogle, loadFromJson]);

  return { 
    data, loading, error, 
    processExcel, 
    reload: manualSync,
    syncMode,
    googleUrl,
    configureGoogleSync,
    lastSync
  };
}
