// src/app/(admin)/admin/get-new-clients/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import {
  fetchFunnels,
  updateFunnelStatus,
  duplicateFunnel,
  deleteFunnel,
  generateFunnelUrl,
  clearError,
  setCurrentPage,
  type Funnel
} from '@/redux/slices/funnelSlice';
import { fetchPipelines } from '@/redux/slices/pipelineSlice';

// Create a client-only wrapper to prevent hydration issues
const ClientOnlyWrapper = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">
                Funnel-Manager
              </h1>
              <p className="text-gray-600 text-base">
                Erstellen, verwalten und optimieren Sie Ihre Marketing-Funnels
              </p>
            </div>
            <div className="bg-gray-300 text-gray-500 px-6 py-3 rounded-lg">
              Lade...
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Daten...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Modern Toggle Switch Component
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`w-10 h-5 rounded-full p-0 duration-150 ${checked ? "bg-emerald-500" : "bg-gray-400"
        } relative focus:outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      type="button"
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`absolute w-3 h-3 bg-white rounded-full top-1 transition-transform ${checked ? "left-6" : "left-1"
          }`}
      />
    </button>
  );
  };

// Toast notification component
const Toast: React.FC<{
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300`}>
      <div className="flex items-center gap-2">
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
          ×
        </button>
      </div>
    </div>
  );
};

