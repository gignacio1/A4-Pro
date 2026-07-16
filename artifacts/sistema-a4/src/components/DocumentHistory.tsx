import { useState } from 'react';
import { DocumentData } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { 
  Search, 
  Edit3, 
  Trash2, 
  Eye,
  FileText,
  FileCheck,
  ShieldCheck,
  Receipt,
  Download,
  Upload,
  Calendar,
  Filter
} from 'lucide-react';

interface DocumentHistoryProps {
  documents: DocumentData[];
  onSelectDocument: (doc: DocumentData) => void;
  onEditDocument: (doc: DocumentData) => void;
  onDeleteDocument: (id: string) => void;
  onImportBackup: (docs: DocumentData[]) => void;
}

const typeConfig = {
  orcamento: { label: 'Orçamento', Icon: FileText, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  ordem_servico: { label: 'Ordem de Serviço', Icon: FileCheck, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  laudo_tecnico: { label: 'Laudo Técnico', Icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  recibo: { label: 'Recibo', Icon: Receipt, color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const statusColors = {
  'Pendente': 'bg-red-100 text-red-800',
  'Em Andamento': 'bg-amber-100 text-amber-800',
  'Aprovado': 'bg-blue-100 text-blue-800',
  'Concluído': 'bg-emerald-100 text-emerald-800',
  'Cancelado': 'bg-slate-100 text-slate-500',
};

export default function DocumentHistory({
  documents,
  onSelectDocument,
  onEditDocument,
  onDeleteDocument,
  onImportBackup,
}: DocumentHistoryProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const handleExportBackup = () => {
    const json = JSON.stringify(documents, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `backup_sistema_a4_${new Date().toISOString().split('T')[0]}.json`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          if (confirm(`Backup encontrado com ${data.length} documentos. Deseja substituir o histórico atual?`)) {
            onImportBackup(data);
            alert('Backup importado com sucesso!');
          }
        } else {
          alert('Arquivo de backup inválido ou corrompido.');
        }
      } catch {
        alert('Erro ao ler o arquivo. Certifique-se de que é um arquivo .json válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filtered = documents.filter(doc => {
    const matchesSearch =
      doc.client.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.number.toLowerCase().includes(search.toLowerCase()) ||
      doc.date.includes(search);

    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Histórico de Documentos</h2>
          <p className="text-xs text-slate-400 mt-0.5">{documents.length} documento{documents.length !== 1 ? 's' : ''} encontrado{documents.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar Backup JSON
          </button>
          <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer">
            <Upload className="h-3.5 w-3.5" />
            Importar Backup
            <input type="file" accept=".json" className="sr-only" onChange={handleImportBackup} />
          </label>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs px-3 pl-9 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-300 transition-shadow"
              placeholder="Buscar por cliente, número ou data..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            {['all', 'orcamento', 'ordem_servico', 'laudo_tecnico', 'recibo'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                  filterType === type
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {type === 'all' ? 'Todos' :
                 type === 'orcamento' ? 'Orçamentos' :
                 type === 'ordem_servico' ? 'O.S.' :
                 type === 'laudo_tecnico' ? 'Laudos' : 'Recibos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Document Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 text-center">
          <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-500">Nenhum documento encontrado</h3>
          <p className="text-xs text-slate-400 mt-1">Tente outros termos de busca ou crie novos documentos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(doc => {
            const cfg = typeConfig[doc.type];
            const Icon = cfg.Icon;
            return (
              <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3 hover:border-slate-300 hover:shadow-sm transition-all group">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </span>
                  {doc.status && (
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusColors[doc.status] || 'bg-slate-100 text-slate-500'}`}>
                      {doc.status}
                    </span>
                  )}
                </div>

                {/* Client & Number */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-amber-700 transition-colors">
                    {doc.client.name || 'Cliente não especificado'}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                    <span className="font-mono">Nº {doc.number}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(doc.date)}
                    </span>
                  </div>
                </div>

                {/* Summary items or reference */}
                {doc.items && doc.items.length > 0 && (
                  <div className="text-[11px] text-slate-500 space-y-0.5 max-h-12 overflow-hidden">
                    {doc.items.slice(0, 2).map(item => (
                      <p key={item.id} className="truncate">
                        {item.quantity}× {item.name}
                      </p>
                    ))}
                    {doc.items.length > 2 && (
                      <p className="text-slate-400 italic">+{doc.items.length - 2} mais itens</p>
                    )}
                  </div>
                )}
                {doc.referringTo && (
                  <p className="text-[11px] text-slate-500 truncate italic">{doc.referringTo}</p>
                )}

                {/* Total */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                  <span className="font-bold text-sm text-slate-900 font-mono">
                    {doc.totalAmount > 0 ? formatCurrency(doc.totalAmount) : (doc.receivedValue ? formatCurrency(doc.receivedValue) : '—')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                      title="Visualizar na folha A4"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditDocument(doc)}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                      title="Editar documento"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Excluir documento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
