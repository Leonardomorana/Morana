import { Type } from "@google/genai";

export enum CreditStatus {
  NOVO_CADASTRO = "Novo Cadastro",
  DOCUMENTACAO_PENDENTE = "Documentação Pendente",
  DOCUMENTACAO_COMPLETA = "Documentação Completa",
  EM_ANALISE = "Em Análise",
  PRE_APROVADO = "Pré Aprovado",
  ENVIADO_AO_BANCO = "Enviado ao Banco",
  APROVADO = "Aprovado",
  REPROVADO = "Reprovado",
  ASSINATURA = "Assinatura"
}

export type UserRole = 'admin' | 'analyst' | 'broker';

export interface Broker {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  password?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: "RG" | "CPF" | "COMPROVANTE_RENDA" | "IRPF" | "EXTRATO_FGTS" | "OUTROS";
  url: string;
  uploadedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  cpf: string;
  income: number;
  project: string;
  unit: string;
  propertyValue: number;
  financedValue: number;
  status: CreditStatus;
  createdAt: string;
  updatedAt: string;
  analyst: string;
  brokerId: string;
  brokerName: string;
  documents: Document[];
  statusHistory: {
    status: CreditStatus;
    timestamp: string;
  }[];
}

export const STATUS_ORDER: CreditStatus[] = [
  CreditStatus.NOVO_CADASTRO,
  CreditStatus.DOCUMENTACAO_PENDENTE,
  CreditStatus.DOCUMENTACAO_COMPLETA,
  CreditStatus.EM_ANALISE,
  CreditStatus.PRE_APROVADO,
  CreditStatus.ENVIADO_AO_BANCO,
  CreditStatus.APROVADO,
  CreditStatus.REPROVADO,
  CreditStatus.ASSINATURA
];
