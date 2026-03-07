'use client';

import React, { useMemo } from 'react';
import { Customer, CreditStatus } from '@/lib/types';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Users,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
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
import { differenceInDays } from 'date-fns';

interface DashboardStatsProps {
  customers: Customer[];
}

export function DashboardStats({ customers }: DashboardStatsProps) {
  const stats = useMemo(() => {
    const total = customers.length;
    const approved = customers.filter(c => c.status === CreditStatus.APROVADO).length;
    const rejected = customers.filter(c => c.status === CreditStatus.REPROVADO).length;
    const inProgress = customers.filter(c => ![CreditStatus.APROVADO, CreditStatus.REPROVADO].includes(c.status)).length;
    
    const approvedVolume = customers
      .filter(c => c.status === CreditStatus.APROVADO)
      .reduce((acc, curr) => acc + curr.financedValue, 0);

    const approvalRate = total > 0 ? (approved / (approved + rejected || 1)) * 100 : 0;

    // Average analysis time (from NOVO_CADASTRO to APROVADO/REPROVADO)
    const completedAnalyses = customers.filter(c => 
      [CreditStatus.APROVADO, CreditStatus.REPROVADO].includes(c.status)
    );
    
    const avgTime = completedAnalyses.length > 0 
      ? completedAnalyses.reduce((acc, curr) => {
          const start = new Date(curr.createdAt);
          const end = new Date(curr.updatedAt);
          return acc + Math.max(0, differenceInDays(end, start));
        }, 0) / completedAnalyses.length
      : 0;

    return {
      total,
      approved,
      inProgress,
      approvedVolume,
      approvalRate,
      avgTime: Math.round(avgTime)
    };
  }, [customers]);

  const chartData = useMemo(() => {
    const statusCounts = customers.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [customers]);

  const volumeData = useMemo(() => {
    // Group by project
    const projectVolume = customers.reduce((acc, curr) => {
      acc[curr.project] = (acc[curr.project] || 0) + curr.financedValue;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(projectVolume).map(([name, value]) => ({ name, value }));
  }, [customers]);

  const brokerData = useMemo(() => {
    const brokerVolume = customers.reduce((acc, curr) => {
      acc[curr.brokerName] = (acc[curr.brokerName] || 0) + curr.financedValue;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(brokerVolume).map(([name, value]) => ({ name, value }));
  }, [customers]);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total de Clientes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Taxa de Aprovação</p>
            <p className="text-2xl font-bold text-gray-900">{stats.approvalRate.toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tempo Médio (Dias)</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgTime} dias</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Crédito Aprovado</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(stats.approvedVolume)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-indigo-600" />
              Distribuição por Status
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <PieChartIcon size={20} className="text-indigo-600" />
              Volume por Empreendimento
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={volumeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {volumeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => 
                    typeof value === 'number' 
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                      : value
                  }
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Broker Volume Chart (Only if multiple brokers present) */}
      {brokerData.length > 1 && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-indigo-600" />
              Volume por Corretor
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brokerData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} width={120} />
                <Tooltip 
                  formatter={(value: any) => 
                    typeof value === 'number' 
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                      : value
                  }
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                  {brokerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