const FunnelListPageContent: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const {
    funnels,
    loading,
    error,
    pagination
  } = useSelector((state: RootState) => state.funnel);

  const { pipelines } = useSelector((state: RootState) => state.pipeline);

  console.debug('Pipelines:', pipelines);

  // Local state
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchFunnels({
      page: pagination.currentPage,
      limit: pagination.limit
    }));

    dispatch(fetchPipelines());
  }, [dispatch, pagination.currentPage]);

  // Actions
  const handleCreateFunnel = () => {
    router.push('/admin/get-new-clients/canvas/new');
  };

  const handleEditFunnel = (id: string) => {
    router.push(`/admin/get-new-clients/canvas/${id}`);
  };

  const handleDuplicateFunnel = async (funnel: Funnel) => {
    try {
      await dispatch(duplicateFunnel({
        originalFunnelId: funnel.id,
        name: `${funnel.name} (Kopie)`,
        description: funnel.description,
        pipelineId: funnel.pipelineId,
        stageId: funnel.stageId
      })).unwrap();

      setToast({ message: 'Funnel erfolgreich dupliziert!', type: 'success' });
    } catch (error) {
      console.error('Duplicate error:', error);
      setToast({ message: 'Fehler beim Duplizieren des Funnels', type: 'error' });
    }
  };

  const handleToggleStatus = async (id: string) => {
    const funnel = funnels.find(f => f.id === id);
    if (!funnel) return;

    const newStatus = funnel.status === 'active' ? 'inactive' : 'active';

    try {
      // Add console.log to debug
      console.log('Toggling funnel:', id, 'from', funnel.status, 'to', newStatus);

      await dispatch(updateFunnelStatus({ id, status: newStatus })).unwrap();
      setToast({
        message: `Funnel ${newStatus === 'active' ? 'aktiviert' : 'pausiert'}!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Toggle error:', error);
      setToast({ message: 'Fehler beim Ändern des Status', type: 'error' });
    }
  };

  const handleDeleteFunnel = async (id: string) => {
    try {
      await dispatch(deleteFunnel(id)).unwrap();
      setShowDeleteModal(null);
      setToast({ message: 'Funnel erfolgreich gelöscht!', type: 'success' });
    } catch (error) {
      console.error('Delete error:', error);
      setToast({ message: 'Fehler beim Löschen des Funnels', type: 'error' });
    }
  };

  const handleRegenerateUrl = async (id: string) => {
    try {
      await dispatch(generateFunnelUrl(id)).unwrap();
      setToast({ message: 'Neue URL generiert!', type: 'success' });
    } catch (error) {
      console.error('Regenerate URL error:', error);
      setToast({ message: 'Fehler beim Generieren der URL', type: 'error' });
    }
  };

  console.debug('Handle Regenerate URL', handleRegenerateUrl);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setToast({ message: 'Link in Zwischenablage kopiert!', type: 'success' });
    } catch (error) {
      console.error('Copy to clipboard error:', error);
      setToast({ message: 'Fehler beim Kopieren', type: 'error' });
    }
  };

  const openPipelineInNewTab = (pipelineId: string) => {
    const pipelineUrl = `http://localhost:3000/admin/pipeline?id=${pipelineId}`;
    window.open(pipelineUrl, '_blank');
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'inactive': return 'bg-amber-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  console.debug('Get Status Color:', getStatusColor);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'inactive': return 'Inaktiv';
      case 'draft': return 'Entwurf';
      default: return 'Unbekannt';
    }
  };

  console.debug('Get Status Text:', getStatusText);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Format date error:', error);
      return 'Invalid date';
    }
  };

  const getTotalStats = () => {
    return {
      total: funnels.length,
      active: funnels.filter(f => f.status === 'active').length,
      totalLeads: funnels.reduce((sum, f) => sum + (f.leads || 0), 0)
    };
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">
              Funnel-Manager
            </h1>
            <p className="text-gray-600 text-base">
              Erstellen, verwalten und optimieren Sie Ihre Marketing-Funnels
            </p>
          </div>
          <button
            onClick={handleCreateFunnel}
            disabled={loading?.creating}
            className="bg-[#002d51] hover:bg-emerald-600 disabled:opacity-50 text-white border-none px-6 py-3 rounded-lg text-base font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:hover:transform-none"
          >
            <span>+</span>
            {loading?.creating ? 'Erstelle...' : 'Neuen Funnel erstellen'}
          </button>
        </div>

        {/* Stats Overview - Without Conversion Rate */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Gesamt Funnels</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.5h-15V5h15v14.5zm0-16.5h-15c-.83 0-1.5.67-1.5 1.5v15c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
                <div className="text-sm text-gray-600">Aktive Funnels</div>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalLeads.toLocaleString('de-DE')}</div>
                <div className="text-sm text-gray-600">Gesamt Leads</div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2 1l-3 4v7h2v7h3v-7h1l1.8-2.4c.2-.27.2-.63 0-.9L18 15h2v7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Filters - Removed */}

        {/* Loading State */}
        {loading?.funnels && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Funnels...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Fehler: {error}</span>
            </div>
            <button
              onClick={() => dispatch(clearError())}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Fehler schließen
            </button>
          </div>
        )}

        {/* Funnels Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 grid grid-cols-12 gap-4 text-xs font-semibold uppercase text-gray-600">
            <div className="col-span-4">Funnel Name</div>
            <div className="col-span-2">Pipeline</div>
            <div className="col-span-2">Erstellt</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Leads</div>
            <div className="col-span-2">Aktionen</div>
          </div>

          {/* Table Body */}
          {!loading.funnels && funnels.length === 0 ? (
            <div className="py-8 px-5 text-center text-gray-500 flex flex-col items-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="mb-2 text-gray-700 font-semibold">Keine Funnels gefunden</h3>
              <p className="mb-4">Erstellen Sie Ihren ersten Funnel, um loszulegen!</p>
              <div className="flex justify-center">
                <button
                  onClick={handleCreateFunnel}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-5 py-2 rounded-md cursor-pointer transition-colors"
                >
                  Funnel erstellen
                </button>
              </div>
            </div>
          ) : (
              funnels.map((funnel) => (
              <div
                key={funnel.id}
                className="px-5 py-5 border-b border-gray-200 grid grid-cols-12 gap-4 items-center transition-colors hover:bg-gray-50"
              >
                {/* Funnel Name & Description */}
                <div className="col-span-4">
                  <h3 className="text-base font-semibold mb-1 text-gray-900">
                    {funnel.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {funnel.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>🔗</span>
                    <button
                        onClick={() => {
                          const fullUrl = `${process.env.NEXT_PUBLIC_URL}funnel/${funnel.publicLink}`;
                          window.open(fullUrl, '_blank');
                        }}
                      className="bg-transparent border-none text-emerald-600 cursor-pointer underline text-xs hover:text-emerald-700 transition-colors"
                        title="In neuem Tab öffnen"
                    >
                        {funnel.publicLink && funnel.publicLink.length > 35 ?
                        `${funnel.publicLink.substring(0, 35)}...` :
                          funnel.publicLink || 'Keine URL'
                      }
                    </button>
                      <button
                        onClick={() => {
                          const fullUrl = `${process.env.NEXT_PUBLIC_URL}funnel/${funnel.publicLink}`;
                          copyToClipboard(fullUrl);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        style={{ backgroundColor: '#f0f8ff00', border: 0 }}
                        title="Link kopieren"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    </div>
                </div>

                  {/* Pipeline Name */}
                <div className="col-span-2">
                    <button
                      onClick={() => openPipelineInNewTab(funnel.pipelineId)}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer underline mb-1 bg-transparent border-none transition-colors"
                      title="Pipeline in neuem Tab öffnen"
                    >
                      {funnel.pipelineName || 'Keine Pipeline'}
                    </button>
                    {funnel.stageName && (
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
                        {funnel.stageName}
                      </div>
                    )}
                </div>

                {/* Created Date */}
                <div className="col-span-2 text-sm text-gray-600">
                    <div>{formatDate(funnel.createdAt)}</div>
                    {funnel.updatedAt !== funnel.createdAt && (
                      <div className="text-xs text-gray-400 mt-1">
                        Bearbeitet: {formatDate(funnel.updatedAt)}
                      </div>
                    )}
                </div>

                  {/* Status - Toggle Switch */}
                <div className="col-span-1">
                    <ToggleSwitch
                      key={`toggle-${funnel.id}`}
                      checked={funnel.status === 'active'}
                      onChange={() => handleToggleStatus(funnel.id)}
                      disabled={loading?.updating}
                    />
                </div>

                  {/* Leads */}
                  <div className="col-span-1">
                    <div className="text-base font-semibold text-emerald-600">
                      {(funnel.leads || 0).toLocaleString('de-DE')}
                    </div>
                </div>

                  {/* Actions - Icon Buttons */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditFunnel(funnel.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                        title="Bearbeiten"
                        disabled={loading?.updating}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>

                      {/* Duplicate Button */}
                      <button
                        onClick={() => handleDuplicateFunnel(funnel)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        title="Duplizieren"
                        disabled={loading?.duplicating}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setShowDeleteModal(funnel.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 bg-red-50 text-red-600 hover:bg-red-100"
                        title="Löschen"
                        disabled={loading?.deleting}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors disabled:hover:bg-white"
            >
              Zurück
            </button>

            {[...Array(pagination.totalPages)].map((_, index) => {
              const page = index + 1;
              const isCurrentPage = page === pagination.currentPage;

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border rounded-lg transition-colors ${isCurrentPage
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors disabled:hover:bg-white"
            >
              Weiter
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Funnel löschen
            </h3>
            <p className="mb-5 text-gray-600">
              Sind Sie sicher, dass Sie diesen Funnel löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden. 
              Alle Daten und Statistiken gehen verloren.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                disabled={loading?.deleting}
                className="bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white border-none px-4 py-2 rounded-md cursor-pointer transition-colors disabled:cursor-not-allowed"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleDeleteFunnel(showDeleteModal)}
                disabled={loading?.deleting}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white border-none px-4 py-2 rounded-md cursor-pointer transition-colors disabled:cursor-not-allowed"
              >
                {loading?.deleting ? 'Lösche...' : 'Löschen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// Main export component with client-only wrapper
const FunnelListPage: React.FC = () => {
  return (
    <ClientOnlyWrapper>
      <FunnelListPageContent />
    </ClientOnlyWrapper>
  );
};

export default FunnelListPage;