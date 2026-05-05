import { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, RefreshCw } from 'lucide-react';

interface ExcelUploaderProps {
  onUpload: (file: File) => void;
  onReload: () => void;
  isLoading: boolean;
}

export default function ExcelUploader({ onUpload, onReload, isLoading }: ExcelUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setFileName(file.name);
      onUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
      />
      
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors border border-border"
      >
        <Upload className="h-4 w-4" />
        {fileName ? fileName.substring(0, 20) + '...' : 'Atualizar Planilha'}
      </button>
      
      <button
        onClick={onReload}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors border border-border disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        Recarregar
      </button>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-dashed transition-colors ${
          dragOver ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
        }`}
      >
        <FileSpreadsheet className="h-4 w-4" />
        Arraste o Excel aqui
      </div>
    </div>
  );
}
