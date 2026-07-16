import { useState } from 'react';
import { Client } from '../types';
import { generateUUID } from '../utils/helpers';
import { 
  Plus, Edit3, Trash2, User, Phone, Mail, MapPin, 
  FileText, X, Check, Search, Users
} from 'lucide-react';

export interface SavedClient extends Client {
  id: string;
  createdAt: string;
}

interface ClientManagerProps {
  clients: SavedClient[];
  onAddClient: (c: SavedClient) => void;
  onEditClient: (c: SavedClient) => void;
  onDeleteClient: (id: string) => void;
}

const emptyForm: Omit<SavedClient, 'id' | 'createdAt'> = {
  name: '',
  document: '',
  phone: '',
  email: '',
  address: '',
};

export default function ClientManager({
  clients,
  onAddClient,
  onEditClient,
  onDeleteClient,
}: ClientManagerProps) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<SavedClient | null>(null);
  const [form, setForm] = useState(emptyForm);

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white text-slate-800 text-xs px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-300 transition-shadow';
  const labelClass = 'block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1';

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.document.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (c: SavedClient) => {
    setEditingClient(c);
    setForm({ name: c.name, document: c.document, phone: c.phone, email: c.email, address: c.address });
    setShowForm(false);
  };

  const handleSaveNew = () => {
    if (!form.name.trim()) return;
    onAddClient({ ...form, id: generateUUID(), createdAt: new Date().toISOString() });
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleSaveEdit = () => {
    if (!editingClient || !form.name.trim()) return;
    onEditClient({ ...editingClient, ...form });
    setEditingClient(null);
    setForm(emptyForm);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingClient(null);
    setForm(emptyForm);
  };

  const FormBlock = ({ isEdit }: { isEdit: boolean }) => (
    <div
      className={`bg-white border-2 rounded-2xl p-5 shadow-sm space-y-3 ${
        isEdit ? 'border-blue-300' : 'border-amber-300'
      }`}
    >
      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
        {isEdit ? (
          <><Edit3 className="h-4 w-4 text-blue-500" /> Editar Cliente</>
        ) : (
          <><Plus className="h-4 w-4 text-amber-500" /> Novo Cliente</>
        )}
      </h3>

      <div>
        <label className={labelClass}>Nome / Razão Social *</label>
        <input
          className={inputClass}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nome completo ou razão social"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>CPF / CNPJ</label>
          <input
            className={inputClass}
            value={form.document}
            onChange={(e) => setForm({ ...form, document: e.target.value })}
            placeholder="000.000.000-00"
          />
        </div>
        <div>
          <label className={labelClass}>Telefone</label>
          <input
            className={inputClass}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>E-mail</label>
        <input
          className={inputClass}
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="cliente@email.com"
        />
      </div>

      <div>
        <label className={labelClass}>Endereço Completo</label>
        <input
          className={inputClass}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Rua, número, bairro, cidade - UF"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={isEdit ? handleSaveEdit : handleSaveNew}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            isEdit
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-amber-400 hover:bg-amber-300 text-slate-900'
          }`}
        >
          <Check className="h-4 w-4" />
          {isEdit ? 'Salvar Alterações' : 'Adicionar Cliente'}
        </button>
        <button
          onClick={cancelForm}
          className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-500" />
            Cadastro de Clientes
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        {!showForm && !editingClient && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </button>
        )}
      </div>

      {/* New client form */}
      {showForm && <FormBlock isEdit={false} />}

      {/* Edit form */}
      {editingClient && <FormBlock isEdit={true} />}

      {/* Search */}
      <div className="relative">
        <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          className="w-full rounded-2xl border border-slate-200 bg-white text-slate-800 text-xs px-3 pl-9 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-300 shadow-xs"
          placeholder="Buscar por nome, documento, telefone ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Client list */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 text-center">
          <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-500">
            {clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum resultado encontrado'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {clients.length === 0
              ? 'Clique em "Novo Cliente" para começar.'
              : 'Tente outros termos de busca.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3 hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                  {client.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-amber-700 transition-colors">
                    {client.name}
                  </h4>
                  {client.document && (
                    <p className="text-[11px] text-slate-400 font-mono">{client.document}</p>
                  )}
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-1.5 text-[11px] text-slate-500">
                {client.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-slate-300 shrink-0" />
                    {client.phone}
                  </p>
                )}
                {client.email && (
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3 w-3 text-slate-300 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </p>
                )}
                {client.address && (
                  <p className="flex items-start gap-1.5">
                    <MapPin className="h-3 w-3 text-slate-300 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{client.address}</span>
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(client)}
                  className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                  title="Editar cliente"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDeleteClient(client.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  title="Excluir cliente"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
