'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Kanban as KanbanIcon, 
  Plus, 
  Search, 
  Download,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

import { Customer, CreditStatus, STATUS_ORDER } from '@/lib/types';
import { CustomerModal } from '@/components/CustomerModal';
import { KanbanBoard } from '@/components/KanbanBoard';
import { CustomerTable } from '@/components/CustomerTable';
import { DashboardStats } from '@/components/DashboardStats';

export default function CRMPage() {
  const [view, setView] = useState<'dashboard' | 'table' | 'kanban'>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('crediflow_customers');
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCustomers(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse customers", e);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('crediflow_customers', JSON.stringify(customers));
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cpf.includes(searchTerm) ||
      c.project.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const handleAddCustomer = (data: Partial<Customer>) => {
    const newCustomer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name!,
      cpf: data.cpf!,
      income: data.income!,
      project: data.project!,
      unit: data.unit!,
      propertyValue: data.propertyValue!,
      financedValue: data.financedValue!,
      status: CreditStatus.NOVO_CADASTRO,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analyst: "Leonardo Morana", // Default for demo
      documents: [],
      statusHistory: [{
        status: CreditStatus.NOVO_CADASTRO,
        timestamp: new Date().toISOString()
      }]
    };
    setCustomers(prev => [newCustomer, ...prev]);
    setIsModalOpen(false);
  };

  const handleUpdateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const newStatus = updates.status && updates.status !== c.status;
        const updatedHistory = newStatus 
          ? [...c.statusHistory, { status: updates.status!, timestamp: new Date().toISOString() }]
          : c.statusHistory;
        
        return { 
          ...c, 
          ...updates, 
          updatedAt: new Date().toISOString(),
          statusHistory: updatedHistory
        };
      }
      return c;
    }));
  };

  const exportToCSV = () => {
    const headers = ["Nome", "CPF", "Renda", "Empreendimento", "Unidade", "Valor Imóvel", "Valor Financiado", "Status", "Data Cadastro", "Analista"];
    const rows = customers.map(c => [
      c.name,
      c.cpf,
      c.income.toString(),
      c.project,
      c.unit,
      c.propertyValue.toString(),
      c.financedValue.toString(),
      c.status,
      format(new Date(c.createdAt), 'dd/MM/yyyy'),
      c.analyst
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `crediflow_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-bottom border-gray-100">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <TrendingUp size={20} />
            </div>
            <span>CrediFlow</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => setView('table')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'table' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Users size={20} />
            Clientes
          </button>
          <button 
            onClick={() => setView('kanban')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'kanban' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <KanbanIcon size={20} />
            Kanban
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Analista</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                LM
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Leonardo Morana</p>
                <p className="text-xs text-gray-500">Sênior</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-lg font-semibold text-gray-900">
            {view === 'dashboard' && 'Visão Geral'}
            {view === 'table' && 'Lista de Clientes'}
            {view === 'kanban' && 'Fluxo de Aprovação'}
          </h1>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar cliente, CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64"
              />
            </div>
            
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-all border border-gray-200"
            >
              <Download size={18} />
              Exportar
            </button>

            <button 
              onClick={() => {
                setSelectedCustomer(undefined);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium transition-all shadow-sm shadow-indigo-200"
            >
              <Plus size={18} />
              Novo Cliente
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <DashboardStats customers={customers} />
              </motion.div>
            )}

            {view === 'table' && (
              <motion.div 
                key="table"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CustomerTable 
                  customers={filteredCustomers} 
                  onEdit={(c) => {
                    setSelectedCustomer(c);
                    setIsModalOpen(true);
                  }}
                />
              </motion.div>
            )}

            {view === 'kanban' && (
              <motion.div 
                key="kanban"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full"
              >
                <KanbanBoard 
                  customers={filteredCustomers} 
                  onUpdateStatus={handleUpdateCustomer}
                  onEdit={(c) => {
                    setSelectedCustomer(c);
                    setIsModalOpen(true);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <CustomerModal 
        key={selectedCustomer?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={selectedCustomer ? (data) => handleUpdateCustomer(selectedCustomer.id, data) : handleAddCustomer}
        customer={selectedCustomer}
      />
    </div>
  );
}
