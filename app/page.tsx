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

import { Customer, CreditStatus, STATUS_ORDER, Broker, UserRole } from '@/lib/types';
import { CustomerModal } from '@/components/CustomerModal';
import { KanbanBoard } from '@/components/KanbanBoard';
import { CustomerTable } from '@/components/CustomerTable';
import { DashboardStats } from '@/components/DashboardStats';
import { BrokerManagement } from '@/components/BrokerManagement';
import { LogOut, LogIn, ShieldCheck } from 'lucide-react';

interface User {
  id: string;
  name: string;
  role: UserRole;
  password?: string;
}

const USERS: User[] = [
  { id: '1', name: 'Leonardo Morana', role: 'admin', password: '123' },
  { id: '2', name: 'Corretor João', role: 'broker', password: '123' },
  { id: '3', name: 'Corretora Maria', role: 'broker', password: '123' },
  { id: '4', name: 'Analista Júnior', role: 'analyst', password: '123' }
];

export default function CRMPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [view, setView] = useState<'dashboard' | 'table' | 'kanban' | 'brokers'>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // Load data from localStorage
  useEffect(() => {
    const savedCustomers = localStorage.getItem('crediflow_customers');
    if (savedCustomers) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCustomers(JSON.parse(savedCustomers));
      } catch (e) {
        console.error("Failed to parse customers", e);
      }
    }

    const savedBrokers = localStorage.getItem('crediflow_brokers');
    if (savedBrokers) {
      try {
        setBrokers(JSON.parse(savedBrokers));
      } catch (e) {
        console.error("Failed to parse brokers", e);
      }
    } else {
      // Initial brokers
      setBrokers([
        { id: '2', name: 'Corretor João', email: 'joao@imobiliaria.com', phone: '(11) 99999-1111', company: 'Imobiliária Central', status: 'active', createdAt: new Date().toISOString() },
        { id: '3', name: 'Corretora Maria', email: 'maria@vendas.com', phone: '(11) 99999-2222', company: 'Maria Imóveis', status: 'active', createdAt: new Date().toISOString() }
      ]);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('crediflow_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('crediflow_brokers', JSON.stringify(brokers));
  }, [brokers]);

  const filteredCustomers = useMemo(() => {
    let list = customers;
    
    // Filter by broker if current user is a broker
    if (currentUser?.role === 'broker') {
      list = list.filter(c => c.brokerId === currentUser.id);
    }

    return list.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cpf.includes(searchTerm) ||
      c.project.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm, currentUser]);

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
      analyst: "Leonardo Morana", 
      brokerId: currentUser?.id || '1',
      brokerName: currentUser?.name || 'Leonardo Morana',
      documents: data.documents || [],
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
    const headers = ["Nome", "CPF", "Renda", "Empreendimento", "Unidade", "Valor Imóvel", "Valor Financiado", "Status", "Data Cadastro", "Analista", "Corretor"];
    const rows = filteredCustomers.map(c => [
      c.name,
      c.cpf,
      c.income.toString(),
      c.project,
      c.unit,
      c.propertyValue.toString(),
      c.financedValue.toString(),
      c.status,
      format(new Date(c.createdAt), 'dd/MM/yyyy'),
      c.analyst,
      c.brokerName
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

  const handleAddBroker = (data: Omit<Broker, 'id' | 'createdAt'>) => {
    const newBroker: Broker = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setBrokers(prev => [...prev, newBroker]);
  };

  const handleUpdateBroker = (id: string, updates: Partial<Broker>) => {
    setBrokers(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const handleDeleteBroker = (id: string) => {
    if (confirm('Deseja realmente excluir este corretor?')) {
      setBrokers(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleResetPassword = (id: string) => {
    const broker = brokers.find(b => b.id === id);
    alert(`Senha do corretor ${broker?.name} redefinida para: 123`);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && password === (selectedUser.password || '123')) {
      setCurrentUser(selectedUser);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CrediFlow CRM</h1>
            <p className="text-gray-500 mt-2">
              {selectedUser ? `Bem-vindo, ${selectedUser.name}` : 'Selecione um perfil para acessar'}
            </p>
          </div>

          {!selectedUser ? (
            <div className="space-y-3">
              {USERS.map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user);
                    setLoginError(false);
                    setPassword('');
                  }}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold border border-gray-100">
                      {user.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        {user.role === 'admin' ? 'Administrador' : user.role === 'analyst' ? 'Analista' : 'Corretor'}
                      </p>
                    </div>
                  </div>
                  <LogIn size={20} className="text-gray-300 group-hover:text-indigo-600 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">Senha de Acesso</label>
                <input 
                  autoFocus
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className={`w-full px-4 py-3 bg-gray-50 border ${loginError ? 'border-red-500 ring-2 ring-red-500/10' : 'border-gray-200'} rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all`}
                />
                {loginError && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-wider">Senha incorreta. Tente novamente.</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setPassword('');
                    setLoginError(false);
                  }}
                  className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all"
                >
                  Voltar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] px-4 py-3 bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 rounded-2xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  Entrar <LogIn size={18} />
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-4">Dica: A senha padrão para todos é <span className="font-bold">123</span></p>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

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
          
          {(currentUser.role === 'admin' || currentUser.role === 'analyst') && (
            <button 
              onClick={() => setView('brokers')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'brokers' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <ShieldCheck size={20} />
              Gestão de Corretores
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
              {currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'analyst' ? 'Analista' : 'Corretor'}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role === 'admin' ? 'Master' : currentUser.role === 'analyst' ? 'Sênior' : 'Parceiro'}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => {
              setCurrentUser(null);
              setSelectedUser(null);
              setPassword('');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold transition-all"
          >
            <LogOut size={14} />
            Sair do Sistema
          </button>
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
            {view === 'brokers' && 'Gestão de Corretores'}
          </h1>

          <div className="flex items-center gap-4">
            {view !== 'brokers' && (
              <>
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
              </>
            )}
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
                <DashboardStats customers={filteredCustomers} />
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

            {view === 'brokers' && (
              <motion.div 
                key="brokers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <BrokerManagement 
                  brokers={brokers}
                  onAdd={handleAddBroker}
                  onUpdate={handleUpdateBroker}
                  onDelete={handleDeleteBroker}
                  onResetPassword={handleResetPassword}
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
        customer={selectedCustomer || (currentUser.role === 'broker' ? { 
          brokerId: currentUser.id, 
          brokerName: currentUser.name,
          status: CreditStatus.NOVO_CADASTRO,
          documents: []
        } as any : undefined)}
        brokers={brokers}
        canChangeBroker={currentUser.role === 'admin' || currentUser.role === 'analyst'}
      />
    </div>
  );
}
