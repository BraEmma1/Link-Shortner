'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import Link from 'next/link';

export default function LinksClient() {
  const [links, setLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination and Filtering State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLinks, setTotalLinks] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTargetUrl, setEditTargetUrl] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchLinks = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/links', {
        params: {
          page,
          limit: 10,
          search: search || undefined,
          status: statusFilter !== 'All Status' ? statusFilter : undefined
        }
      });
      if (data.success) {
        setLinks(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalLinks(data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch links', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchLinks();
    }, 300);
    return () => clearTimeout(handler);
  }, [fetchLinks]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    // Could add a toast notification here
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { data } = await api.delete(`/links/${id}`);
      if (data.success) {
        setPage(1);
        fetchLinks();
      }
    } catch (error) {
      console.error('Failed to delete link', error);
      alert('Failed to delete link');
    }
  };

  const openEditModal = (link: any) => {
    setEditingLink(link);
    setEditTitle(link.title || '');
    setEditTargetUrl(link.targetUrl);
    setEditStatus(link.status || 'active');
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setEditError('');

    try {
      const { data } = await api.patch(`/links/${editingLink._id}`, {
        title: editTitle,
        targetUrl: editTargetUrl,
        status: editStatus
      });

      if (data.success) {
        setIsEditModalOpen(false);
        fetchLinks();
      } else {
        setEditError(data.error || 'Failed to update link');
      }
    } catch (err: any) {
      setEditError(err.response?.data?.error || err.message || 'Error updating link');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-background">
            Links
          </h2>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Manage and organize all your shortened links.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-surface-container-lowest border border-border-light rounded-lg px-4 py-2 font-body-sm text-body-sm focus:ring-2 focus:ring-secondary outline-none cursor-pointer w-full sm:w-auto"
          >
            <option value="All Status">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
          <input
            type="search"
            placeholder="Filter links..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="bg-surface-container-lowest border border-border-light rounded-lg px-4 py-2 font-body-sm text-body-sm focus:ring-2 focus:ring-secondary outline-none w-full sm:w-48"
          />
        </div>
      </div>

      {/* ── Links Table / Card Grid ── */}
      <div className="bg-surface-container-lowest rounded-lg border border-border-light shadow-sm overflow-hidden flex flex-col mb-12">
        {/* Desktop View Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#F1F5F9] border-b border-border-light">
                {['Title', 'Short URL', 'Destination', 'Clicks', 'Status', 'Created', 'Actions'].map(
                  (col) => (
                    <th
                      key={col}
                      className={`py-3 px-gutter font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold${col === 'Actions' ? ' text-right' : ''}`}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-background">
              {isLoading ? (
                // Loading Skeleton
                Array.from({ length: 6 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-border-light hover:bg-background-subtle transition-all"
                  >
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-4 px-gutter">
                        <div
                          className="h-4 bg-surface-container rounded animate-pulse"
                          style={{ width: `${60 + (j * 10) % 40}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-secondary">
                    No links found. Create one to get started!
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr
                    key={link._id}
                    className="border-b border-border-light hover:bg-background-subtle transition-all"
                  >
                    <td className="py-4 px-gutter font-medium">
                      {link.title || '-'}
                    </td>
                    <td className="py-4 px-gutter">
                      <div className="flex items-center gap-2">
                        <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono-code text-[13px]">
                          {link.shortUrl.replace(/^https?:\/\//, '')}
                        </a>
                        <button onClick={() => handleCopy(link.shortUrl)} className="text-secondary hover:text-primary transition-colors" title="Copy URL">
                          <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-gutter text-secondary truncate max-w-[200px]" title={link.targetUrl}>
                      {link.targetUrl}
                    </td>
                    <td className="py-4 px-gutter font-mono-code">
                      {link.clicks.toLocaleString()}
                    </td>
                    <td className="py-4 px-gutter">
                      <StatusBadge status={link.status} />
                    </td>
                    <td className="py-4 px-gutter text-secondary">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-gutter text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/analytics?linkId=${link._id}`} className="text-secondary hover:text-primary p-1 rounded hover:bg-surface-variant transition-colors" title="Analytics">
                          <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                        </Link>
                        <button onClick={() => openEditModal(link)} className="text-secondary hover:text-primary p-1 rounded hover:bg-surface-variant transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(link._id)} className="text-secondary hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors" title="Delete">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards List */}
        <div className="block md:hidden divide-y divide-border-light/50">
          {isLoading ? (
            // Loading Skeleton for Mobile
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 space-y-3 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-4 bg-surface-container rounded w-1/3" />
                  <div className="h-4 bg-surface-container rounded w-1/6" />
                </div>
                <div className="h-3 bg-surface-container rounded w-1/2" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-3 bg-surface-container rounded w-1/4" />
                  <div className="h-6 bg-surface-container rounded w-1/5" />
                </div>
              </div>
            ))
          ) : links.length === 0 ? (
            <div className="py-8 text-center text-secondary text-sm">
              No links found. Create one to get started!
            </div>
          ) : (
            links.map((link) => (
              <div key={link._id} className="p-4 space-y-3 hover:bg-background-subtle transition-all">
                <div className="flex justify-between items-start">
                  <h4 className="font-label-md text-label-md text-on-surface truncate pr-2 max-w-[200px]" title={link.title}>
                    {link.title || 'Untitled'}
                  </h4>
                  <StatusBadge status={link.status} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono-code text-[13px] font-semibold truncate max-w-[220px]">
                      {link.shortUrl.replace(/^https?:\/\//, '')}
                    </a>
                    <button onClick={() => handleCopy(link.shortUrl)} className="text-secondary hover:text-primary p-1" title="Copy URL">
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                  </div>
                  <p className="font-body-sm text-[12px] text-secondary truncate max-w-sm" title={link.targetUrl}>
                    {link.targetUrl}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border-light/30">
                  <div className="flex items-center gap-4 font-body-sm text-xs text-secondary">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">bar_chart</span>
                      {link.clicks.toLocaleString()} clicks
                    </span>
                    <span>
                      {new Date(link.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/analytics?linkId=${link._id}`} className="text-secondary hover:text-primary p-2 bg-surface-container-low hover:bg-surface-variant rounded transition-colors" title="Analytics">
                      <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                    </Link>
                    <button onClick={() => openEditModal(link)} className="text-secondary hover:text-primary p-2 bg-surface-container-low hover:bg-surface-variant rounded transition-colors" title="Edit">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button onClick={() => handleDelete(link._id)} className="text-secondary hover:text-red-600 p-2 bg-surface-container-low hover:bg-red-50 rounded transition-colors" title="Delete">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="p-gutter border-t border-border-light flex justify-between items-center bg-surface-container-lowest">
          <p className="font-body-sm text-body-sm text-secondary">
            Showing {totalLinks > 0 ? (page - 1) * 10 + 1 : 0} — {Math.min(page * 10, totalLinks)} of {totalLinks} links
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="px-3 py-1.5 border border-border-light rounded-lg font-label-sm text-label-sm text-on-surface hover:bg-surface-variant disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="px-3 py-1.5 border border-border-light rounded-lg font-label-sm text-label-sm text-on-surface hover:bg-surface-variant disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Link"
      >
        <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
          {editError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {editError}
            </div>
          )}
          
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface mb-1.5">
              Destination URL <span className="text-primary">*</span>
            </label>
            <input
              type="url"
              required
              value={editTargetUrl}
              onChange={(e) => setEditTargetUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-background-subtle border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none font-body-sm text-body-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface mb-1.5">
                Link Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2.5 bg-background-subtle border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none font-body-sm text-body-sm"
              />
            </div>
            
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface mb-1.5">
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-background-subtle border border-border-light rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none font-body-sm text-body-sm cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-light -mx-6 px-6 pb-0">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSaving}
              className="px-5 py-2.5 bg-surface-container-lowest border border-border-light text-on-surface rounded-lg font-label-md hover:bg-surface-variant transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-primary text-white rounded-lg font-label-md hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">save</span>
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
