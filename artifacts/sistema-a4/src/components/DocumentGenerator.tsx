import { useState, useEffect, useRef } from 'react';
import { Product, Service, DocumentData, DocumentItem, DocumentType } from '../types';
import { formatCurrency, generateUUID } from '../utils/helpers';
import { SavedClient } from './ClientManager';
import {
  Plus, Trash2, Search, FileText, FileCheck, ShieldCheck, Receipt,
  Save, Users, X, ChevronDown, ChevronUp, Package, Wrench
} from 'lucide-react';

interface DocumentGeneratorProps {
  products: Product[];
  services: Service[];
  savedClients: SavedClient[];
  onSaveDocument: (doc: DocumentData) => void;
  activeDocument: DocumentData | null;
  onSelectDocument: (doc: DocumentData | null) => void;
  onCreateProduct: (data: { name: string; description: string; price: number; unit: string }) => void;
  onCreateService: (data: { name: string; description: string; price: number; category?: string }) => void;
}

const emptyClient = { name: '', document: '', phone: '', email: '', address: '' };

const UNITS = ['Unidade', 'Metro', 'Metro²', 'Metro³', 'Quilo', 'Grama', 'Litro', 'Hora', 'Peça', 'Par'];

export default function DocumentGenerator({
  products,
  services,
  savedClients,
  onSaveDocument,
  activeDocument,
  onSelectDocument,
  onCreateProduct,
  onCreateService,
}: DocumentGeneratorProps) {
  const [docType, setDocType] = useState<DocumentType>('orcamento');
  const [number, setNumber] = useState('2026-0001');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [client, setClient] = useState(emptyClient);
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [observations, setObservations] = useState('');

  // OS-specific
  const [status, setStatus] = useState<'Pendente' | 'Em Andamento' | 'Aprovado' | 'Concluído' | 'Cancelado'>('Pendente');
  const [equipment, setEquipment] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [defect, setDefect] = useState('');
  const [solution, setSolution] = useState('');

  // Laudo-specific
  const [technicalAnalysis, setTechnicalAnalysis] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [responsavelTecnico, setResponsavelTecnico] = useState('');
  const [registroProfissional, setRegistroProfissional] = useState('');

  // Recibo-specific
  const [receivedValue, setReceivedValue] = useState(0);
  const [referringTo, setReferringTo] = useState('');
  const [issuerName, setIssuerName] = useState('');
  const [issuerDocument, setIssuerDocument] = useState('');

  // Client section: collapsed on mobile by default
  const [clientSectionOpen, setClientSectionOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const clientSearchRef = useRef<HTMLDivElement>(null);

  // Product search
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const productSearchRef = useRef<HTMLDivElement>(null);

  // Service search
  const [serviceSearch, setServiceSearch] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const serviceSearchRef = useRef<HTMLDivElement>(null);

  // Inline creation forms
  const [newProductForm, setNewProductForm] = useState<{ name: string; price: string; unit: string; description: string } | null>(null);
  const [newServiceForm, setNewServiceForm] = useState<{ name: string; price: string; category: string; description: string } | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (clientSearchRef.current && !clientSearchRef.current.contains(e.target as Node)) {
        setShowClientDropdown(false);
      }
      if (productSearchRef.current && !productSearchRef.current.contains(e.target as Node)) {
        setShowProductDropdown(false);
      }
      if (serviceSearchRef.current && !serviceSearchRef.current.contains(e.target as Node)) {
        setShowServiceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Load active document into form
  useEffect(() => {
    if (activeDocument) {
      setDocType(activeDocument.type);
      setNumber(activeDocument.number);
      setDate(activeDocument.date);
      setDueDate(activeDocument.dueDate || '');
      setClient(activeDocument.client || emptyClient);
      setItems(activeDocument.items || []);
      setDiscount(activeDocument.discount || 0);
      setObservations(activeDocument.observations || '');
      setStatus(activeDocument.status || 'Pendente');
      setEquipment(activeDocument.equipment || '');
      setSerialNumber(activeDocument.serialNumber || '');
      setDefect(activeDocument.defect || '');
      setSolution(activeDocument.solution || '');
      setTechnicalAnalysis(activeDocument.technicalAnalysis || '');
      setConclusion(activeDocument.conclusion || '');
      setResponsavelTecnico(activeDocument.responsavelTecnico || '');
      setRegistroProfissional(activeDocument.registroProfissional || '');
      setReceivedValue(activeDocument.receivedValue || activeDocument.totalAmount || 0);
      setReferringTo(activeDocument.referringTo || '');
      setIssuerName(activeDocument.issuerName || '');
      setIssuerDocument(activeDocument.issuerDocument || '');
      // Auto-open client section when editing a doc that has a client
      if (activeDocument.client?.name) setClientSectionOpen(true);
    }
  }, [activeDocument?.id]);

  const totalAmount = items.reduce((acc, item) => acc + item.total, 0) - (discount || 0);

  const handleAddCatalogItem = (item: Product | Service, type: 'produto' | 'servico') => {
    const unit = type === 'produto' ? (item as Product).unit : undefined;
    const newItem: DocumentItem = {
      id: generateUUID(),
      name: item.name,
      type,
      unit,
      quantity: 1,
      price: item.price,
      total: item.price,
    };
    setItems(prev => [...prev, newItem]);
    setProductSearch('');
    setServiceSearch('');
  };

  const handleUpdateItem = (id: string, field: keyof DocumentItem, value: string | number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          updated.total = Number(updated.quantity) * Number(updated.price);
        }
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSelectSavedClient = (c: SavedClient) => {
    setClient({ name: c.name, document: c.document, phone: c.phone, email: c.email, address: c.address });
    setClientSearch('');
    setShowClientDropdown(false);
    setClientSectionOpen(true);
  };

  const handleCreateAndAddProduct = () => {
    if (!newProductForm || !newProductForm.name.trim()) return;
    const price = parseFloat(newProductForm.price) || 0;
    const unit = newProductForm.unit || 'Unidade';
    onCreateProduct({ name: newProductForm.name.trim(), description: newProductForm.description, price, unit });
    const newItem: DocumentItem = {
      id: generateUUID(),
      name: newProductForm.name.trim(),
      type: 'produto',
      unit,
      quantity: 1,
      price,
      total: price,
    };
    setItems(prev => [...prev, newItem]);
    setNewProductForm(null);
    setProductSearch('');
  };

  const handleCreateAndAddService = () => {
    if (!newServiceForm || !newServiceForm.name.trim()) return;
    const price = parseFloat(newServiceForm.price) || 0;
    onCreateService({ name: newServiceForm.name.trim(), description: newServiceForm.description, price, category: newServiceForm.category || undefined });
    const newItem: DocumentItem = {
      id: generateUUID(),
      name: newServiceForm.name.trim(),
      type: 'servico',
      quantity: 1,
      price,
      total: price,
    };
    setItems(prev => [...prev, newItem]);
    setNewServiceForm(null);
    setServiceSearch('');
  };

  const buildDoc = (): DocumentData => ({
    id: activeDocument?.id || generateUUID(),
    type: docType,
    number,
    date,
    dueDate: dueDate || undefined,
    client,
    items,
    totalAmount,
    discount: discount || undefined,
    observations: observations || undefined,
    status: docType === 'ordem_servico' ? status : undefined,
    equipment: equipment || undefined,
    serialNumber: serialNumber || undefined,
    defect: defect || undefined,
    solution: solution || undefined,
    technicalAnalysis: technicalAnalysis || undefined,
    conclusion: conclusion || undefined,
    responsavelTecnico: responsavelTecnico || undefined,
    registroProfissional: registroProfissional || undefined,
    receivedValue: docType === 'recibo' ? receivedValue : undefined,
    referringTo: referringTo || undefined,
    issuerName: issuerName || undefined,
    issuerDocument: issuerDocument || undefined,
  });

  const buildAndPreview = () => onSelectDocument(buildDoc());
  const handleSave = () => onSaveDocument(buildDoc());

  const filteredProducts = productSearch
    ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
    : [];

  const filteredServices = serviceSearch
    ? services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()))
    : [];

  const filteredClients = clientSearch
    ? savedClients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.document.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.phone.toLowerCase().includes(clientSearch.toLowerCase())
      )
    : savedClients.slice(0, 6);

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-white text-slate-800 text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-300 transition-shadow';
  const labelClass = 'block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1';

  return (
    <div className="space-y-5">
      {/* Doc Type */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tipo de Documento</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'orcamento',     label: 'Orçamento',        Icon: FileText,   activeClass: 'bg-blue-50 border-blue-500 text-blue-700' },
            { id: 'ordem_servico', label: 'Ordem de Serviço', Icon: FileCheck,  activeClass: 'bg-indigo-50 border-indigo-500 text-indigo-700' },
            { id: 'laudo_tecnico', label: 'Laudo Técnico',    Icon: ShieldCheck,activeClass: 'bg-emerald-50 border-emerald-500 text-emerald-700' },
            { id: 'recibo',        label: 'Recibo',           Icon: Receipt,    activeClass: 'bg-amber-50 border-amber-500 text-amber-700' },
          ].map(({ id, label, Icon, activeClass }) => (
            <button
              key={id}
              onClick={() => setDocType(id as DocumentType)}
              className={`inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                docType === id ? activeClass : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Document Meta */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Dados do Documento</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Número</label>
            <input className={inputClass} value={number} onChange={e => setNumber(e.target.value)} placeholder="2026-0001" />
          </div>
          <div>
            <label className={labelClass}>Data de Emissão</label>
            <input type="date" className={inputClass} value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        {docType === 'orcamento' && (
          <div>
            <label className={labelClass}>Validade do Orçamento</label>
            <input type="date" className={inputClass} value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
        )}
        {docType === 'ordem_servico' && (
          <div>
            <label className={labelClass}>Status da OS</label>
            <select className={inputClass} value={status} onChange={e => setStatus(e.target.value as typeof status)}>
              <option>Pendente</option>
              <option>Em Andamento</option>
              <option>Aprovado</option>
              <option>Concluído</option>
              <option>Cancelado</option>
            </select>
          </div>
        )}
      </div>

      {/* Client Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        {/* Header — tap to expand on mobile */}
        <button
          className="w-full flex items-center justify-between border-b border-slate-100 pb-2 cursor-pointer md:cursor-default"
          onClick={() => setClientSectionOpen(o => !o)}
        >
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dados do Cliente</h3>
            {/* Mobile: show client name when collapsed */}
            {!clientSectionOpen && client.name && (
              <span className="md:hidden text-xs font-semibold text-slate-700 truncate max-w-[140px]">{client.name}</span>
            )}
            {!clientSectionOpen && !client.name && (
              <span className="md:hidden text-xs text-slate-300">Toque para preencher</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {client.name && (
              <button
                onClick={e => { e.stopPropagation(); setClient(emptyClient); }}
                className="text-[10px] text-slate-400 hover:text-red-500 flex items-center gap-1 cursor-pointer"
              >
                <X className="h-3 w-3" /> Limpar
              </button>
            )}
            {/* Chevron icon — mobile only */}
            <span className="md:hidden text-slate-400">
              {clientSectionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          </div>
        </button>

        {/* Collapsible content: always visible on md+, toggled on mobile */}
        <div className={`${clientSectionOpen ? 'block' : 'hidden'} md:block space-y-3`}>
          {/* Saved client search */}
          {savedClients.length > 0 && (
            <div ref={clientSearchRef} className="relative">
              <label className={labelClass}>Buscar Cliente Cadastrado</label>
              <div className="relative">
                <Users className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  className={`${inputClass} pl-8`}
                  value={clientSearch}
                  onChange={e => { setClientSearch(e.target.value); setShowClientDropdown(true); }}
                  onFocus={() => setShowClientDropdown(true)}
                  placeholder="Buscar pelo nome, CPF/CNPJ ou telefone..."
                />
              </div>
              {showClientDropdown && filteredClients.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                  {filteredClients.map(c => (
                    <button
                      key={c.id}
                      onMouseDown={() => handleSelectSavedClient(c)}
                      className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-amber-50 transition-colors text-left cursor-pointer border-b border-slate-50 last:border-0"
                    >
                      <span className="h-7 w-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{c.name}</p>
                        <p className="text-[10px] text-slate-400">{c.document || c.phone || c.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Client fields */}
          <div>
            <label className={labelClass}>Nome / Razão Social *</label>
            <input className={inputClass} value={client.name} onChange={e => setClient({ ...client, name: e.target.value })} placeholder="Nome completo ou razão social" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>CPF / CNPJ</label>
              <input className={inputClass} value={client.document} onChange={e => setClient({ ...client, document: e.target.value })} placeholder="000.000.000-00" />
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input className={inputClass} value={client.phone} onChange={e => setClient({ ...client, phone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <input className={inputClass} type="email" value={client.email} onChange={e => setClient({ ...client, email: e.target.value })} placeholder="cliente@email.com" />
          </div>
          <div>
            <label className={labelClass}>Endereço Completo</label>
            <input className={inputClass} value={client.address} onChange={e => setClient({ ...client, address: e.target.value })} placeholder="Rua, número, bairro, cidade - UF" />
          </div>
        </div>
      </div>

      {/* Equipment */}
      {(docType === 'ordem_servico' || docType === 'laudo_tecnico') && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Informações do Equipamento</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Equipamento / Objeto</label>
              <input className={inputClass} value={equipment} onChange={e => setEquipment(e.target.value)} placeholder="Ex: Notebook Dell Inspiron 15" />
            </div>
            <div>
              <label className={labelClass}>Nº de Série</label>
              <input className={inputClass} value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="SN-12345" />
            </div>
          </div>
          {docType === 'ordem_servico' && (
            <>
              <div>
                <label className={labelClass}>Problema / Sintoma Relatado</label>
                <textarea className={`${inputClass} min-h-[60px] resize-y`} value={defect} onChange={e => setDefect(e.target.value)} placeholder="Descreva o defeito ou sintoma..." />
              </div>
              <div>
                <label className={labelClass}>Solução Executada / Diagnóstico</label>
                <textarea className={`${inputClass} min-h-[60px] resize-y`} value={solution} onChange={e => setSolution(e.target.value)} placeholder="Descreva o que foi feito..." />
              </div>
            </>
          )}
          {docType === 'laudo_tecnico' && (
            <>
              <div>
                <label className={labelClass}>Constatações / Análise Técnica</label>
                <textarea className={`${inputClass} min-h-[80px] resize-y`} value={technicalAnalysis} onChange={e => setTechnicalAnalysis(e.target.value)} placeholder="Detalhe todas as constatações da análise..." />
              </div>
              <div>
                <label className={labelClass}>Conclusão & Recomendações</label>
                <textarea className={`${inputClass} min-h-[60px] resize-y`} value={conclusion} onChange={e => setConclusion(e.target.value)} placeholder="Conclusão e recomendações finais..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Responsável Técnico</label>
                  <input className={inputClass} value={responsavelTecnico} onChange={e => setResponsavelTecnico(e.target.value)} placeholder="Nome do profissional" />
                </div>
                <div>
                  <label className={labelClass}>Registro Profissional</label>
                  <input className={inputClass} value={registroProfissional} onChange={e => setRegistroProfissional(e.target.value)} placeholder="CREA, CFT, CRM..." />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Recibo */}
      {docType === 'recibo' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Dados do Recibo</h3>
          <div>
            <label className={labelClass}>Valor Recebido (R$)</label>
            <input className={inputClass} type="number" step="0.01" min="0" value={receivedValue} onChange={e => setReceivedValue(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className={labelClass}>Referente a</label>
            <textarea className={`${inputClass} min-h-[60px] resize-y`} value={referringTo} onChange={e => setReferringTo(e.target.value)} placeholder="Descreva o produto ou serviço..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nome do Emitente</label>
              <input className={inputClass} value={issuerName} onChange={e => setIssuerName(e.target.value)} placeholder="Sua empresa ou nome" />
            </div>
            <div>
              <label className={labelClass}>CNPJ / CPF do Emitente</label>
              <input className={inputClass} value={issuerDocument} onChange={e => setIssuerDocument(e.target.value)} placeholder="00.000.000/0001-00" />
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      {(docType === 'orcamento' || docType === 'ordem_servico') && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
            Itens do Documento ({items.length})
          </h3>

          {/* ── SERVIÇOS ── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Wrench className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Serviços</span>
            </div>

            <div ref={serviceSearchRef} className="relative">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  className={`${inputClass} pl-8`}
                  value={serviceSearch}
                  onChange={e => { setServiceSearch(e.target.value); setShowServiceDropdown(true); setNewServiceForm(null); }}
                  onFocus={() => setShowServiceDropdown(true)}
                  placeholder="Buscar serviço no catálogo..."
                />
              </div>

              {/* Service dropdown results */}
              {showServiceDropdown && serviceSearch && filteredServices.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {filteredServices.map(item => (
                    <button
                      key={item.id}
                      onMouseDown={() => { handleAddCatalogItem(item, 'servico'); setShowServiceDropdown(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-indigo-50 transition-colors text-xs border-b border-slate-50 last:border-0 cursor-pointer"
                    >
                      <div className="text-left">
                        <span className="font-medium text-slate-800 block">{item.name}</span>
                        {item.category && <span className="text-[10px] text-slate-400">{item.category}</span>}
                      </div>
                      <span className="font-mono font-bold text-slate-700">{formatCurrency(item.price)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* No results → offer creation */}
            {serviceSearch && filteredServices.length === 0 && !newServiceForm && (
              <button
                onClick={() => setNewServiceForm({ name: serviceSearch, price: '', category: '', description: '' })}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-indigo-300 text-xs text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Criar serviço "{serviceSearch}" no catálogo e adicionar
              </button>
            )}

            {/* Inline service creation form */}
            {newServiceForm && (
              <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl p-3 space-y-2">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Novo Serviço</p>
                <input
                  className={inputClass}
                  placeholder="Nome do serviço *"
                  value={newServiceForm.name}
                  onChange={e => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className={inputClass}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Preço (R$)"
                    value={newServiceForm.price}
                    onChange={e => setNewServiceForm({ ...newServiceForm, price: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    placeholder="Categoria (ex: Elétrica)"
                    value={newServiceForm.category}
                    onChange={e => setNewServiceForm({ ...newServiceForm, category: e.target.value })}
                  />
                </div>
                <input
                  className={inputClass}
                  placeholder="Descrição (opcional)"
                  value={newServiceForm.description}
                  onChange={e => setNewServiceForm({ ...newServiceForm, description: e.target.value })}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateAndAddService}
                    className="flex-1 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Criar e Adicionar
                  </button>
                  <button
                    onClick={() => { setNewServiceForm(null); setServiceSearch(''); }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── PRODUTOS ── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Produtos</span>
            </div>

            <div ref={productSearchRef} className="relative">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  className={`${inputClass} pl-8`}
                  value={productSearch}
                  onChange={e => { setProductSearch(e.target.value); setShowProductDropdown(true); setNewProductForm(null); }}
                  onFocus={() => setShowProductDropdown(true)}
                  placeholder="Buscar produto no catálogo..."
                />
              </div>

              {/* Product dropdown results */}
              {showProductDropdown && productSearch && filteredProducts.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {filteredProducts.map(item => (
                    <button
                      key={item.id}
                      onMouseDown={() => { handleAddCatalogItem(item, 'produto'); setShowProductDropdown(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-blue-50 transition-colors text-xs border-b border-slate-50 last:border-0 cursor-pointer"
                    >
                      <div className="text-left">
                        <span className="font-medium text-slate-800 block">{item.name}</span>
                        <span className="text-[10px] text-slate-400">{item.unit}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-700">{formatCurrency(item.price)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* No results → offer creation */}
            {productSearch && filteredProducts.length === 0 && !newProductForm && (
              <button
                onClick={() => setNewProductForm({ name: productSearch, price: '', unit: 'Unidade', description: '' })}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-blue-300 text-xs text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Criar produto "{productSearch}" no catálogo e adicionar
              </button>
            )}

            {/* Inline product creation form */}
            {newProductForm && (
              <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-3 space-y-2">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Novo Produto</p>
                <input
                  className={inputClass}
                  placeholder="Nome do produto *"
                  value={newProductForm.name}
                  onChange={e => setNewProductForm({ ...newProductForm, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className={inputClass}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Preço (R$)"
                    value={newProductForm.price}
                    onChange={e => setNewProductForm({ ...newProductForm, price: e.target.value })}
                  />
                  <select
                    className={inputClass}
                    value={newProductForm.unit}
                    onChange={e => setNewProductForm({ ...newProductForm, unit: e.target.value })}
                  >
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <input
                  className={inputClass}
                  placeholder="Descrição (opcional)"
                  value={newProductForm.description}
                  onChange={e => setNewProductForm({ ...newProductForm, description: e.target.value })}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateAndAddProduct}
                    className="flex-1 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Criar e Adicionar
                  </button>
                  <button
                    onClick={() => { setNewProductForm(null); setProductSearch(''); }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Added items list ── */}
          {items.length > 0 ? (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5 border-t border-slate-100 pt-3">
              {items.map(item => (
                <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex gap-2 items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{item.name}</p>
                    <span className={`text-[10px] font-bold uppercase ${item.type === 'produto' ? 'text-blue-500' : 'text-indigo-500'}`}>
                      {item.type}{item.unit ? ` · ${item.unit}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div>
                      <label className="text-[9px] text-slate-400 block text-center">{item.unit || 'Qtd'}</label>
                      <input
                        type="number" min="0.01" step="0.01"
                        value={item.quantity}
                        onChange={e => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                        className="w-14 rounded-lg border border-slate-200 text-xs text-center px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block text-center">R$ Unit.</label>
                      <input
                        type="number" step="0.01" min="0"
                        value={item.price}
                        onChange={e => handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        className="w-24 rounded-lg border border-slate-200 text-xs text-center px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block text-center">Total</label>
                      <span className="block w-24 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-center px-2 py-1.5 font-bold text-emerald-700 font-mono">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                    <button onClick={() => handleRemoveItem(item.id)} className="mt-4 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl">
              <Plus className="h-7 w-7 text-slate-200 mx-auto mb-1.5" />
              <p className="text-xs text-slate-400">Busque produtos ou serviços acima para adicionar.</p>
            </div>
          )}

          {items.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className={labelClass}>Desconto (R$)</label>
                <input className={inputClass} type="number" step="0.01" min="0" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} placeholder="0,00" />
              </div>
              <div className="flex flex-col justify-end">
                <label className={labelClass}>Valor Final</label>
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm font-extrabold text-amber-700 font-mono text-right">
                  {formatCurrency(totalAmount)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Observations */}
      {docType !== 'recibo' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Observações / Termos</h3>
          <textarea className={`${inputClass} min-h-[80px] resize-y`} value={observations} onChange={e => setObservations(e.target.value)} placeholder="Condições de pagamento, garantia, validade..." />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 pb-8">
        <button onClick={buildAndPreview} className="w-full py-3 rounded-2xl font-bold text-sm text-slate-900 bg-amber-400 hover:bg-amber-300 transition-all shadow-md cursor-pointer">
          Ver Prévia na Folha A4 →
        </button>
        <button onClick={handleSave} className="w-full py-3 rounded-2xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer">
          <Save className="h-4 w-4" />
          Salvar no Histórico
        </button>
      </div>
    </div>
  );
}
