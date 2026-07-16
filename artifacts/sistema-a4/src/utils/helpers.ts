import { Product, Service, CompanySettings, DocumentData } from '../types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const generateUUID = (): string => {
  return 'doc-' + Math.random().toString(36).substr(2, 9);
};

export const defaultCompany: CompanySettings = {
  name: 'TechSolutions Assistência e Comércio',
  cnpj: '12.345.678/0001-90',
  phone: '(11) 98765-4321',
  email: 'contato@techsolutions.com',
  address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  website: 'www.techsolutions.com',
  logoText: 'TS',
};

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'SSD 480GB Kingston',
    description: 'SSD Kingston A400 SATA 3 2.5 Polegadas',
    price: 249.90,
    unit: 'Unidade',
  },
  {
    id: 'prod-2',
    name: 'Memória RAM DDR4 8GB Kingston',
    description: 'Memória RAM HyperX Fury 2666MHz DDR4 CL16',
    price: 189.00,
    unit: 'Unidade',
  },
  {
    id: 'prod-3',
    name: 'Pasta Térmica Arctic MX-4 4g',
    description: 'Pasta térmica de alta performance para CPUs e GPUs',
    price: 59.90,
    unit: 'Unidade',
  },
  {
    id: 'prod-4',
    name: 'Cabo de Rede Cat5e (Metro)',
    description: 'Cabo de rede trançado azul para internet cabo',
    price: 2.50,
    unit: 'Metro',
  },
];

export const initialServices: Service[] = [
  {
    id: 'serv-1',
    name: 'Formatação e Instalação de Sistema Operacional',
    description: 'Backup completo dos dados, instalação de Windows ou Linux com drivers e softwares básicos.',
    price: 150.00,
    category: 'Software',
  },
  {
    id: 'serv-2',
    name: 'Limpeza Física e Troca de Pasta Térmica',
    description: 'Desmontagem completa, limpeza dos coolers, desoxidação preventiva dos contatos e aplicação de pasta térmica de alta qualidade.',
    price: 120.00,
    category: 'Hardware',
  },
  {
    id: 'serv-3',
    name: 'Recuperação de Dados de HD/SSD',
    description: 'Análise de integridade de partição e extração de arquivos perdidos por formatação acidental ou falhas lógicas.',
    price: 350.00,
    category: 'Software',
  },
  {
    id: 'serv-4',
    name: 'Consultoria e Configuração de Rede Wi-Fi',
    description: 'Estudo de cobertura, configuração de roteadores/repetidores de sinal e otimização de banda.',
    price: 200.00,
    category: 'Redes',
  },
];

