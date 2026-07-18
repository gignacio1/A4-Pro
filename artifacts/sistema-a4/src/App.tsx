import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Product, Service, CompanySettings, DocumentData } from './types';

const defaultCompany: CompanySettings = {
  name: '', cnpj: '', phone: '', email: '', address: '',
  website: undefined, logoText: undefined,
  signature: undefined, useSignature: false,
};
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
  History, 
  Layers, 
  Printer, 
  BadgeDollarSign, 
  Package,
  Users,
  LayoutGrid
} from 'lucide-react';

import {
  useListDocuments, getListDocumentsQueryKey,
  useCreateDocument, useUpdateDocument, useDeleteDocument,
  useListClients, getListClientsQueryKey,
  useCreateClient, useUpdateClient, useDeleteClient,
  useListProducts, getListProductsQueryKey,
  useCreateProduct, useUpdateProduct, useDeleteProduct,
  useListServices, getListServicesQueryKey,
  useCreateService, useUpdateService, useDeleteService,
  useGetCompanySettings, getGetCompanySettingsQueryKey,
  useUpdateCompanySettings
} from '@workspace/api-client-react';

type Tab = 'inicio' | 'gerar' | 'produtos' | 'clientes' | 'historico' | 'empresa';

const mapDocument = (apiDoc: any): DocumentData => ({
  ...apiDoc,
  dueDate: apiDoc.dueDate ?? undefined,
  discount: apiDoc.discount ?? undefined,
  observations: apiDoc.observations ?? undefined,
  status: apiDoc.status ?? undefined,
  equipment: apiDoc.equipment ?? undefined,
  serialNumber: apiDoc.serialNumber ?? undefined,
  defect: apiDoc.defect ?? undefined,
  solution: apiDoc.solution ?? undefined,
  technicalAnalysis: apiDoc.technicalAnalysis ?? undefined,
  conclusion: apiDoc.conclusion ?? undefined,
  responsavelTecnico: apiDoc.responsavelTecnico ?? undefined,
  registroProfissional: apiDoc.registroProfissional ?? undefined,
  receivedValue: apiDoc.receivedValue ?? undefined,
  referringTo: apiDoc.referringTo ?? undefined,
  issuerName: apiDoc.issuerName ?? undefined,
  issuerDocument: apiDoc.issuerDocument ?? undefined,
});

const mapService = (apiServ: any): Service => ({
  ...apiServ,
  category: apiServ.category ?? undefined,
});

