'use client';

import React from 'react';
import { Customer, CreditStatus } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MoreHorizontal, FileText, ExternalLink } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
}

export function CustomerTable({ customers, onEdit }: CustomerTableProps) {
  const getStatusColor = (status: CreditStatus) => {
    switch (status) {
      case CreditStatus.APROVADO: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case CreditStatus.REPROVADO: return 'bg-red-100 text-red-700 border-red-200';
      case CreditStatus.EM_ANALISE: return 'bg-blue-100 text-blue-700 border-blue-200';
      case CreditStatus.PRE_APROVADO: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case CreditStatus.DOCUMENTACAO_PENDENTE: return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Empreendimento</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Renda</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor Financiado</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {customers.map((customer) => (
            <tr 
              key={customer.id} 
              onClick={() => onEdit(customer)}
              className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.cpf}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-700 font-medium">{customer.project}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex -space-x-1">
                    {['RG', 'CPF', 'COMPROVANTE_RENDA', 'IRPF', 'EXTRATO_FGTS'].map((type) => {
                      const isPresent = customer.documents.some(d => d.type === type);
                      return (
                        <div 
                          key={type}
                          title={type}
                          className={`w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[6px] font-bold ${isPresent ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                        >
                          {type[0]}
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {customer.documents.filter(d => ['RG', 'CPF', 'COMPROVANTE_RENDA', 'IRPF', 'EXTRATO_FGTS'].includes(d.type)).length}/5
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-gray-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(customer.income)}
                </p>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-bold text-indigo-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(customer.financedValue)}
                </p>
                <p className="text-[10px] text-gray-400">
                  {Math.round((customer.financedValue / customer.propertyValue) * 100)}% do valor total
                </p>
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(customer.status)}`}>
                  {customer.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-700">{format(new Date(customer.createdAt), 'dd/MM/yyyy')}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-tighter font-medium">Cadastrado</p>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                  <MoreHorizontal size={18} />
                </button>
              </td>
            </tr>
          ))}
          {customers.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                Nenhum cliente encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
