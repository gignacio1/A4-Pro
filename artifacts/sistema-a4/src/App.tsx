import { useState, useEffect } from 'react';
import { Product, Service, CompanySettings, DocumentData } from './types';
import { 
  defaultCompany, 
  initialProducts, 
  initialServices, 
  sampleDocuments 
} from './utils/helpers';
import ClientManager, { SavedClient } from './components/ClientManager';
import A4Document from './components/A4Document';
import ProductServiceManager from './components/ProductServiceManager';
import DocumentGenerator from './components/DocumentGenerator';
import DocumentHistory from './components/DocumentHistory';
import CompanySettingsForm from './components/CompanySettingsForm';
import DashboardHome from './components/DashboardHome';
import { 
  FileText, 
  Settings, 
  Briefcase, 
  History, 
  Layers, 
  Printer, 
  BadgeDollarSign, 
  Package,
  Users,
  LayoutGrid
} from 'lucide-react';

type Tab = 'inicio' | 'gerar' | 'produtos' | 'clientes' | 'historico' | 'empresa';

const initialClients: SavedClient[] = [
  {
    id: 'cli-1',
    name: 'Carlos Alberto Silva',
    document: '123.456.789-00',
    phone: '(11) 99999-8888',
    email: 'carlos.alberto@email.com',
    address: 'Rua das Flores, 123 - Jardim Primavera, São Paulo - SP',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cli-2',
    name: 'Mariana Costa Oliveira',
    document: '987.654.321-11',
    phone: '(11) 98888-7777',
    email: 'mariana.costa@email.com',
    address: 'Alameda Santos, 456 - Cerqueira César, São Paulo - SP',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cli-3',
    name: 'Imobiliária Prime LTDA',
    document: '22.333.444/0001-55',
    phone: '(11) 3333-4444',
    email: 'financeiro@primeimobiliaria.com',
    address: 'Rua Bela Cintra, 800 - Consolação, São Paulo - SP',
    createdAt: new Date().toISOString(),
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [company, setCompany] = useState<CompanySettings>(defaultCompany);
  const [clients, setClients] = useState<SavedClient[]>([]);

  const [previewDocument, setPreviewDocument] = useState<DocumentData | null>(null);

  useEffect(() => {
    const savedProducts = localStorage.getItem('sa4_products');
    const savedServices = localStorage.getItem('sa4_services');
    const savedDocs = localStorage.getItem('sa4_documents');
    const savedCompany = localStorage.getItem('sa4_company');
    const savedClients = localStorage.getItem('sa4_clients');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(initialProducts);
      localStorage.setItem('sa4_products', JSON.stringify(initialProducts));
    }

    if (savedServices) {
      setServices(JSON.parse(savedServices));
    } else {
      setServices(initialServices);
      localStorage.setItem('sa4_services', JSON.stringify(initialServices));
    }

    if (savedDocs) {
      const parsedDocs = JSON.parse(savedDocs);
      setDocuments(parsedDocs);
      if (parsedDocs.length > 0) setPreviewDocument(parsedDocs[0]);
    } else {
      setDocuments(sampleDocuments);
      localStorage.setItem('sa4_documents', JSON.stringify(sampleDocuments));
      setPreviewDocument(sampleDocuments[0]);
    }

    if (savedCompany) {
      setCompany(JSON.parse(savedCompany));
    } else {
      setCompany(defaultCompany);
      localStorage.setItem('sa4_company', JSON.stringify(defaultCompany));
    }

    if (savedClients) {
      setClients(JSON.parse(savedClients));
    } else {
      setClients(initialClients);
      localStorage.setItem('sa4_clients', JSON.stringify(initialClients));
    }
  }, []);

  // Products
  const handleSaveProduct = (prod: Product) => {
    const updated = [...products, prod];
    setProducts(updated);
    localStorage.setItem('sa4_products', JSON.stringify(updated));
  };
  const handleEditProduct = (prod: Product) => {
    const updated = products.map(p => p.id === prod.id ? prod : p);
    setProducts(updated);
    localStorage.setItem('sa4_products', JSON.stringify(updated));
  };
  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto do catálogo?')) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      localStorage.setItem('sa4_products', JSON.stringify(updated));
    }
  };

  // Services
  const handleSaveService = (serv: Service) => {
    const updated = [...services, serv];
    setServices(updated);
    localStorage.setItem('sa4_services', JSON.stringify(updated));
  };
  const handleEditService = (serv: Service) => {
    const updated = services.map(s => s.id === serv.id ? serv : s);
    setServices(updated);
    localStorage.setItem('sa4_services', JSON.stringify(updated));
  };
  const handleDeleteService = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço do catálogo?')) {
      const updated = services.filter(s => s.id !== id);
      setServices(updated);
      localStorage.setItem('sa4_services', JSON.stringify(updated));
    }
  };

  // Clients
  const handleAddClient = (c: SavedClient) => {
    const updated = [...clients, c];
    setClients(updated);
    localStorage.setItem('sa4_clients', JSON.stringify(updated));
  };
  const handleEditClient = (c: SavedClient) => {
    const updated = clients.map(x => x.id === c.id ? c : x);
    setClients(updated);
    localStorage.setItem('sa4_clients', JSON.stringify(updated));
  };
  const handleDeleteClient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      const updated = clients.filter(c => c.id !== id);
      setClients(updated);
      localStorage.setItem('sa4_clients', JSON.stringify(updated));
    }
  };

  // Company
  const handleSaveCompany = (comp: CompanySettings) => {
    setCompany(comp);
    localStorage.setItem('sa4_company', JSON.stringify(comp));
  };

  // Documents
  const handleSaveDocument = (doc: DocumentData) => {
    const exists = documents.some(d => d.id === doc.id);
    const updatedDocs = exists
      ? documents.map(d => d.id === doc.id ? doc : d)
      : [doc, ...documents];
    setDocuments(updatedDocs);
    localStorage.setItem('sa4_documents', JSON.stringify(updatedDocs));
    setPreviewDocument(doc);
    alert('Documento salvo e pronto para visualização na folha A4!');
  };
  const handleDeleteDocument = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este documento do histórico?')) {
      const updated = documents.filter(d => d.id !== id);
      setDocuments(updated);
      localStorage.setItem('sa4_documents', JSON.stringify(updated));
      if (previewDocument?.id === id) setPreviewDocument(updated.length > 0 ? updated[0] : null);
    }
  };
  const handleLoadDocumentForEdit = (doc: DocumentData) => {
    setPreviewDocument(doc);
    setActiveTab('gerar');
  };
  const handleImportBackup = (backup: DocumentData[]) => {
    setDocuments(backup);
    localStorage.setItem('sa4_documents', JSON.stringify(backup));
    if (backup.length > 0) setPreviewDocument(backup[0]);
  };
  const handleResetToDefaults = () => {
    if (confirm('Isso redefinirá todos os produtos e serviços para o catálogo de exemplo. Deseja continuar?')) {
      setProducts(initialProducts);
      setServices(initialServices);
      localStorage.setItem('sa4_products', JSON.stringify(initialProducts));
      localStorage.setItem('sa4_services', JSON.stringify(initialServices));
    }
  };
  const handleUpdateDocumentStatus = (id: string, status: 'Pendente' | 'Em Andamento' | 'Aprovado' | 'Concluído' | 'Cancelado') => {
    const updated = documents.map(d => d.id === id ? { ...d, status } : d);
    setDocuments(updated);
    localStorage.setItem('sa4_documents', JSON.stringify(updated));
    if (previewDocument?.id === id) setPreviewDocument({ ...previewDocument, status });
  };
  const handleCreateNewDocument = (type: 'orcamento' | 'ordem_servico' | 'laudo_tecnico' | 'recibo') => {
    const draft: DocumentData = {
      id: '',
      type,
      number: 'DOC-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000)),
      date: new Date().toISOString().split('T')[0],
      client: { name: '', document: '', phone: '', email: '', address: '' },
      items: [],
      totalAmount: 0,
      status: type === 'ordem_servico' ? 'Pendente' : undefined,
    };
    setPreviewDocument(draft);
    setActiveTab('gerar');
  };

  const totalInvoiced = documents.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  const navItems: { id: Tab; label: string; Icon: React.ElementType; badge?: number }[] = [
    { id: 'inicio',    label: 'Início',          Icon: LayoutGrid },
    { id: 'gerar',     label: 'Ficha de Serviço', Icon: Printer },
    { id: 'produtos',  label: 'Itens',            Icon: Layers },
    { id: 'clientes',  label: 'Clientes',          Icon: Users, badge: clients.length },
    { id: 'historico', label: 'Histórico',         Icon: History, badge: documents.length },
    { id: 'empresa',   label: 'Empresa',           Icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans" id="app-root">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 md:h-11 md:w-11 bg-amber-400 text-slate-900 rounded-xl flex items-center justify-center font-black text-xl md:text-2xl tracking-wide shadow-sm shrink-0">
                A4
              </span>
              <div>
                <h1 className="text-sm md:text-base font-bold tracking-tight text-white leading-tight">Sistema A4 PRO</h1>
                <p className="text-[9px] md:text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Orçamentos & Serviços</p>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl">
              {navItems.map(({ id, label, Icon, badge }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === id
                      ? 'bg-amber-400 text-slate-900 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  {badge !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === id ? 'bg-slate-900/20' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Mobile settings shortcut */}
            <div className="flex md:hidden">
              <button
                onClick={() => setActiveTab('empresa')}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'empresa' ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-300'
                }`}
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mobile sub-nav */}
          <div className="md:hidden border-t border-slate-800 py-2">
            <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {navItems.map(({ id, label, Icon, badge }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl shrink-0 cursor-pointer ${
                    activeTab === id
                      ? 'bg-amber-400 text-slate-900 shadow-sm'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {badge !== undefined && <span className="text-[10px]">{badge}</span>}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Metric bar (hidden on home) */}
        {activeTab !== 'inicio' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 no-print">
            {[
              { label: 'Documentos', value: documents.length, Icon: FileText, color: 'bg-blue-50 text-blue-600' },
              { label: 'Volume Emitido', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalInvoiced), Icon: BadgeDollarSign, color: 'bg-amber-50 text-amber-600' },
              { label: 'Clientes', value: clients.length, Icon: Users, color: 'bg-indigo-50 text-indigo-600' },
              { label: 'Produtos', value: products.length, Icon: Package, color: 'bg-emerald-50 text-emerald-600' },
            ].map(({ label, value, Icon, color }) => (
              <div key={label} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{label}</span>
                  <span className="text-xl font-extrabold text-slate-800 mt-1 block font-mono">{value}</span>
                </div>
                <span className={`p-2.5 rounded-xl ${color} bg-opacity-60`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Panels */}
        <div className="space-y-8">

          {activeTab === 'inicio' && (
            <DashboardHome
              documents={documents}
              products={products}
              services={services}
              company={company}
              onSelectDocumentForEdit={handleLoadDocumentForEdit}
              onDeleteDocument={handleDeleteDocument}
              onUpdateDocumentStatus={handleUpdateDocumentStatus}
              onCreateNewDocument={handleCreateNewDocument}
            />
          )}

          {activeTab === 'gerar' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 no-print">
                <DocumentGenerator
                  products={products}
                  services={services}
                  savedClients={clients}
                  onSaveDocument={handleSaveDocument}
                  activeDocument={previewDocument}
                  onSelectDocument={setPreviewDocument}
                />
              </div>
              <div className="lg:col-span-7 flex justify-center">
                {previewDocument ? (
                  <A4Document document={previewDocument} company={company} />
                ) : (
                  <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-200 w-full flex flex-col items-center justify-center min-h-[500px]">
                    <Printer className="h-10 w-10 text-slate-300 mb-3 animate-pulse" />
                    <h3 className="font-semibold text-slate-700 text-base">Pronto para gerar</h3>
                    <p className="text-slate-400 text-xs mt-1 max-w-xs leading-relaxed">
                      Preencha o formulário e clique em "Ver Prévia" para carregar a simulação da folha A4.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'produtos' && (
            <div className="no-print">
              <ProductServiceManager
                products={products}
                services={services}
                onAddProduct={handleSaveProduct}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddService={handleSaveService}
                onEditService={handleEditService}
                onDeleteService={handleDeleteService}
                onResetToDefaults={handleResetToDefaults}
              />
            </div>
          )}

          {activeTab === 'clientes' && (
            <div className="no-print">
              <ClientManager
                clients={clients}
                onAddClient={handleAddClient}
                onEditClient={handleEditClient}
                onDeleteClient={handleDeleteClient}
              />
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="no-print">
              <DocumentHistory
                documents={documents}
                onSelectDocument={handleLoadDocumentForEdit}
                onEditDocument={handleLoadDocumentForEdit}
                onDeleteDocument={handleDeleteDocument}
                onImportBackup={handleImportBackup}
              />
            </div>
          )}

          {activeTab === 'empresa' && (
            <div className="no-print">
              <CompanySettingsForm company={company} onSaveCompany={handleSaveCompany} />
            </div>
          )}

        </div>
      </main>

      <footer className="mt-20 py-8 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-500 no-print">
        <p className="font-semibold tracking-wide text-slate-400">Sistema A4 PRO - Soluções Corporativas Inteligentes</p>
        <p className="mt-1">Crie Orçamentos, Ordens de Serviço, Laudos Técnicos e Recibos em tamanho A4 real.</p>
        <p className="mt-4 text-[10px] text-slate-600">© 2026 {company.name}. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
