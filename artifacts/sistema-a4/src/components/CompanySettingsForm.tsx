import { useState, useEffect, useRef } from 'react';
import { CompanySettings } from '../types';
import { Save, Building2, Eye, PenLine, Trash2, CheckCircle2, ToggleLeft, ToggleRight, ImagePlus } from 'lucide-react';

interface CompanySettingsFormProps {
  company: CompanySettings;
  onSaveCompany: (company: CompanySettings) => void;
}

export default function CompanySettingsForm({ company, onSaveCompany }: CompanySettingsFormProps) {
  const [form, setForm] = useState<CompanySettings>(company);
  const [saved, setSaved] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setForm(company);
  }, [company.name]);

  // Load existing signature into canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (company.signature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasSignature(true);
      };
      img.src = company.signature;
    } else {
      setHasSignature(false);
    }
  }, [company.signature]);

  // ─── Canvas helpers ───────────────────────────────────────────────────────

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !lastPos.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    lastPos.current = pos;
    if (!hasSignature) setHasSignature(true);
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setForm(f => ({ ...f, signature: undefined, useSignature: false }));
  };

  // ─── Save ─────────────────────────────────────────────────────────────────

  const handleSave = () => {
    const signatureData = hasSignature && canvasRef.current
      ? canvasRef.current.toDataURL('image/png')
      : form.signature;

    onSaveCompany({ ...form, signature: signatureData });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-white text-slate-800 text-xs px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-300 transition-shadow';
  const labelClass = 'block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

      {/* ── Left: Form panel ─────────────────────────────────────────────── */}
      <div className="space-y-5">

        {/* Company info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="h-10 w-10 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Dados da Empresa</h2>
              <p className="text-xs text-slate-400 mt-0.5">Aparecem no cabeçalho de todos os documentos.</p>
            </div>
          </div>

          <div>
            <label className={labelClass}>Razão Social / Nome *</label>
            <input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome da sua empresa" />
          </div>

          <div>
            <label className={labelClass}>CNPJ *</label>
            <input className={inputClass} value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" />
          </div>

          {/* Logo upload */}
          <div>
            <label className={labelClass}>Logo da Empresa</label>
            {form.logoUrl ? (
              <div className="flex items-center gap-3">
                <img src={form.logoUrl} alt="Logo" className="h-14 w-14 rounded-xl object-contain border border-slate-200 bg-white p-1" />
                <div className="flex flex-col gap-1.5">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                    <ImagePlus className="h-3.5 w-3.5" />
                    Trocar logo
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => setForm(f => ({ ...f, logoUrl: ev.target?.result as string, logoText: undefined }));
                      reader.readAsDataURL(file);
                      e.target.value = '';
                    }} />
                  </label>
                  <button type="button" onClick={() => setForm(f => ({ ...f, logoUrl: undefined }))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5" />
                    Remover logo
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 w-full py-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-colors cursor-pointer">
                <ImagePlus className="h-6 w-6 text-slate-300" />
                <span className="text-xs text-slate-400 font-medium">Clique para enviar uma imagem (PNG, JPG, SVG)</span>
                <span className="text-[10px] text-slate-300">A logo substituirá a sigla no cabeçalho dos documentos</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => setForm(f => ({ ...f, logoUrl: ev.target?.result as string, logoText: undefined }));
                  reader.readAsDataURL(file);
                  e.target.value = '';
                }} />
              </label>
            )}
          </div>

          <div>
            <label className={labelClass}>Sigla do Logo <span className="normal-case font-normal text-slate-300">(usado quando não há logo)</span></label>
            <input className={inputClass} maxLength={4} value={form.logoText || ''} onChange={e => setForm({ ...form, logoText: e.target.value.toUpperCase() })} placeholder="Ex: TS, ABC" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Telefone *</label>
              <input className={inputClass} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label className={labelClass}>E-mail *</label>
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

        {/* Signature section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <PenLine className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Assinatura Digital</h2>
              <p className="text-xs text-slate-400 mt-0.5">Desenhe e ative para aparecer em todos os documentos.</p>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative">
            <label className={labelClass}>Desenhe sua assinatura abaixo</label>
            <div className={`rounded-xl border-2 transition-colors overflow-hidden bg-white ${isDrawing ? 'border-indigo-400' : 'border-slate-200 hover:border-slate-300'}`}>
              <canvas
                ref={canvasRef}
                width={520}
                height={120}
                className="w-full touch-none cursor-crosshair block"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-5">
                <span className="text-slate-300 text-xs font-medium select-none">Clique e arraste para assinar</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={clearCanvas}
              disabled={!hasSignature}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpar Assinatura
            </button>

            {/* Toggle use signature */}
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, useSignature: !f.useSignature }))}
              disabled={!hasSignature && !form.signature}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                form.useSignature
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {form.useSignature
                ? <><ToggleRight className="h-4 w-4" /> Assinatura Ativada</>
                : <><ToggleLeft className="h-4 w-4" /> Ativar Assinatura</>
              }
            </button>
          </div>

          {form.useSignature && (
            <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 text-xs text-indigo-700">
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>A assinatura será impressa no campo <strong>Responsável / Emitente</strong> de todos os documentos gerados.</span>
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-900 text-amber-400 hover:bg-slate-800'
          }`}
        >
          <Save className="h-4 w-4" />
          {saved ? '✓ Configurações Salvas com Sucesso!' : 'Salvar Configurações'}
        </button>
      </div>

      {/* ── Right: Preview panel ──────────────────────────────────────────── */}
      <div className="space-y-5">

        {/* Header preview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-4">
            <Eye className="h-4 w-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prévia do Cabeçalho</h3>
          </div>

          <div className="border-2 border-slate-100 rounded-2xl p-4 bg-slate-50">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between border-b-2 border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="Logo" className="h-11 w-11 rounded-xl object-contain border border-slate-100 bg-white shrink-0" />
                  ) : form.logoText ? (
                    <div className="h-11 w-11 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-lg tracking-wider shrink-0">
                      {form.logoText}
                    </div>
                  ) : (
                    <div className="h-11 w-11 bg-slate-200 text-slate-400 rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0">LOGO</div>
                  )}
                  <div>
                    <p className="text-xs font-bold tracking-tight text-slate-900 uppercase">{form.name || 'Nome da Empresa'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">CNPJ: {form.cnpj || '00.000.000/0001-00'}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[220px]">{form.address || 'Endereço completo'}</p>
                    <p className="text-[10px] text-slate-400">{form.phone || '(00) 00000-0000'} • {form.email || 'email@empresa.com'}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="inline-block px-2 py-1 border-2 border-blue-200 bg-blue-50 rounded-lg font-bold text-[10px] tracking-widest text-blue-700">ORÇAMENTO</div>
                  <div className="mt-2 text-[10px] font-mono text-slate-500">
                    <p className="font-semibold text-slate-700">Nº 2026-0001</p>
                    <p>Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-300 text-center mt-3 font-medium tracking-wide uppercase">— Corpo do documento —</p>
            </div>
          </div>
        </div>

        {/* Signature preview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-4">
            <PenLine className="h-4 w-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prévia da Assinatura no Documento</h3>
          </div>

          <div className="border-2 border-slate-100 rounded-2xl p-5 bg-slate-50">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="grid grid-cols-2 gap-8 text-center text-[11px]">
                {/* Client side */}
                <div className="flex flex-col justify-end">
                  <div className="h-12" />
                  <div className="border-b border-slate-300 mx-4 mb-2" />
                  <span className="font-semibold text-slate-700">Nome do Cliente</span>
                  <span className="text-slate-400 text-[10px]">Assinatura do Cliente</span>
                </div>
                {/* Company side */}
                <div className="flex flex-col justify-end items-center">
                  {(hasSignature || form.signature) && form.useSignature ? (
                    <img
                      src={hasSignature && canvasRef.current ? canvasRef.current.toDataURL('image/png') : form.signature}
                      alt="Assinatura"
                      className="max-h-12 max-w-full object-contain mb-1"
                      style={{ mixBlendMode: 'multiply' }}
                    />
                  ) : (
                    <div className="h-12 w-full flex items-end justify-center pb-1">
                      <span className="text-[10px] text-slate-300 italic">
                        {!hasSignature && !form.signature ? 'sem assinatura' : 'assinatura desativada'}
                      </span>
                    </div>
                  )}
                  <div className="border-b border-slate-300 w-full mb-2" />
                  <span className="font-semibold text-slate-700">{form.name || 'Empresa'}</span>
                  <span className="text-slate-400 text-[10px]">Responsável / Emitente</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-4 leading-relaxed">
            {form.useSignature
              ? 'A assinatura será aplicada automaticamente em todos os documentos gerados.'
              : 'Ative a assinatura e clique em Salvar para aplicá-la nos documentos.'}
          </p>
        </div>
      </div>
    </div>
  );
}
