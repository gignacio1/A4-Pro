import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { DocumentData, CompanySettings, DocumentType } from '../types';
import { 
  Download, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  FileText, 
  CheckCircle2, 
  User, 
  Calendar, 
  FileCheck, 
  Hash, 
  ShieldCheck, 
  Receipt 
} from 'lucide-react';
import { formatCurrency, formatDate, valorPorExtenso } from '../utils/helpers';

interface A4DocumentProps {
  document: DocumentData;
  company: CompanySettings;
}

export default function A4Document({ document, company }: A4DocumentProps) {
  const documentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(0.85);
  const [isExporting, setIsExporting] = useState(false);
  const [renderType, setRenderType] = useState<DocumentType>(document.type);

  useEffect(() => {
    setRenderType(document.type);
  }, [document.id, document.type]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const safeWidth = containerWidth - 24;
        if (safeWidth < 794) {
          const autoZoom = Number((safeWidth / 794).toFixed(2));
          setZoom(Math.max(0.3, autoZoom));
        } else {
          setZoom(0.85);
        }
      }
    };

    const timer = setTimeout(handleResize, 50);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [document.id]);

  const handleDownloadJPG = async () => {
    if (!documentRef.current) return;
    setIsExporting(true);

    const sheetEl = documentRef.current;

    // Tailwind v4 uses oklch() colors. html2canvas reads getComputedStyle which
    // returns the already-resolved oklch() string — it cannot parse that.
    // Fix: iterate every element BEFORE html2canvas runs, use a 1×1 offscreen
    // canvas (which the browser CAN resolve oklch on) to convert every color to
    // a plain rgba() string, apply it as an inline style, then restore afterwards.
    const tempCanvas = window.document.createElement('canvas');
    tempCanvas.width = 1;
    tempCanvas.height = 1;
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
      } catch {
        return color;
      }
    };

    const COLOR_PROPS = [
      'color', 'backgroundColor',
      'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor',
      'outlineColor', 'textDecorationColor',
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
          const clonedSheet = clonedDoc.getElementById('a4-sheet');
          if (clonedSheet) {
            clonedSheet.style.transform = 'none';
            clonedSheet.style.width = '794px';
            clonedSheet.style.height = '1123px';
            clonedSheet.style.boxShadow = 'none';
            clonedSheet.style.border = 'none';
            clonedSheet.style.margin = '0';
            clonedSheet.style.padding = '48px';

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
      link.style.display = 'none';
      const filename = `${renderType.toUpperCase()}_${document.number || 'DOC'}.jpg`;
      
      link.download = filename;
      link.href = blobUrl;
      
      window.document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        window.document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 150);
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert(`Não foi possível gerar o JPG: ${errorMsg}`);
    } finally {
      // Restore all inline styles that were overridden
      for (const { el, prop, original } of snapshots) {
        (el.style as never)[prop] = original;
      }
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    try {
      window.focus();
      window.print();
    } catch (error) {
      console.error('Erro ao acionar impressão:', error);
      alert('A função de impressão foi bloqueada. Por favor, use Ctrl+P ou clique com botão direito e selecione "Imprimir".');
    }
  };

  const typeLabels = {
    orcamento: { title: 'ORÇAMENTO', color: 'border-blue-600 text-blue-700 bg-blue-50/50' },
    ordem_servico: { title: 'ORDEM DE SERVIÇO', color: 'border-indigo-600 text-indigo-700 bg-indigo-50/50' },
    laudo_tecnico: { title: 'LAUDO TÉCNICO', color: 'border-emerald-600 text-emerald-700 bg-emerald-50/50' },
    recibo: { title: 'RECIBO', color: 'border-amber-600 text-amber-700 bg-amber-50/50' },
  };

  const docStyle = typeLabels[renderType];

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Dynamic Template Selector Bar */}
      <div className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs no-print">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Opções de Impressão / Emissão:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
          {[
            { id: 'orcamento', label: 'Orçamento', icon: FileText, color: 'text-blue-600', activeBg: 'bg-white text-blue-700 shadow-sm' },
            { id: 'ordem_servico', label: 'Ordem de Serviço', icon: FileCheck, color: 'text-indigo-600', activeBg: 'bg-white text-indigo-700 shadow-sm' },
            { id: 'laudo_tecnico', label: 'Laudo Técnico', icon: ShieldCheck, color: 'text-emerald-600', activeBg: 'bg-white text-emerald-700 shadow-sm' },
            { id: 'recibo', label: 'Recibo', icon: Receipt, color: 'text-amber-600', activeBg: 'bg-white text-amber-700 shadow-sm' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = renderType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRenderType(tab.id as DocumentType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? tab.activeBg
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? '' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Document Actions Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-md no-print">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center p-1.5 bg-slate-800 rounded-lg">
            {renderType === 'orcamento' && <FileText className="h-5 w-5 text-blue-400" />}
            {renderType === 'ordem_servico' && <FileCheck className="h-5 w-5 text-indigo-400" />}
            {renderType === 'laudo_tecnico' && <ShieldCheck className="h-5 w-5 text-emerald-400" />}
            {renderType === 'recibo' && <Receipt className="h-5 w-5 text-amber-400" />}
          </span>
          <div>
            <h4 className="text-sm font-semibold tracking-wide">Visualização da Folha A4</h4>
            <p className="text-xs text-slate-400">Pronto para imprimir ou baixar como JPG</p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-3 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
          <button 
            onClick={() => setZoom(Math.max(0.5, zoom - 0.05))}
            className="p-1 hover:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs font-mono font-medium min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button 
            onClick={() => setZoom(Math.min(1.3, zoom + 0.05))}
            className="p-1 hover:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
            disabled={zoom >= 1.3}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Imprimir (PDF)
          </button>
          <button
            onClick={handleDownloadJPG}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md disabled:bg-slate-600 disabled:text-slate-400 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Processando JPG...' : 'Baixar JPG (A4)'}
          </button>
        </div>
      </div>

      {/* A4 Page Container */}
      <div 
        ref={containerRef}
        className="w-full overflow-x-auto py-6 bg-slate-100 border border-slate-200 rounded-2xl flex justify-center shadow-inner"
      >
        <div 
          className="relative"
          style={{ 
            height: `${1123 * zoom}px`,
            width: `${794 * zoom}px`,
          }}
        >
          <div 
            className="transition-transform duration-150 ease-out absolute top-0 left-0"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              width: '794px',
              height: '1123px',
            }}
          >
            {/* Real A4 Sheet (210mm x 297mm) -> represented as 794px by 1123px */}
            <div 
              ref={documentRef}
              id="a4-sheet"
              className="w-[794px] h-[1123px] bg-white text-slate-900 p-12 flex flex-col justify-between shadow-2xl relative select-text"
              style={{
                fontFamily: '"Inter", sans-serif',
                boxSizing: 'border-box'
              }}
            >
            <div className="flex flex-col gap-6">
              {/* Company Header Block */}
              <div className="flex items-start justify-between border-b-2 border-slate-200 pb-5">
                <div className="flex items-center gap-4">
                  {company.logoText ? (
                    <div className="h-14 w-14 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-2xl tracking-wider">
                      {company.logoText}
                    </div>
                  ) : (
                    <div className="h-14 w-14 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-2xl tracking-wider">
                      DOC
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900 uppercase">{company.name}</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">CNPJ: {company.cnpj}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{company.address}</p>
                    <p className="text-xs text-slate-400">{company.phone} • {company.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`inline-block px-4 py-1.5 border rounded-lg font-bold text-sm tracking-widest ${docStyle.color}`}>
                    {docStyle.title}
                  </div>
                  <div className="mt-2 text-xs font-mono text-slate-500 space-y-0.5">
                    <p className="font-semibold text-slate-700">Nº {document.number}</p>
                    <p>Emissão: {formatDate(document.date)}</p>
                    {document.dueDate && <p className="text-red-600 font-semibold">Vencimento: {formatDate(document.dueDate)}</p>}
                  </div>
                </div>
              </div>

              {/* Client Info Block */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <User className="h-3.5 w-3.5" />
                  Informações do Cliente
                </h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Nome / Razão Social:</span>
                    <span className="font-semibold text-slate-800 text-[13px]">{document.client.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">CPF / CNPJ:</span>
                    <span className="font-semibold text-slate-800 text-[13px]">{document.client.document || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Telefone:</span>
                    <span className="font-semibold text-slate-800">{document.client.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">E-mail:</span>
                    <span className="font-semibold text-slate-800 truncate block">{document.client.email || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Endereço Completo:</span>
                    <span className="font-semibold text-slate-800">{document.client.address || '-'}</span>
                  </div>
                </div>
              </div>

              {/* ORÇAMENTO or ORDEM DE SERVIÇO */}
              {(renderType === 'orcamento' || renderType === 'ordem_servico') && (
                <>
                  {renderType === 'ordem_servico' && (document.equipment || document.serialNumber) && (
                    <div className="grid grid-cols-2 gap-4 border border-indigo-100 bg-indigo-50/20 rounded-xl p-4 text-xs">
                      <div className="col-span-2 flex items-center justify-between border-b border-indigo-100 pb-1.5">
                        <span className="font-bold text-indigo-800 tracking-wider uppercase flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Detalhes do Equipamento / Objeto
                        </span>
                        {document.status && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            document.status === 'Concluído' ? 'bg-emerald-100 text-emerald-800' :
                            document.status === 'Em Andamento' ? 'bg-amber-100 text-amber-800' :
                            document.status === 'Pendente' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            OS: {document.status}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 block">Equipamento/Objeto:</span>
                        <span className="font-semibold text-slate-800">{document.equipment || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Nº de Série / Identificação:</span>
                        <span className="font-semibold text-slate-800">{document.serialNumber || '-'}</span>
                      </div>
                      {document.defect && (
                        <div className="col-span-2 border-t border-dashed border-slate-200 pt-2">
                          <span className="text-slate-400 block font-semibold text-[11px] uppercase">Problema/Sintoma relatado pelo cliente:</span>
                          <span className="text-slate-700 block italic leading-relaxed">{document.defect}</span>
                        </div>
                      )}
                      {document.solution && (
                        <div className="col-span-2 border-t border-dashed border-slate-200 pt-2">
                          <span className="text-slate-400 block font-semibold text-[11px] uppercase text-emerald-700">Solução Executada / Diagnóstico:</span>
                          <span className="text-slate-800 block font-medium leading-relaxed">{document.solution}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Items list Table */}
                  <div className="flex-1 min-h-[300px]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-300 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-2">Descrição do Produto / Serviço</th>
                          <th className="py-2.5 px-2 text-center w-24">Tipo</th>
                          <th className="py-2.5 px-2 text-center w-16">Qtd</th>
                          <th className="py-2.5 px-2 text-right w-28">V. Unitário</th>
                          <th className="py-2.5 px-2 text-right w-28">V. Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {document.items.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                              Nenhum item adicionado a este documento.
                            </td>
                          </tr>
                        ) : (
                          document.items.map((item, index) => (
                            <tr key={item.id + index} className="hover:bg-slate-50/50">
                              <td className="py-3 px-2 font-medium text-slate-900">{item.name}</td>
                              <td className="py-3 px-2 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  item.type === 'produto' ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'
                                }`}>
                                  {item.type}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center">{item.quantity}</td>
                              <td className="py-3 px-2 text-right font-mono">{formatCurrency(item.price)}</td>
                              <td className="py-3 px-2 text-right font-semibold text-slate-900 font-mono">{formatCurrency(item.total)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals Box */}
                  <div className="border-t-2 border-slate-200 pt-4 flex justify-end">
                    <div className="w-64 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal Geral:</span>
                        <span className="font-semibold font-mono">{formatCurrency((document.totalAmount || 0) + (document.discount || 0))}</span>
                      </div>
                      {document.discount && document.discount > 0 ? (
                        <div className="flex justify-between text-red-600">
                          <span>Desconto concedido:</span>
                          <span className="font-semibold font-mono">-{formatCurrency(document.discount)}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between text-[14px] font-bold border-t border-slate-200 pt-2 text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border">
                        <span>Valor Total:</span>
                        <span className="font-mono">{formatCurrency(document.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* LAUDO TÉCNICO */}
              {renderType === 'laudo_tecnico' && (
                <div className="space-y-6 text-xs text-slate-800 leading-relaxed">
                  <div className="grid grid-cols-2 gap-4 bg-emerald-50/20 border border-emerald-100 rounded-xl p-4">
                    <div>
                      <span className="text-slate-400 block font-bold tracking-wider uppercase text-[10px]">Equipamento / Objeto Periciado</span>
                      <span className="text-[13px] font-semibold text-slate-800">{document.equipment || 'Não especificado'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold tracking-wider uppercase text-[10px]">Número de Série</span>
                      <span className="text-[13px] font-semibold text-slate-800">{document.serialNumber || 'Não especificado'}</span>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-5 bg-white">
                    <h4 className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-2 border-b pb-1">
                      1. Constatações & Análise Técnica Detalhada
                    </h4>
                    <p className="whitespace-pre-line text-[12px] font-normal text-slate-700 leading-relaxed">
                      {document.technicalAnalysis || 'Nenhuma constatação técnica registrada.'}
                    </p>
                  </div>

                  <div className="border border-emerald-100 rounded-xl p-5 bg-emerald-50/10">
                    <h4 className="text-[11px] font-bold tracking-widest uppercase text-emerald-800 mb-2 border-b border-emerald-100 pb-1">
                      2. Conclusão Pericial & Recomendações
                    </h4>
                    <p className="whitespace-pre-line text-[12px] font-medium text-slate-800 leading-relaxed">
                      {document.conclusion || 'Nenhuma conclusão técnica registrada.'}
                    </p>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <div className="w-80 border border-slate-200 rounded-xl p-4 bg-slate-50 text-center">
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Responsável Técnico Habilitado</p>
                      <div className="mt-4 border-b border-slate-400 mx-4"></div>
                      <p className="mt-2 text-xs font-bold text-slate-800">{document.responsavelTecnico || 'Nome do Profissional'}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{document.registroProfissional || 'CREA / CFT / CRM'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* RECIBO */}
              {renderType === 'recibo' && (
                <div className="space-y-8 my-6 text-slate-800 leading-relaxed">
                  <div className="border-4 border-double border-slate-200 bg-slate-50 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Importância Recebida</p>
                      <h1 className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight mt-1">
                        {formatCurrency(document.receivedValue || document.totalAmount)}
                      </h1>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-md font-mono font-bold">
                        RECIBO Nº {document.number}
                      </span>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-2xl p-8 bg-white shadow-xs text-sm space-y-5 leading-relaxed">
                    <p className="text-[15px] font-normal text-slate-800 text-justify">
                      Recebemos de <strong className="text-slate-900 font-semibold">{document.client.name}</strong>, 
                      inscrito no CPF/CNPJ sob o nº <strong className="text-slate-900 font-mono">{document.client.document || 'Não especificado'}</strong>, 
                      a importância de <strong className="text-slate-900 font-semibold">{formatCurrency(document.receivedValue || document.totalAmount)}</strong> 
                      (<span className="italic text-slate-600 font-medium">{valorPorExtenso(document.receivedValue || document.totalAmount)}</span>), 
                      referente a:
                    </p>

                    <div className="bg-slate-50 border-l-4 border-slate-500 p-4 rounded-r-xl italic text-slate-700 text-[13px] font-medium leading-relaxed">
                      {document.referringTo || 'Especificação do produto ou serviço prestado.'}
                    </div>

                    <p className="text-slate-600 text-xs">
                      Dando-lhe por este meio plena, geral e irrevogável quitação do valor recebido para todos os efeitos legais.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-8">
                    <div>
                      <span className="text-slate-400 block text-xs">Local e Data:</span>
                      <strong className="text-slate-800 text-xs block mt-1">São Paulo - SP, {formatDate(document.date)}</strong>
                    </div>
                    <div className="text-center">
                      <div className="border-b border-slate-400 mx-4 h-10"></div>
                      <span className="text-[11px] font-semibold text-slate-800 block mt-2">{document.issuerName || company.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">CNPJ: {document.issuerDocument || company.cnpj}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Observations for all documents except Recibo */}
              {renderType !== 'recibo' && document.observations && (
                <div className="border-t border-slate-200 pt-4 text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block mb-1">Observações Importantes / Termos:</span>
                  <p className="text-slate-600 italic leading-relaxed whitespace-pre-line">{document.observations}</p>
                </div>
              )}
            </div>

            {/* Signature Blocks */}
            {renderType !== 'recibo' && (
              <div className="border-t border-slate-200 pt-8 grid grid-cols-2 gap-12 text-center text-[11px]">
                <div className="flex flex-col justify-end">
                  <div className="border-b border-slate-300 mx-6 mb-2"></div>
                  <span className="font-semibold text-slate-800">{document.client.name}</span>
                  <span className="text-slate-400">Assinatura do Cliente</span>
                </div>
                <div className="flex flex-col justify-end">
                  <div className="border-b border-slate-300 mx-6 mb-2"></div>
                  <span className="font-semibold text-slate-800">{renderType === 'laudo_tecnico' ? (document.responsavelTecnico || 'Responsável Técnico') : company.name}</span>
                  <span className="text-slate-400">{renderType === 'laudo_tecnico' ? 'Perito Responsável' : 'Responsável / Emitente'}</span>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
