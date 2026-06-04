import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, MapPin, Calendar } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { getSites, createSite } from '../services/siteService';
import { Site } from '../types';

type StatusFilter = 'all' | 'active' | 'on_hold' | 'completed';

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];

const INITIAL_FORM = {
  name: '',
  address: '',
  status: 'active' as Site['status'],
  start_date: '',
};

function SitesList() {
  const navigate = useNavigate();

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const { data } = await getSites();
      setSites(data);
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const filteredSites = sites.filter((site) => {
    const matchesSearch = site.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || site.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleOpenModal = () => {
    setForm(INITIAL_FORM);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setForm(INITIAL_FORM);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;

    try {
      setSubmitting(true);
      await createSite({
        name: form.name.trim(),
        address: form.address.trim(),
        status: form.status,
        start_date: form.start_date || undefined,
      });
      await fetchSites();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to create site:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Sites"
        actionLabel="Add Site"
        onAction={handleOpenModal}
      />

      {sites.length === 0 ? (
        <EmptyState
          icon={<Building2 size={48} />}
          message="No sites yet"
          actionLabel="Add Site"
          onAction={handleOpenModal}
        />
      ) : (
        <>
          {/* Search bar */}
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search sites by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Card grid */}
          {filteredSites.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              No sites match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSites.map((site) => (
                <div
                  key={site.id}
                  onClick={() => navigate(`/sites/${site.id}`)}
                  className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-amber-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-base">
                      {site.name}
                    </h3>
                    <StatusBadge status={site.status} />
                  </div>

                  {site.address && (
                    <div className="flex items-start gap-1.5 text-sm text-gray-500 mb-2">
                      <MapPin size={14} className="mt-0.5 shrink-0" />
                      <span>{site.address}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar size={14} className="shrink-0" />
                    <span>{formatDate(site.start_date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Site Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add Site"
        onSubmit={handleSubmit}
        submitLabel={submitting ? 'Saving...' : 'Save'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Greenfield Residency"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Full site address"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as Site['status'] })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
            >
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) =>
                setForm({ ...form, start_date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SitesList;