const cleanDocumentForApi = (doc: DocumentData) => {
  const { id, ...rest } = doc;
  return {
    type: rest.type as any,
    number: rest.number,
    date: rest.date,
    dueDate: rest.dueDate,
    client: {
      name: rest.client.name,
      document: rest.client.document,
      phone: rest.client.phone,
      email: rest.client.email,
      address: rest.client.address,
    },
    items: rest.items.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type as 'produto' | 'servico',
      quantity: item.quantity,
      price: item.price,
      total: item.total
    })),
    totalAmount: rest.totalAmount,
    discount: rest.discount,
    observations: rest.observations,
    status: rest.status,
    equipment: rest.equipment,
    serialNumber: rest.serialNumber,
    defect: rest.defect,
    solution: rest.solution,
    technicalAnalysis: rest.technicalAnalysis,
    conclusion: rest.conclusion,
    responsavelTecnico: rest.responsavelTecnico,
    registroProfissional: rest.registroProfissional,
    receivedValue: rest.receivedValue,
    referringTo: rest.referringTo,
    issuerName: rest.issuerName,
    issuerDocument: rest.issuerDocument,
  };
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [previewDocument, setPreviewDocument] = useState<DocumentData | null>(null);

  const queryClient = useQueryClient();

  // Data Queries
  const { data: apiProducts = [] } = useListProducts();
  const products: Product[] = apiProducts;

  const { data: apiServices = [] } = useListServices();
  const services: Service[] = apiServices.map(mapService);

  const { data: apiClients = [] } = useListClients();
  const clients: SavedClient[] = apiClients as SavedClient[];

  const { data: apiDocuments = [] } = useListDocuments();
  const documents: DocumentData[] = apiDocuments.map(mapDocument);

  const { data: apiCompany } = useGetCompanySettings();
  const company: CompanySettings = apiCompany ? {
    name: apiCompany.name,
    cnpj: apiCompany.cnpj,
    phone: apiCompany.phone,
    email: apiCompany.email,
    address: apiCompany.address,
    website: apiCompany.website ?? undefined,
    logoText: apiCompany.logoText ?? undefined,
    signature: apiCompany.signature ?? undefined,
    useSignature: apiCompany.useSignature ?? false,
  } : defaultCompany;

  // Auto-select first doc when loaded
  useEffect(() => {
    if (documents.length > 0 && !previewDocument) {
      setPreviewDocument(documents[0]);
    }
  }, [documents, previewDocument]);

  // Mutations
  const createProduct = useCreateProduct({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }) } });
  const updateProduct = useUpdateProduct({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }) } });
  const deleteProduct = useDeleteProduct({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }) } });

  const createService = useCreateService({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() }) } });
  const updateService = useUpdateService({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() }) } });
  const deleteService = useDeleteService({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() }) } });

  const createClient = useCreateClient({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() }) } });
  const updateClient = useUpdateClient({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() }) } });
  const deleteClient = useDeleteClient({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() }) } });

  const createDocument = useCreateDocument({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() }) } });
  const updateDocument = useUpdateDocument({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() }) } });
  const deleteDocument = useDeleteDocument({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() }) } });

  const updateCompany = useUpdateCompanySettings({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCompanySettingsQueryKey() }) } });

  // Handlers
  const handleSaveProduct = (prod: Product) => {
    createProduct.mutate({ data: { name: prod.name, description: prod.description, price: prod.price, unit: prod.unit } });
  };
  const handleEditProduct = (prod: Product) => {
    updateProduct.mutate({ id: prod.id, data: { name: prod.name, description: prod.description, price: prod.price, unit: prod.unit } });
  };
  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto do catálogo?')) {
      deleteProduct.mutate({ id });
    }
  };

  const handleSaveService = (serv: Service) => {
    createService.mutate({ data: { name: serv.name, description: serv.description, price: serv.price, category: serv.category } });
  };
  const handleEditService = (serv: Service) => {
    updateService.mutate({ id: serv.id, data: { name: serv.name, description: serv.description, price: serv.price, category: serv.category } });
  };
  const handleDeleteService = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço do catálogo?')) {
      deleteService.mutate({ id });
    }
  };

  const handleAddClient = (c: SavedClient) => {
    createClient.mutate({ data: { name: c.name, document: c.document, phone: c.phone, email: c.email, address: c.address } });
  };
  const handleEditClient = (c: SavedClient) => {
    updateClient.mutate({ id: c.id, data: { name: c.name, document: c.document, phone: c.phone, email: c.email, address: c.address } });
  };
  const handleDeleteClient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClient.mutate({ id });
    }
  };

  const handleSaveCompany = (comp: CompanySettings) => {
    updateCompany.mutate({ data: {
      name: comp.name,
      cnpj: comp.cnpj,
      phone: comp.phone,
      email: comp.email,
      address: comp.address,
      website: comp.website ?? null,
      logoText: comp.logoText ?? null,
      signature: comp.signature ?? null,
      useSignature: comp.useSignature ?? false,
    }});
  };

  const handleSaveDocument = (doc: DocumentData) => {
    // Auto-save client if not already in the list (match by name, case-insensitive)
    if (doc.client.name.trim()) {
      const alreadyExists = clients.some(
        c => c.name.trim().toLowerCase() === doc.client.name.trim().toLowerCase()
      );
      if (!alreadyExists) {
        createClient.mutate({
          data: {
            name: doc.client.name,
            document: doc.client.document,
            phone: doc.client.phone,
            email: doc.client.email,
            address: doc.client.address,
          }
        });
      }
    }

    const isExisting = doc.id && documents.some(d => d.id === doc.id);
    const data = cleanDocumentForApi(doc);

    if (isExisting) {
      updateDocument.mutate({ id: doc.id, data }, {
        onSuccess: (savedApiDoc) => {
          setPreviewDocument(mapDocument(savedApiDoc));
          alert('Documento salvo e pronto para visualização na folha A4!');
        }
      });
    } else {
      createDocument.mutate({ data }, {
        onSuccess: (savedApiDoc) => {
          setPreviewDocument(mapDocument(savedApiDoc));
          alert('Documento salvo e pronto para visualização na folha A4!');
        }
      });
    }
  };

  const handleDeleteDocument = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este documento do histórico?')) {
      deleteDocument.mutate({ id }, {
        onSuccess: () => {
          if (previewDocument?.id === id) {
            setPreviewDocument(documents.filter(d => d.id !== id)[0] || null);
          }
        }
      });
    }
  };

  const handleLoadDocumentForEdit = (doc: DocumentData) => {
    setPreviewDocument(doc);
    setActiveTab('gerar');
  };

  const handleImportBackup = (backup: DocumentData[]) => {
    backup.forEach(doc => {
      createDocument.mutate({ data: cleanDocumentForApi(doc) });
    });
    if (backup.length > 0) setPreviewDocument(backup[0]);
  };

  const handleResetToDefaults = () => {
    // No default catalog in production mode — user starts fresh
    alert('O catálogo está vazio. Adicione produtos e serviços manualmente.');
  };

  const handleUpdateDocumentStatus = (id: string, status: 'Pendente' | 'Em Andamento' | 'Aprovado' | 'Concluído' | 'Cancelado') => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      updateDocument.mutate({ id, data: { ...cleanDocumentForApi(doc), status } }, {
        onSuccess: (savedApiDoc) => {
          if (previewDocument?.id === id) {
            setPreviewDocument(mapDocument(savedApiDoc));
          }
        }
      });
    }
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
                  onCreateProduct={(data) => createProduct.mutate({ data })}
                  onCreateService={(data) => createService.mutate({ data })}
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
