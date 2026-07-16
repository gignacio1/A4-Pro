import { useState } from 'react';
import { DocumentData, Product, Service, CompanySettings } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import A4Document from './A4Document';
import {
  LayoutGrid,
  FileText,
  FileCheck,
  ShieldCheck,
  Receipt,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  Package,
  Briefcase,
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Ban,
  ArrowRight,
} from 'lucide-react';

interface DashboardHomeProps {
  documents: DocumentData[];
  products: Product[];
  services: Service[];
  company: CompanySettings;
  onSelectDocumentForEdit: (doc: DocumentData) => void;
  onDeleteDocument: (id: string) => void;
  onUpdateDocumentStatus: (id: string, status: 'Pendente' | 'Em Andamento' | 'Aprovado' | 'Concluído' | 'Cancelado') => void;
  onCreateNewDocument: (type: 'orcamento' | 'ordem_servico' | 'laudo_tecnico' | 'recibo') => void;
}

const typeConfig = {
  orcamento: { label: 'Orçamento', Icon: FileText, color: 'bg-blue-50 text-blue-700 border-blue-100', iconBg: 'bg-blue-100 text-blue-600' },
  ordem_servico: { label: 'Ordem de Serviço', Icon: FileCheck, color: 'bg-indigo-50 text-indigo-700 border-indigo-100', iconBg: 'bg-indigo-100 text-indigo-600' },
  laudo_tecnico: { label: 'Laudo Técnico', Icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-700 border-emerald-100', iconBg: 'bg-emerald-100 text-emerald-600' },
  recibo: { label: 'Recibo', Icon: Receipt, color: 'bg-amber-50 text-amber-700 border-amber-100', iconBg: 'bg-amber-100 text-amber-600' },
};

const statusConfig = {
  'Pendente': { color: 'bg-red-100 text-red-800', Icon: AlertCircle },
  'Em Andamento': { color: 'bg-amber-100 text-amber-800', Icon: Loader2 },
  'Aprovado': { color: 'bg-blue-100 text-blue-800', Icon: CheckCircle2 },
  'Concluído': { color: 'bg-emerald-100 text-emerald-800', Icon: CheckCircle2 },
  'Cancelado': { color: 'bg-slate-100 text-slate-500', Icon: Ban },
};

export default function DashboardHome({
  documents,
  products,
  services,
  company,
  onSelectDocumentForEdit,
  onDeleteDocument,
  onUpdateDocumentStatus,
  onCreateNewDocument,
}: DashboardHomeProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewingDoc, setViewingDoc] = useState<DocumentData | null>(null);

  // Stats
  const totalFaturado = documents.reduce((acc, d) => acc + (d.totalAmount || d.receivedValue || 0), 0);
  const osAbertas = documents.filter(d => d.type === 'ordem_servico' && d.status !== 'Concluído' && d.status !== 'Cancelado').length;
  const uniqueClients = new Set(documents.map(d => d.client.name.toLowerCase().trim())).size;
  const totalOrcamentos = documents.filter(d => d.type === 'orcamento').length;

  const recentDocs = [...documents].slice(0, 8);

  const filteredDocs = documents.filter(doc => {
    const matchSearch =
      doc.client.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.number.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || doc.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full opacity-5">
          <div className="w-full h-full bg-gradient-to-bl from-amber-400 rounded-full translate-x-16 -translate-y-8 scale-150"></div>
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-black tracking-tight">
            Bem-vindo ao <span className="text-amber-400">Sistema A4 PRO</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1.5 max-w-md leading-relaxed">
            Crie orçamentos, ordens de serviço, laudos técnicos e recibos profissionais. Exporte como JPG em folha A4 real.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs text-slate-400">{company.name} • {products.length} produtos, {services.length} serviços no catálogo</span>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3 shrink-0 flex-wrap">
          {[
            { type: 'orcamento' as const, label: 'Orçamento', Icon: FileText, color: 'bg-blue-600 hover:bg-blue-500' },
            { type: 'ordem_servico' as const, label: 'Ordem de Serviço', Icon: FileCheck, color: 'bg-indigo-600 hover:bg-indigo-500' },
            { type: 'laudo_tecnico' as const, label: 'Laudo Técnico', Icon: ShieldCheck, color: 'bg-emerald-600 hover:bg-emerald-500' },
            { type: 'recibo' as const, label: 'Recibo', Icon: Receipt, color: 'bg-amber-500 hover:bg-amber-400 text-slate-900' },
          ].map(({ type, label, Icon, color }) => (
            <button
              key={type}
              onClick={() => onCreateNewDocument(type)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white rounded-xl shadow-lg transition-all cursor-pointer ${color}`}
            >
              <Plus className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Volume Total Emitido',
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalFaturado),
            Icon: DollarSign,
            bg: 'bg-amber-50',
            iconBg: 'bg-amber-100 text-amber-600',
            trend: `${documents.length} doc${documents.length !== 1 ? 's' : ''}`,
          },
          {
            label: 'OS Abertas',
            value: osAbertas.toString(),
            Icon: FileCheck,
            bg: 'bg-indigo-50',
            iconBg: 'bg-indigo-100 text-indigo-600',
            trend: 'Em andamento',
          },
          {
            label: 'Clientes Atendidos',
            value: uniqueClients.toString(),
            Icon: Users,
            bg: 'bg-blue-50',
            iconBg: 'bg-blue-100 text-blue-600',
            trend: 'Únicos',
          },
          {
            label: 'Orçamentos Gerados',
            value: totalOrcamentos.toString(),
            Icon: TrendingUp,
            bg: 'bg-emerald-50',
            iconBg: 'bg-emerald-100 text-emerald-600',
            trend: 'No sistema',
          },
        ].map(({ label, value, Icon, bg, iconBg, trend }) => (
          <div key={label} className={`${bg} border border-slate-100 rounded-2xl p-5 flex items-start justify-between shadow-xs`}>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{label}</span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block font-mono">{value}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">{trend}</span>
            </div>
            <span className={`p-2.5 rounded-xl ${iconBg}`}>
              <Icon className="h-5 w-5" />
            </span>
          </div>
        ))}
      </div>

      {/* Recent Documents & Document Viewer split */}
      {viewingDoc ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Visualizando: {viewingDoc.client.name} — {viewingDoc.number}</h3>
            <button
              onClick={() => setViewingDoc(null)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              Fechar Visualização
            </button>
          </div>
          <A4Document document={viewingDoc} company={company} />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-slate-800">Todos os Documentos</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white text-slate-800 text-xs px-3 pl-8 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-300"
                  placeholder="Buscar por nome ou número..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {['all', 'orcamento', 'ordem_servico', 'laudo_tecnico', 'recibo'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                      filterType === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {type === 'all' ? 'Todos' :
                     type === 'orcamento' ? 'Orc.' :
                     type === 'ordem_servico' ? 'O.S.' :
                     type === 'laudo_tecnico' ? 'Laudos' : 'Recibos'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 text-center">
              <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-500">Nenhum documento encontrado</h3>
              <p className="text-xs text-slate-400 mt-1">Crie um novo documento usando os botões acima.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tipo / Número</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Cliente</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase tracking-wider text-[10px] hidden md:table-cell">Data</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase tracking-wider text-[10px] hidden lg:table-cell">Status</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Valor</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredDocs.map(doc => {
                    const cfg = typeConfig[doc.type];
                    const Icon = cfg.Icon;
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold ${cfg.color}`}>
                            <Icon className="h-3 w-3" />
                            {cfg.label.split(' ')[0]}
                          </span>
                          <p className="font-mono text-[11px] text-slate-500 mt-0.5">#{doc.number}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800 truncate max-w-[160px]">{doc.client.name}</p>
                          <p className="text-slate-400 text-[11px] truncate max-w-[160px]">{doc.client.phone || doc.client.email || '—'}</p>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(doc.date)}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          {doc.status ? (
                            <div className="relative group/status">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${statusConfig[doc.status]?.color || 'bg-slate-100 text-slate-500'}`}>
                                {doc.status}
                              </span>
                              {/* Quick status changer for OS */}
                              {doc.type === 'ordem_servico' && (
                                <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-1 hidden group-hover/status:block w-40">
                                  {(['Pendente', 'Em Andamento', 'Aprovado', 'Concluído', 'Cancelado'] as const).map(s => (
                                    <button
                                      key={s}
                                      onClick={() => onUpdateDocumentStatus(doc.id, s)}
                                      className={`w-full text-left px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                                        doc.status === s ? statusConfig[s].color : 'hover:bg-slate-50 text-slate-600'
                                      }`}
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-bold text-slate-800">
                            {formatCurrency(doc.totalAmount || doc.receivedValue || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setViewingDoc(doc)}
                              className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Visualizar folha A4"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onSelectDocumentForEdit(doc)}
                              className="p-1.5 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Editar documento"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteDocument(doc.id)}
                              className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Excluir documento"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
