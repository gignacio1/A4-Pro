import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { DocumentData, CompanySettings, DocumentType } from '../types';
import {
  Download, Printer, ZoomIn, ZoomOut,
  FileText, FileCheck, ShieldCheck, Receipt,
  User, Calendar, Wrench, CreditCard, CheckCircle2
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';

interface A4DocumentProProps {
  document: DocumentData;
  company: CompanySettings;
}

const NAVY = '#1e3a8a';

const docMeta: Record<DocumentType, { title: string }> = {
  orcamento:     { title: 'ORÇAMENTO' },
  ordem_servico: { title: 'ORDEM DE SERVIÇO' },
  laudo_tecnico: { title: 'LAUDO TÉCNICO' },
  recibo:        { title: 'RECIBO' },
};

const statusColors: Record<string, string> = {
  'Pendente':    'bg-yellow-100 text-yellow-800',
  'Em Andamento':'bg-blue-100 text-blue-800',
  'Aprovado':    'bg-green-100 text-green-800',
  'Concluído':   'bg-emerald-100 text-emerald-800',
  'Cancelado':   'bg-red-100 text-red-800',
};

export default function A4DocumentPro({ document, company }: A4DocumentProProps) {
  const documentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(0.85);
  const [isExporting, setIsExporting] = useState(false);
  const [renderType, setRenderType] = useState<DocumentType>(document.type);

  useEffect(() => { setRenderType(document.type); }, [document.id, document.type]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const safeWidth = containerWidth - 24;
        if (safeWidth < 794) {
          setZoom(Math.max(0.3, Number((safeWidth / 794).toFixed(2))));
        } else {
          setZoom(0.85);
        }
      }
    };
    const timer = setTimeout(handleResize, 50);
    window.addEventListener('resize', handleResize);
    return () => { clearTimeout(timer); window.removeEventListener('resize', handleResize); };
  }, [document.id]);

  const handleDownloadJPG = async () => {
    if (!documentRef.current) return;
    setIsExporting(true);
    const sheetEl = documentRef.current;

    const tempCanvas = window.document.createElement('canvas');
    tempCanvas.width = 1; tempCanvas.height = 1;
    const ctx2d = tempCanvas.getContext('2d')!;

    const resolveColor = (color: string): string => {
      if (!color || color === 'transparent') return color;
      try {
        ctx2d.clearRect(0, 0, 1, 1);
        ctx2d.fillStyle = color;
        ctx2d.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx2d.getImageData(0, 0, 1, 1).data;
        if (a === 0) return 'transparent';
        return `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
      } catch { return color; }
    };

    const COLOR_PROPS = [
      'color', 'backgroundColor',
      'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor',
    ] as const;

    type Snapshot = { el: HTMLElement; prop: string; original: string };
    const snapshots: Snapshot[] = [];
    const allEls = [sheetEl, ...Array.from(sheetEl.querySelectorAll('*'))] as HTMLElement[];
    for (const el of allEls) {
      const computed = window.getComputedStyle(el);
      for (const prop of COLOR_PROPS) {
        const val = computed[prop as keyof CSSStyleDeclaration] as string;
        if (!val) continue;
        const resolved = resolveColor(val);
        if (resolved !== val) {
          snapshots.push({ el, prop, original: (el.style as never)[prop] ?? '' });
          (el.style as never)[prop] = resolved;
        }
      }
    }

    try {
      const canvas = await html2canvas(sheetEl, {
        scale: 2.2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        height: 1123,
        onclone: (clonedDoc) => {
          const clonedSheet = clonedDoc.getElementById('a4-sheet-pro');
          if (clonedSheet) {
            clonedSheet.style.transform = 'none';
            clonedSheet.style.width = '794px';
            clonedSheet.style.height = '1123px';
            clonedSheet.style.boxShadow = 'none';
            clonedSheet.style.border = 'none';
            clonedSheet.style.margin = '0';
            clonedSheet.style.padding = '40px';
            clonedDoc.querySelectorAll<HTMLElement>('[data-badge]').forEach(el => {
              el.style.display = 'inline-block';
              el.style.textAlign = 'center';
            });
            clonedDoc.querySelectorAll<HTMLElement>('th, td').forEach(el => {
              const computed = window.getComputedStyle(el);
              if (!el.style.textAlign && computed.textAlign) {
                el.style.textAlign = computed.textAlign;
              }
            });
            let parent = clonedSheet.parentElement;
            while (parent) {
              parent.style.transform = 'none';
              (parent.style as never as Record<string, string>)['webkitTransform'] = 'none';
              parent.style.margin = '0';
              parent.style.padding = '0';
              parent = parent.parentElement;
            }
          }
        }
      });

      const image = canvas.toDataURL('image/jpeg', 0.95);
      const response = await fetch(image);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = blobUrl;
      link.download = `${renderType.toUpperCase()}_${document.number || 'DOC'}.jpg`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } finally {
      for (const { el, prop, original } of snapshots) {
        (el.style as never)[prop] = original;
      }
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const meta = docMeta[renderType] || { title: 'DOCUMENTO' };
  const subtotal = (document.totalAmount || 0) + (document.discount || 0);

  /* ── Sheet ─────────────────────────────────────────────────────────── */
  const Sheet = (
    <div
      id="a4-sheet-pro"
      ref={documentRef}
      className="bg-white text-slate-900 select-text"
      style={{
        width: '794px',
        height: '1123px',
        fontFamily: '"Inter", sans-serif',
        boxSizing: 'border-box',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>
        {/* Logo */}
        <div style={{ flexShrink: 0 }}>
          {company.logoUrl ? (
            <img src={company.logoUrl} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '10px' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', background: NAVY, color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '22px', letterSpacing: '1px' }}>
              {company.logoText || 'DOC'}
            </div>
          )}
        </div>

        {/* Company info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.5px', lineHeight: 1 }}>
            {company.name}
          </div>
          {company.website && (
            <div style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '3px' }}>
              {company.website}
            </div>
          )}
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#475569', lineHeight: '1.6' }}>
            <div>CNPJ: {company.cnpj}</div>
            <div>{company.address}</div>
            <div>{company.phone} • {company.email}</div>
          </div>
        </div>

        {/* Doc type + number */}
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div
            data-badge="doc-type"
            style={{ background: NAVY, color: '#fff', padding: '7px 18px', borderRadius: '6px', fontWeight: 800, fontSize: '11px', letterSpacing: '0.08em', textAlign: 'center', display: 'inline-block' }}
          >
            {meta.title}
          </div>
          <div style={{ marginTop: '8px', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '8px 12px', background: '#eff6ff', fontSize: '11px' }}>
            <div style={{ fontWeight: 700, color: NAVY }}>Nº {document.number}</div>
            <div style={{ color: '#475569', marginTop: '2px' }}>Emissão: {formatDate(document.date)}</div>
            {document.dueDate && (
              <div style={{ color: '#dc2626', fontWeight: 700, marginTop: '2px' }}>Vencimento: {formatDate(document.dueDate)}</div>
            )}
          </div>
        </div>
      </div>

      {/* ── CLIENT + STATUS ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: renderType === 'ordem_servico' ? '1fr 1fr' : '1fr', gap: '12px' }}>
        {/* Client data */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ background: '#eff6ff', borderBottom: '1px solid #bfdbfe', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dados do Cliente</span>
          </div>
          <div style={{ padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: '11px' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '1px' }}>Nome / Razão Social</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{document.client.name || '-'}</div>
            </div>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '1px' }}>CPF / CNPJ</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{document.client.document || '-'}</div>
            </div>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '1px' }}>Telefone</div>
              <div style={{ fontWeight: 600, color: '#334155' }}>{document.client.phone || '-'}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '1px' }}>E-mail</div>
              <div style={{ fontWeight: 600, color: '#334155', wordBreak: 'break-all' }}>{document.client.email || '-'}</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '1px' }}>Endereço Completo</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{document.client.address || '-'}</div>
            </div>
          </div>
        </div>

        {/* OS Status panel */}
        {renderType === 'ordem_servico' && (
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', fontSize: '11px' }}>
            {[
              { label: 'STATUS DA OS', value: document.status || '-', isStatus: true },
              { label: 'DATA DE EXECUÇÃO', value: formatDate(document.date) },
              { label: 'TÉCNICO RESPONSÁVEL', value: document.responsavelTecnico || '-' },
              { label: 'EQUIPAMENTO', value: document.equipment || '-' },
              { label: 'NÚMERO DE SÉRIE', value: document.serialNumber || '-' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none', background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{row.label}</span>
                {row.isStatus && document.status ? (
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: document.status === 'Concluído' || document.status === 'Aprovado' ? '#dcfce7' : document.status === 'Cancelado' ? '#fee2e2' : document.status === 'Em Andamento' ? '#dbeafe' : '#fef9c3', color: document.status === 'Concluído' || document.status === 'Aprovado' ? '#166534' : document.status === 'Cancelado' ? '#991b1b' : document.status === 'Em Andamento' ? '#1e40af' : '#854d0e' }}>
                    {document.status}
                  </span>
                ) : (
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{row.value}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ITEMS TABLE ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: NAVY, color: '#fff' }}>
              <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'left', width: '44px', fontSize: '10px', letterSpacing: '0.05em' }}>ITEM</th>
              <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'left', fontSize: '10px', letterSpacing: '0.05em' }}>DESCRIÇÃO DO PRODUTO / SERVIÇO</th>
              <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'center', width: '72px', fontSize: '10px', letterSpacing: '0.05em' }}>TIPO</th>
              <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'center', width: '40px', fontSize: '10px', letterSpacing: '0.05em' }}>QTD</th>
              <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right', width: '90px', fontSize: '10px', letterSpacing: '0.05em' }}>V. UNITÁRIO</th>
              <th style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right', width: '90px', fontSize: '10px', letterSpacing: '0.05em' }}>V. TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {document.items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                  Nenhum item adicionado a este documento.
                </td>
              </tr>
            ) : (
              document.items.map((item, index) => (
                <tr key={item.id + index} style={{ background: index % 2 === 0 ? '#fff' : '#eff6ff', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '7px 10px', fontWeight: 800, color: NAVY, textAlign: 'left' }}>
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td style={{ padding: '7px 10px', color: '#1e293b' }}>{item.name}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                    <span
                      data-badge="item-type"
                      style={{
                        display: 'inline-block',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        textAlign: 'center',
                        background: item.type === 'produto' ? '#ede9fe' : '#dbeafe',
                        color: item.type === 'produto' ? '#6d28d9' : '#1d4ed8',
                      }}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'center', color: '#334155' }}>{item.quantity}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'monospace', color: '#334155' }}>{formatCurrency(item.price)}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(item.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── BOTTOM 3-COL ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '4px' }}>
        {/* Observations */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ background: '#eff6ff', borderBottom: '1px solid #bfdbfe', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z"/></svg>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Observações</span>
          </div>
          <div style={{ padding: '8px 12px' }}>
            {document.observations ? (
              <p style={{ fontSize: '10px', color: '#475569', lineHeight: '1.5' }}>{document.observations}</p>
            ) : (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ borderBottom: '1px dashed #e2e8f0', marginBottom: '8px', paddingBottom: '4px' }} />
              ))
            )}
          </div>
        </div>

        {/* Financial summary */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ background: '#eff6ff', borderBottom: '1px solid #bfdbfe', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resumo Financeiro</span>
          </div>
          <div style={{ padding: '8px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
              <span>Subtotal:</span>
              <span style={{ fontFamily: 'monospace' }}>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', marginBottom: '8px' }}>
              <span>Desconto:</span>
              <span style={{ fontFamily: 'monospace' }}>{formatCurrency(document.discount || 0)}</span>
            </div>
            <div style={{ background: '#1d4ed8', borderRadius: '8px', padding: '8px 12px', textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Valor Total</div>
              <div style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'monospace' }}>{formatCurrency(document.totalAmount)}</div>
            </div>
          </div>
        </div>

        {/* Documento Válido */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Documento Válido</span>
          </div>
          <div style={{ padding: '8px 12px' }}>
            <p style={{ fontSize: '10px', color: '#475569', lineHeight: '1.5' }}>
              Este documento foi emitido eletronicamente e possui validade fiscal.
            </p>
            <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.4' }}>
              Escaneie o QR Code para validar a autenticidade deste documento.
            </p>
            {/* QR placeholder */}
            <div style={{ width: '48px', height: '48px', border: '1.5px solid #e2e8f0', borderRadius: '6px', margin: '6px 0 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="5" y="5" width="3" height="3" fill="#cbd5e1"/><rect x="16" y="5" width="3" height="3" fill="#cbd5e1"/><rect x="5" y="16" width="3" height="3" fill="#cbd5e1"/><path d="M14 14h2v2h-2zM16 16h2v2h-2zM18 14h2v2h-2z"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── SIGNATURES ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', paddingTop: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', fontSize: '11px' }}>
          <div style={{ height: '36px' }} />
          <div style={{ borderBottom: '1.5px solid #475569', width: '100%', marginBottom: '6px' }} />
          <span style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', fontSize: '10px' }}>{document.client.name || 'CLIENTE'}</span>
          <span style={{ color: '#94a3b8', fontSize: '10px' }}>Assinatura do Cliente</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', fontSize: '11px' }}>
          {company.signature && company.useSignature ? (
            <img src={company.signature} alt="Assinatura" style={{ maxHeight: '36px', maxWidth: '100%', objectFit: 'contain', marginBottom: '0', mixBlendMode: 'multiply' }} />
          ) : (
            <div style={{ height: '36px' }} />
          )}
          <div style={{ borderBottom: '1.5px solid #475569', width: '100%', marginBottom: '6px' }} />
          <span style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', fontSize: '10px' }}>
            {renderType === 'ordem_servico' && document.responsavelTecnico ? document.responsavelTecnico : company.name}
          </span>
          <span style={{ color: '#94a3b8', fontSize: '10px' }}>Responsável / Emitente</span>
        </div>
      </div>

      {/* ── FOOTER BAR ───────────────────────────────────────────────── */}
      <div style={{ background: NAVY, margin: '-40px -40px -40px -40px', padding: '10px 40px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#93c5fd', fontSize: '10px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <span style={{ color: '#fff', fontWeight: 600 }}>{company.website || company.email}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#93c5fd', fontSize: '10px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.01z"/></svg>
          <span style={{ color: '#fff', fontWeight: 600 }}>{company.phone}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#93c5fd', fontSize: '10px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{ color: '#bfdbfe', fontWeight: 400 }}>Conectando você ao que realmente importa.</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Controls bar */}
      <div className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs no-print">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center justify-center p-1.5 bg-blue-900 rounded-lg">
            <FileText className="h-5 w-5 text-blue-300" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Visualização da Folha A4</p>
            <p className="text-xs text-slate-400">Template Pro — pronto para imprimir ou baixar como JPG</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Zoom */}
          <div className="flex items-center gap-2 bg-slate-200/60 p-1 rounded-xl">
            <button onClick={() => setZoom(z => Math.max(0.3, +(z - 0.1).toFixed(2)))} className="p-1.5 rounded-lg hover:bg-white transition-all cursor-pointer"><ZoomOut className="h-4 w-4 text-slate-600" /></button>
            <span className="text-xs font-mono font-medium min-w-[36px] text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(2, +(z + 0.1).toFixed(2)))} className="p-1.5 rounded-lg hover:bg-white transition-all cursor-pointer"><ZoomIn className="h-4 w-4 text-slate-600" /></button>
          </div>
          <button onClick={handlePrint} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer">
            <Printer className="h-3.5 w-3.5" /> Imprimir (PDF)
          </button>
          <button onClick={handleDownloadJPG} disabled={isExporting} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md disabled:bg-slate-600 disabled:text-slate-400 cursor-pointer">
            <Download className="h-3.5 w-3.5" /> {isExporting ? 'Processando...' : 'Baixar JPG (A4)'}
          </button>
        </div>
      </div>

      {/* A4 Preview */}
      <div ref={containerRef} className="w-full overflow-x-auto py-6 bg-slate-100 border border-slate-200 rounded-2xl flex justify-center shadow-inner">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', transition: 'transform 0.2s' }}>
          {Sheet}
        </div>
      </div>
    </div>
  );
}
