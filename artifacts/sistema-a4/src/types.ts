export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string; // e.g., Unidade, Metro, Litro
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
}

export interface Client {
  name: string;
  document: string; // CPF or CNPJ
  phone: string;
  email: string;
  address: string;
}

export interface CompanySettings {
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  logoText?: string;
  logoUrl?: string;      // base64 image data URL of uploaded logo
  signature?: string;    // base64 PNG data URL of drawn signature
  useSignature?: boolean; // whether to show signature on documents
  documentTemplate?: 'classic' | 'pro'; // layout template selection
}

export type DocumentType = 'orcamento' | 'ordem_servico' | 'laudo_tecnico' | 'recibo';

export interface DocumentItem {
  id: string;
  name: string;
  type: 'produto' | 'servico';
  unit?: string; // e.g. Unidade, Metro, Quilo
  quantity: number;
  price: number;
  total: number;
}

export interface DocumentData {
  id: string;
  type: DocumentType;
  number: string;
  date: string;
  dueDate?: string;
  client: Client;
  items: DocumentItem[];
  totalAmount: number;
  discount?: number;
  observations?: string;
  
  // Ordem de Serviço Specific
  status?: 'Pendente' | 'Em Andamento' | 'Aprovado' | 'Concluído' | 'Cancelado';
  equipment?: string;
  serialNumber?: string;
  defect?: string;
  solution?: string;
  
  // Laudo Técnico Specific
  technicalAnalysis?: string;
  conclusion?: string;
  responsavelTecnico?: string;
  registroProfissional?: string;
  
  // Recibo Specific
  receivedValue?: number;
  referringTo?: string;
  issuerName?: string;
  issuerDocument?: string;
}
