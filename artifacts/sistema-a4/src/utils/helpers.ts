// ─── Formatting Utilities ────────────────────────────────────────────────────

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// ─── Value in Full (Extenso) ─────────────────────────────────────────────────

export const valorPorExtenso = (valor: number): string => {
  if (valor === 0) return 'zero reais';

  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dezenas = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const dezenove = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  const converterGrupo = (n: number): string => {
    let output = '';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (c > 0) {
      output += (c === 1 && d === 0 && u === 0) ? 'cem' : centenas[c];
    }
    if (d > 0 || u > 0) {
      if (output !== '') output += ' e ';
      if (d === 1) {
        output += dezenove[u];
      } else {
        output += dezenas[d];
        if (u > 0) output += ' e ' + unidades[u];
      }
    }
    return output;
  };

  const partes: string[] = [];
  const reais = Math.floor(valor);
  const centavos = Math.round((valor - reais) * 100);

  if (reais > 0) {
    const mi = Math.floor(reais / 1000000);
    const mil = Math.floor((reais % 1000000) / 1000);
    const uni = reais % 1000;
    if (mi > 0) partes.push(converterGrupo(mi) + (mi === 1 ? ' milhão' : ' milhões'));
    if (mil > 0) partes.push(converterGrupo(mil) + ' mil');
    if (uni > 0) partes.push(converterGrupo(uni));
    partes.push(reais === 1 ? 'real' : 'reais');
  }

  const resultadoReais = partes.join(', ').replace(/, ([^,]*)$/, ' e $1');

  if (centavos > 0) {
    const centavosTexto = centavos === 1 ? 'centavo' : 'centavos';
    const centavosPorExtenso = converterGrupo(centavos) + ' ' + centavosTexto;
    return reais > 0 ? `${resultadoReais} e ${centavosPorExtenso}` : centavosPorExtenso;
  }

  return resultadoReais;
};
