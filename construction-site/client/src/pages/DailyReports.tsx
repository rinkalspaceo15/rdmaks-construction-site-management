import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Sun, CloudRain, Cloud, Pencil } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { getReports, createReport, updateReport } from '../services/reportService';
import { DailyReport } from '../types';

const WEATHER_OPTIONS: DailyReport['weather'][] = ['sunny', 'rainy', 'cloudy'];

const WEATHER_ICONS: Record<DailyReport['weather'], React.ReactNode> = {
  sunny: <Sun size={18} className="text-yellow-500" />,
  rainy: <CloudRain size={18} className="text-blue-500" />,
  cloudy: <Cloud size={18} className="text-gray-400" />,
};

const INITIAL_FORM = {
  date: new Date().toISOString().split('T')[0],
  weather: 'sunny' as DailyReport['weather'],
  summary: '',
  issues: '',
};

function DailyReports() {
  const { id: siteId } = useParams<{ id: string }>();

  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    if (!siteId) return;
    try {
      setLoading(true);
      const { data } = await getReports(siteId);
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [siteId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const sortedReports = [...reports].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleOpenCreate = () => {
    setEditingReport(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const handleOpenEdit = (report: DailyReport) => {
    setEditingReport(report);
    setForm({
      date: report.date.split('T')[0],
      weather: report.weather,
      summary: report.summary,
      issues: report.issues || '',
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingReport(null);
    setForm(INITIAL_FORM);
  };

  const handleSubmit = async () => {
    if (!siteId || !form.date.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        date: form.date,
        weather: form.weather,
        summary: form.summary.trim(),
        issues: form.issues.trim(),
      };

      if (editingReport) {
        await updateReport(editingReport.id, payload);
      } else {
        await createReport(siteId, payload);
      }

      await fetchReports();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save report:', error);
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
      <Link
        to={`/sites/${siteId}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Site
      </Link>

      <PageHeader
        title="Daily Reports"
        actionLabel="Create Report"
        onAction={handleOpenCreate}
      />

      {reports.length === 0 ? (
        <EmptyState
          icon={<FileText size={48} />}
          message="No reports yet"
          actionLabel="Create Report"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="space-y-3">
          {sortedReports.map((report) => {
            const isExpanded = expandedId === report.id;

            return (
              <div
                key={report.id}
                className="bg-white border border-gray-200 rounded-xl transition-all hover:border-amber-300"
              >
                {/* Collapsed header — always visible */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : report.id)
                  }
                  className="w-full text-left px-5 py-4 flex items-start gap-3"
                >
                  {/* Timeline dot */}
                  <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-sm">
                        {formatDate(report.date)}
                      </span>
                      {WEATHER_ICONS[report.weather]}
                    </div>

                    {!isExpanded && report.summary && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {report.summary}
                      </p>
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-4 pl-10">
                    {report.summary && (
                      <p className="text-sm text-gray-700 whitespace-pre-line mb-3">
                        {report.summary}
                      </p>
                    )}

                    {report.issues && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-red-600">
                          Issues:
                        </span>
                        <p className="text-sm text-gray-700 whitespace-pre-line mt-1">
                          {report.issues}
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(report);
                      }}
                      className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingReport ? 'Edit Report' : 'Create Report'}
        onSubmit={handleSubmit}
        submitLabel={submitting ? 'Saving...' : 'Save'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weather
            </label>
            <select
              value={form.weather}
              onChange={(e) =>
                setForm({
                  ...form,
                  weather: e.target.value as DailyReport['weather'],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
            >
              {WEATHER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary
            </label>
            <textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="What work was done today?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issues
            </label>
            <textarea
              value={form.issues}
              onChange={(e) => setForm({ ...form, issues: e.target.value })}
              placeholder="Any problems or delays?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DailyReports;
