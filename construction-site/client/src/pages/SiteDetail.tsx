import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ClipboardList,
  Package,
  DollarSign,
  FileText,
  IndianRupee,
  Pencil,
  Trash2,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { getSite, updateSite, deleteSite } from '../services/siteService';
import { Site } from '../types';
import { useTranslation } from '../i18n';

const TABS = [
  { labelKey: 'tabs.attendance', path: 'attendance', icon: ClipboardList },
  { labelKey: 'tabs.materials', path: 'materials', icon: Package },
  { labelKey: 'tabs.expenses', path: 'expenses', icon: DollarSign },
  { labelKey: 'tabs.reports', path: 'reports', icon: FileText },
  { labelKey: 'tabs.payroll', path: 'payroll', icon: IndianRupee },
] as const;

function SiteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    status: 'active' as Site['status'],
    start_date: '',
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSite(id)
      .then((res) => {
        setSite(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const openEditModal = () => {
    if (!site) return;
    setFormData({
      name: site.name,
      address: site.address,
      status: site.status,
      start_date: site.start_date.slice(0, 10),
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!id) return;
    try {
      const res = await updateSite(id, formData);
      setSite(res.data);
      setIsEditOpen(false);
    } catch {
      // Error will be handled by Axios interceptor / toast
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm(t('siteDetail.deleteConfirm'));
    if (!confirmed) return;
    try {
      await deleteSite(id);
      navigate('/sites');
    } catch {
      // Error will be handled by Axios interceptor / toast
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  if (notFound || !site) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">{t('siteDetail.notFound')}</p>
        <Link
          to="/sites"
          className="text-amber-600 hover:text-amber-700 font-medium"
        >
          {t('common.backToSites')}
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(site.start_date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div>
      {/* Back link */}
      <Link
        to="/sites"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.backToSites')}
      </Link>

      {/* Site header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {site.name}
              </h1>
              <StatusBadge status={site.status} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {site.address}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {t('siteDetail.started', { date: formattedDate })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={openEditModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
              {t('common.edit')}
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {t('common.delete')}
            </button>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <nav className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <Link
            key={tab.path}
            to={`/sites/${id}/${tab.path}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-amber-600 hover:border-b-2 hover:border-amber-600 whitespace-nowrap transition-colors -mb-px"
          >
            <tab.icon className="w-4 h-4" />
            {t(tab.labelKey)}
          </Link>
        ))}
      </nav>

      {/* Edit modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={t('siteDetail.editTitle')}
        onSubmit={handleEditSubmit}
        submitLabel={t('siteDetail.updateSite')}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="edit-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('sites.form.name')}
            </label>
            <input
              id="edit-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="edit-address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('sites.form.address')}
            </label>
            <input
              id="edit-address"
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="edit-status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('sites.form.status')}
            </label>
            <select
              id="edit-status"
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as Site['status'],
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="active">{t('status.active')}</option>
              <option value="on_hold">{t('status.on_hold')}</option>
              <option value="completed">{t('status.completed')}</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-start-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('sites.form.startDate')}
            </label>
            <input
              id="edit-start-date"
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  start_date: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SiteDetail;
