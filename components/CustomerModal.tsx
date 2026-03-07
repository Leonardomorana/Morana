'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, File, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import { Customer, CreditStatus, Document } from '@/lib/types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Customer>) => void;
  customer?: Customer;
}

export function CustomerModal({ isOpen, onClose, onSave, customer }: CustomerModalProps) {
  const [formData, setFormData] = useState<Partial<Customer>>(customer || {
    name: '',
    cpf: '',
    income: 0,
    project: '',
    unit: '',
    propertyValue: 0,
    financedValue: 0,
    status: CreditStatus.NOVO_CADASTRO,
    documents: []
  });

  const [activeTab, setActiveTab] = useState<'info' | 'docs'>('info');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const onDrop = (acceptedFiles: File[]) => {
    const newDocs: Document[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: "OUTROS", // Default, user can change
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString()
    }));
    
    setFormData(prev => ({
      ...prev,
      documents: [...(prev.documents || []), ...newDocs]
    }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeDoc = (id: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents?.filter(d => d.id !== id)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">
            {customer ? 'Editar Cliente' : 'Novo Cadastro de Crédito'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Informações Básicas
          </button>
          <button 
            onClick={() => setActiveTab('docs')}
            className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === 'docs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Documentação ({formData.documents?.length || 0})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' ? (
            <form id="customer-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Alerta de Documentação Pendente */}
              {formData.documents && formData.documents.filter(d => ['RG', 'CPF', 'COMPROVANTE_RENDA', 'IRPF', 'EXTRATO_FGTS'].includes(d.type)).length < 5 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                  <AlertCircle className="text-amber-600 shrink-0" size={18} />
                  <div>
                    <p className="text-xs font-bold text-amber-800">Documentação Incompleta</p>
                    <p className="text-[10px] text-amber-700 mt-0.5">
                      Faltam documentos obrigatórios para a análise de crédito. 
                      <button type="button" onClick={() => setActiveTab('docs')} className="ml-1 underline font-bold">Ir para Documentos</button>
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nome Completo *</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">CPF *</label>
                  <input 
                    required
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={e => setFormData({...formData, cpf: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Renda Mensal *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                    <input 
                      required
                      type="number"
                      value={formData.income || ''}
                      onChange={e => setFormData({...formData, income: Number(e.target.value)})}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Empreendimento *</label>
                  <input 
                    required
                    type="text"
                    value={formData.project}
                    onChange={e => setFormData({...formData, project: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Unidade *</label>
                  <input 
                    required
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Valor do Imóvel *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                    <input 
                      required
                      type="number"
                      value={formData.propertyValue || ''}
                      onChange={e => setFormData({...formData, propertyValue: Number(e.target.value)})}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Valor Financiado *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                    <input 
                      required
                      type="number"
                      value={formData.financedValue || ''}
                      onChange={e => setFormData({...formData, financedValue: Number(e.target.value)})}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Checklist de Documentos Obrigatórios */}
              <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle size={14} />
                  Checklist de Documentos
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'RG', type: 'RG' },
                    { label: 'CPF', type: 'CPF' },
                    { label: 'Renda', type: 'COMPROVANTE_RENDA' },
                    { label: 'IRPF', type: 'IRPF' },
                    { label: 'FGTS', type: 'EXTRATO_FGTS' }
                  ].map(item => {
                    const isPresent = formData.documents?.some(d => d.type === item.type);
                    return (
                      <div key={item.type} className="flex items-center gap-2 text-xs">
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${isPresent ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-gray-300 text-transparent'}`}>
                          <CheckCircle size={10} />
                        </div>
                        <span className={isPresent ? 'text-gray-900 font-medium' : 'text-gray-400'}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'}`}
              >
                <input {...getInputProps()} />
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-medium text-gray-900">Arraste documentos aqui ou clique para selecionar</p>
                <p className="text-xs text-gray-500 mt-1">Formatos aceitos: PDF, JPG, PNG</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    Documentos Anexados
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">{formData.documents?.length || 0}</span>
                  </h3>
                </div>
                
                {formData.documents && formData.documents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {formData.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                            <File size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[240px]">{doc.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <select 
                                value={doc.type}
                                onChange={(e) => {
                                  const newDocs = formData.documents?.map(d => 
                                    d.id === doc.id ? { ...d, type: e.target.value as any } : d
                                  );
                                  setFormData({ ...formData, documents: newDocs });
                                }}
                                className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border-none focus:ring-0 cursor-pointer hover:bg-indigo-100 transition-colors"
                              >
                                <option value="RG">RG</option>
                                <option value="CPF">CPF</option>
                                <option value="COMPROVANTE_RENDA">Renda</option>
                                <option value="IRPF">IRPF</option>
                                <option value="EXTRATO_FGTS">FGTS</option>
                                <option value="OUTROS">Outros</option>
                              </select>
                              <span className="text-[10px] text-gray-400">•</span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Visualizar"
                          >
                            <File size={16} />
                          </a>
                          <button 
                            onClick={() => removeDoc(doc.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-3">
                      <File size={24} />
                    </div>
                    <p className="text-sm text-gray-500">Nenhum documento anexado ainda.</p>
                    <p className="text-xs text-gray-400 mt-1">Faça o upload dos documentos obrigatórios para análise.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <AlertCircle size={14} />
            <span>Campos com * são obrigatórios</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-all"
            >
              Cancelar
            </button>
            <button 
              form="customer-form"
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 rounded-lg transition-all shadow-sm shadow-indigo-200"
            >
              {customer ? 'Salvar Alterações' : 'Criar Cadastro'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
