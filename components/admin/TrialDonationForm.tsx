'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

interface Trial {
  email: string;
  duration: number;
  expiresAt: string;
  remainingDays: number;
  isExpired: boolean;
}

interface TrialConfig {
  isEnabled: boolean;
  defaultDays: number;
}

export function TrialDonationForm() {
  const [email, setEmail] = useState('');
  const [duration, setDuration] = useState<7 | 15 | 30>(7);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const [trials, setTrials] = useState<Trial[]>([]);
  const [trialConfig, setTrialConfig] = useState<TrialConfig | null>(null);
  const [loadingTrials, setLoadingTrials] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);

  // Fetch active trials on mount
  useEffect(() => {
    fetchTrials();
    fetchConfig();
  }, []);

  async function fetchTrials() {
    try {
      setLoadingTrials(true);
      const response = await fetch('/api/admin/trials/list');
      const data = await response.json();

      if (data.success) {
        setTrials(data.trials || []);
      }
    } catch (error) {
      console.error('Erro ao buscar trials:', error);
    } finally {
      setLoadingTrials(false);
    }
  }

  async function fetchConfig() {
    try {
      const response = await fetch('/api/admin/trials/config');
      const data = await response.json();

      if (data.success) {
        setTrialConfig(data.config);
      }
    } catch (error) {
      console.error('Erro ao buscar config:', error);
    }
  }

  async function handleGrantTrial(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setMessage('Por favor, digite um email');
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const response = await fetch('/api/admin/trials/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, days: duration }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Trial de ${duration} dias concedido a ${email}`);
        setMessageType('success');
        setEmail('');
        setDuration(7);
        setTimeout(() => fetchTrials(), 500);
      } else {
        setMessage(data.message || 'Erro ao conceder trial');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Erro ao processar solicitação');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  async function handleRevokeTrial(trialEmail: string) {
    if (!confirm(`Tem certeza que deseja revogar o trial de ${trialEmail}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/trials/revoke', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trialEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Trial revogado para ${trialEmail}`);
        setMessageType('success');
        setTimeout(() => fetchTrials(), 500);
      }
    } catch (error) {
      setMessage('Erro ao revogar trial');
      setMessageType('error');
    }
  }

  async function handleToggleDefaultTrial(enabled: boolean) {
    try {
      setToggleLoading(true);

      const response = await fetch('/api/admin/trials/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: enabled }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setMessageType('success');
        setTimeout(() => fetchConfig(), 500);
      }
    } catch (error) {
      setMessage('Erro ao atualizar configuração');
      setMessageType('error');
    } finally {
      setToggleLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Configuration Section */}
      <Card className="p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              🔧 Free Trial Padrão
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {trialConfig?.isEnabled
                ? `✅ Ativado - Novos usuários recebem ${trialConfig?.defaultDays} dias grátis`
                : '❌ Desativado - Novos usuários não recebem trial automático'}
            </p>
          </div>

          <button
            onClick={() =>
              handleToggleDefaultTrial(!trialConfig?.isEnabled)
            }
            disabled={toggleLoading}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              trialConfig?.isEnabled
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            } ${toggleLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {toggleLoading ? 'Atualizando...' : trialConfig?.isEnabled ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      </Card>

      {/* Grant Trial Section */}
      <Card className="p-6 border-l-4 border-green-500">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💝 Conceder Trial
        </h3>

        <form onSubmit={handleGrantTrial} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email do Cliente
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@exemplo.com.br"
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duração
            </label>
            <div className="flex gap-3">
              {[7, 15, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDuration(days as 7 | 15 | 30)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    duration === days
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {days} dias
                </button>
              ))}
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                messageType === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            {loading ? 'Concedendo...' : 'Conceder Trial'}
          </Button>
        </form>
      </Card>

      {/* Active Trials Section */}
      <Card className="p-6 border-l-4 border-purple-500">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Trials Ativos
        </h3>

        {loadingTrials ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : trials.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum trial ativo no momento
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Duração
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Restam
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Expira em
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {trials.map((trial) => (
                  <tr key={trial.email} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {trial.email}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {trial.duration} dias
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          trial.remainingDays > 7
                            ? 'bg-green-100 text-green-800'
                            : trial.remainingDays > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {trial.remainingDays}d
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {new Date(trial.expiresAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRevokeTrial(trial.email)}
                        className="text-red-500 hover:text-red-700 font-medium text-xs"
                      >
                        Revogar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
