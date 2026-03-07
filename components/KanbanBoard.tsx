'use client';

import React from 'react';
import { 
  CreditStatus, 
  Customer, 
  STATUS_ORDER 
} from '@/lib/types';
import { motion } from 'motion/react';
import { MoreVertical, Clock, FileText, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface KanbanBoardProps {
  customers: Customer[];
  onUpdateStatus: (id: string, updates: Partial<Customer>) => void;
  onEdit: (customer: Customer) => void;
}

export function KanbanBoard({ customers, onUpdateStatus, onEdit }: KanbanBoardProps) {
  const getCustomersByStatus = (status: CreditStatus) => {
    return customers.filter(c => c.status === status);
  };

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-4 min-w-max">
      {STATUS_ORDER.map((status) => (
        <div key={status} className="w-80 flex flex-col shrink-0">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{status}</h3>
              <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {getCustomersByStatus(status).length}
              </span>
            </div>
          </div>

          <div className="flex-1 bg-gray-100/50 rounded-2xl p-3 space-y-3 min-h-[500px] border border-gray-200/50">
            {getCustomersByStatus(status).map((customer) => (
              <motion.div
                layoutId={customer.id}
                key={customer.id}
                onClick={() => onEdit(customer)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{customer.name}</h4>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Empreendimento:</span>
                    <span className="font-medium text-gray-700">{customer.project}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Valor:</span>
                    <span className="font-bold text-indigo-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(customer.propertyValue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400">Corretor:</span>
                    <span className="font-medium text-gray-600">{customer.brokerName}</span>
                  </div>
                  
                  {/* Document Progress */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-gray-400 uppercase font-bold tracking-tighter">Documentação</span>
                      <span className="text-gray-600 font-bold">
                        {Math.round((customer.documents.filter(d => ['RG', 'CPF', 'COMPROVANTE_RENDA', 'IRPF', 'EXTRATO_FGTS'].includes(d.type)).length / 5) * 100)}%
                      </span>
                    </div>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-500" 
                        style={{ width: `${(customer.documents.filter(d => ['RG', 'CPF', 'COMPROVANTE_RENDA', 'IRPF', 'EXTRATO_FGTS'].includes(d.type)).length / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <FileText size={12} />
                      {customer.documents.length}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Clock size={12} />
                      {formatDistanceToNow(new Date(customer.updatedAt), { addSuffix: true, locale: ptBR })}
                    </div>
                  </div>
                  
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                    {customer.analyst.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {getCustomersByStatus(status).length === 0 && (
              <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
                <p className="text-xs text-gray-400 italic">Nenhum cliente</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