export const sampleDocuments: DocumentData[] = [
  {
    id: 'sample-doc-1',
    type: 'orcamento',
    number: '2026-0001',
    date: '2026-07-15',
    dueDate: '2026-07-22',
    client: {
      name: 'Carlos Alberto Silva',
      document: '123.456.789-00',
      phone: '(11) 99999-8888',
      email: 'carlos.alberto@email.com',
      address: 'Rua das Flores, 123 - Jardim Primavera, São Paulo - SP',
    },
    items: [
      { id: 'prod-1', name: 'SSD 480GB Kingston', type: 'produto', quantity: 1, price: 249.90, total: 249.90 },
      { id: 'serv-1', name: 'Formatação e Instalação de OS', type: 'servico', quantity: 1, price: 150.00, total: 150.00 },
    ],
    totalAmount: 399.90,
    discount: 20.00,
    observations: 'Orçamento válido por 7 dias. Pagamento facilitado em até 3x sem juros no cartão de crédito.',
  },
  {
    id: 'sample-doc-2',
    type: 'ordem_servico',
    number: '2026-0002',
    date: '2026-07-15',
    client: {
      name: 'Mariana Costa Oliveira',
      document: '987.654.321-11',
      phone: '(11) 98888-7777',
      email: 'mariana.costa@email.com',
      address: 'Alameda Santos, 456 - Cerqueira César, São Paulo - SP',
    },
    items: [
      { id: 'serv-2', name: 'Limpeza Física e Troca de Pasta Térmica', type: 'servico', quantity: 1, price: 120.00, total: 120.00 },
      { id: 'prod-3', name: 'Pasta Térmica Arctic MX-4 4g', type: 'produto', quantity: 1, price: 59.90, total: 59.90 },
    ],
    totalAmount: 179.90,
    status: 'Em Andamento',
    equipment: 'Notebook Dell Inspiron 15',
    serialNumber: 'BR-81X29-9A8',
    defect: 'Superaquecendo e desligando após 20 minutos de uso intenso.',
    solution: 'Desmontagem completa realizada, limpeza das saídas de ar obstruídas por poeira e substituição da pasta térmica ressecada por Arctic MX-4.',
    observations: 'Garantia de 90 dias sobre o serviço executado.',
  },
  {
    id: 'sample-doc-3',
    type: 'laudo_tecnico',
    number: '2026-0003',
    date: '2026-07-15',
    client: {
      name: 'Imobiliária Prime LTDA',
      document: '22.333.444/0001-55',
      phone: '(11) 3333-4444',
      email: 'financeiro@primeimobiliaria.com',
      address: 'Rua Bela Cintra, 800 - Consolação, São Paulo - SP',
    },
    items: [],
    totalAmount: 0,
    equipment: 'Servidor Torre HP ProLiant ML30',
    serialNumber: 'HP-ML30-77189X',
    technicalAnalysis: 'O equipamento deu entrada em laboratório sem ligar (nenhum sinal de energia nos LEDs). Após a desmontagem e testes com multímetro e osciloscópio na fonte de alimentação de 350W ATX, foi constatada a queima de capacitores de filtro secundário e rompimento do fusível principal devido a um surto elétrico (sobretensão na rede elétrica). A placa-mãe foi testada com fonte sobressalente e encontra-se operacional.',
    conclusion: 'Laudo técnico conclui que houve queima da fonte de alimentação devido a oscilações da rede elétrica local. Recomenda-se a substituição da fonte HP ML30 por uma original nova, e o uso de um no-break senoidal de ao menos 1200VA para proteger o servidor contra novos surtos.',
    responsavelTecnico: 'Eng. Roberto Albuquerque de Souza',
    registroProfissional: 'CREA-SP: 506.123.456-9',
    observations: 'Este documento possui validade jurídica para fins de sinistro junto à seguradora ou concessionária de energia.',
  },
  {
    id: 'sample-doc-4',
    type: 'recibo',
    number: '2026-0004',
    date: '2026-07-15',
    client: {
      name: 'Felipe Mendes Araújo',
      document: '444.555.666-77',
      phone: '(11) 97777-6666',
      email: 'felipe.mendes@email.com',
      address: 'Rua Augusta, 1500 - Consolação, São Paulo - SP',
    },
    items: [],
    totalAmount: 350.00,
    receivedValue: 350.00,
    referringTo: 'Serviço de Recuperação de Dados de SSD de 240GB Kingston contendo fotos familiares e arquivos de trabalho.',
    issuerName: 'TechSolutions Assistência e Comércio',
    issuerDocument: '12.345.678/0001-90',
    observations: 'Recebimento efetuado integralmente via PIX na data especificada.',
  }
];

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
      if (c === 1 && d === 0 && u === 0) {
        output += 'cem';
      } else {
        output += centenas[c];
      }
    }

    if (d > 0 || u > 0) {
      if (output !== '') output += ' e ';
      if (d === 1) {
        output += dezenove[u];
      } else {
        output += dezenas[d];
        if (u > 0) {
          output += ' e ' + unidades[u];
        }
      }
    }

    return output;
  };

  const partes = [];
  const reais = Math.floor(valor);
  const centavos = Math.round((valor - reais) * 100);

  if (reais > 0) {
    const mi = Math.floor(reais / 1000000);
    const mil = Math.floor((reais % 1000000) / 1000);
    const uni = reais % 1000;

    if (mi > 0) {
      partes.push(converterGrupo(mi) + (mi === 1 ? ' milhão' : ' milhões'));
    }
    if (mil > 0) {
      partes.push(converterGrupo(mil) + ' mil');
    }
    if (uni > 0) {
      partes.push(converterGrupo(uni));
    }

    const reaisTexto = reais === 1 ? 'real' : 'reais';
    partes.push(reaisTexto);
  }

  const resultadoReais = partes.join(', ').replace(/, ([^,]*)$/, ' e $1');

  if (centavos > 0) {
    const centavosTexto = centavos === 1 ? 'centavo' : 'centavos';
    const centavosPorExtenso = converterGrupo(centavos) + ' ' + centavosTexto;
    if (reais > 0) {
      return `${resultadoReais} e ${centavosPorExtenso}`;
    } else {
      return centavosPorExtenso;
    }
  }

  return resultadoReais;
};
