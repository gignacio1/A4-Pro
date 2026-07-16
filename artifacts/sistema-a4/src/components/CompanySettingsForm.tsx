import { useState, useEffect } from 'react';
import { CompanySettings } from '../types';
import { Save, Building2, Eye } from 'lucide-react';

interface CompanySettingsFormProps {
  company: CompanySettings;
  onSaveCompany: (company: CompanySettings) => void;
}

export default function CompanySettingsForm({ company, onSaveCompany }: CompanySettingsFormProps) {
  const [form, setForm] = useState<CompanySettings>(company);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(company);
  }, [company.name]);

  const handleSave = () => {
    onSaveCompany(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-white text-slate-800 text-xs px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-300 transition-shadow';
  const labelClass = 'block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Form panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="h-10 w-10 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Configurações da Empresa</h2>
            <p className="text-xs text-slate-400 mt-0.5">Estas informações aparecem em todos os documentos emitidos.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Razão Social / Nome da Empresa *</label>
            <input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome da sua empresa" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>CNPJ *</label>
              <input className={inputClass} value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" />
            </div>
            <div>
              <label className={labelClass}>Texto do Logo (Sigla)</label>
              <input className={inputClass} maxLength={4} value={form.logoText || ''} onChange={e => setForm({ ...form, logoText: e.target.value.toUpperCase() })} placeholder="Ex: TS, ABC" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Telefone *</label>
              <input className={inputClass} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label className={labelClass}>E-mail de Contato *</label>
              <input className={inputClass} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contato@empresa.com" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Endereço Completo *</label>
            <input className={inputClass} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Rua, número, bairro, cidade - UF, CEP" />
          </div>

          <div>
            <label className={labelClass}>Website (Opcional)</label>
            <input className={inputClass} value={form.website || ''} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="www.suaempresa.com.br" />
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-900 text-amber-400 hover:bg-slate-800'
          }`}
        >
          <Save className="h-4 w-4" />
          {saved ? '✓ Configurações Salvas com Sucesso!' : 'Salvar Configurações da Empresa'}
        </button>
      </div>

      {/* Live preview panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-4">
          <Eye className="h-4 w-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prévia do Cabeçalho do Documento</h3>
        </div>

        {/* Live header preview */}
        <div className="border-2 border-slate-100 rounded-2xl p-5 bg-slate-50">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-start justify-between border-b-2 border-slate-200 pb-5">
              <div className="flex items-center gap-4">
                {form.logoText ? (
                  <div className="h-12 w-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xl tracking-wider shrink-0">
                    {form.logoText}
                  </div>
                ) : (
                  <div className="h-12 w-12 bg-slate-200 text-slate-400 rounded-xl flex items-center justify-center text-xs font-bold shrink-0">
                    LOGO
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold tracking-tight text-slate-900 uppercase leading-tight">
                    {form.name || 'Nome da Empresa'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">CNPJ: {form.cnpj || '00.000.000/0001-00'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[280px]">{form.address || 'Endereço completo da empresa'}</p>
                  <p className="text-[10px] text-slate-400">{form.phone || '(00) 00000-0000'} • {form.email || 'contato@empresa.com'}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="inline-block px-3 py-1 border-2 border-blue-200 bg-blue-50 rounded-lg font-bold text-xs tracking-widest text-blue-700">
                  ORÇAMENTO
                </div>
                <div className="mt-2 text-[10px] font-mono text-slate-500">
                  <p className="font-semibold text-slate-700">Nº 2026-0001</p>
                  <p>Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-300 text-center mt-4 font-medium tracking-wide uppercase">— Corpo do documento —</p>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center mt-4 leading-relaxed">
          Esta é uma prévia da aparência do cabeçalho nos documentos gerados. As alterações são aplicadas em tempo real.
        </p>
      </div>
    </div>
  );
}
