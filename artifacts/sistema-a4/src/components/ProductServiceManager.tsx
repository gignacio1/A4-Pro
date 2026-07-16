import { useState } from 'react';
import { Product, Service } from '../types';
import { formatCurrency, generateUUID } from '../utils/helpers';
import { Plus, Edit3, Trash2, Package, Briefcase, X, Check, RefreshCw } from 'lucide-react';

interface ProductServiceManagerProps {
  products: Product[];
  services: Service[];
  onAddProduct: (p: Product) => void;
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddService: (s: Service) => void;
  onEditService: (s: Service) => void;
  onDeleteService: (id: string) => void;
  onResetToDefaults: () => void;
}

const emptyProduct: Omit<Product, 'id'> = { name: '', description: '', price: 0, unit: 'Unidade' };
const emptyService: Omit<Service, 'id'> = { name: '', description: '', price: 0, category: '' };

export default function ProductServiceManager({
  products,
  services,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAddService,
  onEditService,
  onDeleteService,
  onResetToDefaults,
}: ProductServiceManagerProps) {
  const [activeTab, setActiveTab] = useState<'produtos' | 'servicos'>('produtos');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [newService, setNewService] = useState<Omit<Service, 'id'>>(emptyService);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-white text-slate-800 text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-300 transition-shadow';
  const labelClass = 'block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1';

  const handleAddProduct = () => {
    if (!newProduct.name.trim()) return;
    onAddProduct({ ...newProduct, id: generateUUID() });
    setNewProduct(emptyProduct);
    setShowProductForm(false);
  };

  const handleSaveEditProduct = () => {
    if (!editingProduct || !editingProduct.name.trim()) return;
    onEditProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleAddService = () => {
    if (!newService.name.trim()) return;
    onAddService({ ...newService, id: generateUUID() });
    setNewService(emptyService);
    setShowServiceForm(false);
  };

  const handleSaveEditService = () => {
    if (!editingService || !editingService.name.trim()) return;
    onEditService(editingService);
    setEditingService(null);
  };

  return (
    <div className="space-y-5">
      {/* Tab switcher */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('produtos')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'produtos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="h-4 w-4" />
            Produtos ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('servicos')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'servicos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Serviços ({services.length})
          </button>
        </div>
        <button
          onClick={onResetToDefaults}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Restaurar Exemplos
        </button>
      </div>

      {/* PRODUCTS */}
      {activeTab === 'produtos' && (
        <div className="space-y-4">
          {/* Add New Product Form */}
          {showProductForm ? (
            <div className="bg-white border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-amber-500" />
                Adicionar Novo Produto
              </h3>
              <div>
                <label className={labelClass}>Nome do Produto *</label>
                <input className={inputClass} value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Ex: Teclado Mecânico Redragon..." />
              </div>
              <div>
                <label className={labelClass}>Descrição</label>
                <input className={inputClass} value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Detalhes do produto..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Preço (R$) *</label>
                  <input type="number" step="0.01" min="0" className={inputClass} value={newProduct.price || ''} onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })} placeholder="0,00" />
                </div>
                <div>
                  <label className={labelClass}>Unidade</label>
                  <select className={inputClass} value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}>
                    <option>Unidade</option>
                    <option>Metro</option>
                    <option>Litro</option>
                    <option>Kg</option>
                    <option>Caixa</option>
                    <option>Par</option>
                    <option>Hora</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleAddProduct} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer">
                  <Check className="h-4 w-4" />
                  Adicionar Produto
                </button>
                <button onClick={() => { setShowProductForm(false); setNewProduct(emptyProduct); }} className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowProductForm(true)}
              className="w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-amber-300 text-xs font-bold text-slate-400 hover:text-amber-600 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Adicionar Novo Produto ao Catálogo
            </button>
          )}

          {/* Products List */}
          <div className="space-y-3">
            {products.map(product => (
              <div key={product.id} className="bg-white border border-slate-200 rounded-2xl shadow-xs">
                {editingProduct?.id === product.id ? (
                  <div className="p-5 space-y-3 border-2 border-blue-300 rounded-2xl">
                    <div>
                      <label className={labelClass}>Nome *</label>
                      <input className={inputClass} value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelClass}>Descrição</label>
                      <input className={inputClass} value={editingProduct.description} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Preço (R$)</label>
                        <input type="number" step="0.01" min="0" className={inputClass} value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <label className={labelClass}>Unidade</label>
                        <select className={inputClass} value={editingProduct.unit} onChange={e => setEditingProduct({ ...editingProduct, unit: e.target.value })}>
                          <option>Unidade</option>
                          <option>Metro</option>
                          <option>Litro</option>
                          <option>Kg</option>
                          <option>Caixa</option>
                          <option>Par</option>
                          <option>Hora</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveEditProduct} className="flex-1 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        Salvar Alterações
                      </button>
                      <button onClick={() => setEditingProduct(null)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{product.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{product.description}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Unidade: {product.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-sm font-bold text-slate-800">{formatCurrency(product.price)}</span>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingProduct(product)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => onDeleteProduct(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SERVICES */}
      {activeTab === 'servicos' && (
        <div className="space-y-4">
          {showServiceForm ? (
            <div className="bg-white border-2 border-indigo-300 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-indigo-500" />
                Adicionar Novo Serviço
              </h3>
              <div>
                <label className={labelClass}>Nome do Serviço *</label>
                <input className={inputClass} value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} placeholder="Ex: Instalação de Software..." />
              </div>
              <div>
                <label className={labelClass}>Descrição</label>
                <textarea className={`${inputClass} min-h-[60px] resize-y`} value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })} placeholder="Detalhes do serviço prestado..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Preço (R$) *</label>
                  <input type="number" step="0.01" min="0" className={inputClass} value={newService.price || ''} onChange={e => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })} placeholder="0,00" />
                </div>
                <div>
                  <label className={labelClass}>Categoria</label>
                  <input className={inputClass} value={newService.category || ''} onChange={e => setNewService({ ...newService, category: e.target.value })} placeholder="Ex: Hardware, Software, Redes..." />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleAddService} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer">
                  <Check className="h-4 w-4" />
                  Adicionar Serviço
                </button>
                <button onClick={() => { setShowServiceForm(false); setNewService(emptyService); }} className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowServiceForm(true)}
              className="w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Adicionar Novo Serviço ao Catálogo
            </button>
          )}

          {/* Services List */}
          <div className="space-y-3">
            {services.map(service => (
              <div key={service.id} className="bg-white border border-slate-200 rounded-2xl shadow-xs">
                {editingService?.id === service.id ? (
                  <div className="p-5 space-y-3 border-2 border-indigo-300 rounded-2xl">
                    <div>
                      <label className={labelClass}>Nome *</label>
                      <input className={inputClass} value={editingService.name} onChange={e => setEditingService({ ...editingService, name: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelClass}>Descrição</label>
                      <textarea className={`${inputClass} min-h-[60px] resize-y`} value={editingService.description} onChange={e => setEditingService({ ...editingService, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Preço (R$)</label>
                        <input type="number" step="0.01" min="0" className={inputClass} value={editingService.price} onChange={e => setEditingService({ ...editingService, price: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <label className={labelClass}>Categoria</label>
                        <input className={inputClass} value={editingService.category || ''} onChange={e => setEditingService({ ...editingService, category: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveEditService} className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        Salvar Alterações
                      </button>
                      <button onClick={() => setEditingService(null)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                        <Briefcase className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800">{service.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{service.description}</p>
                        {service.category && (
                          <span className="inline-block mt-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {service.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-sm font-bold text-slate-800">{formatCurrency(service.price)}</span>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingService(service)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => onDeleteService(service.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
