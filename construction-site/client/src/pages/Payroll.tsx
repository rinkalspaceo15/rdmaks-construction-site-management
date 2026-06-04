import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, IndianRupee } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { getPayroll } from '../services/payrollService';
import { PayrollRow } from '../types';
import { useTranslation } from '../i18n';

const formatCurrency = (value: number) =>
  `₹${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;

const todayISO = () => new Date().toISOString().split('T')[0];

const monthStartISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

function Payroll() {
  const { id: siteId } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [total, setTotal] = useState('0.00');
  const [from, setFrom] = useState(monthStartISO());
  const [to, setTo] = useState(todayISO());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!siteId) return;
    if (from > to) {
      setError(t('payroll.rangeError'));
      return;
    }
    setError('');
    setLoading(true);
    getPayroll(siteId, from, to)
      .then((res) => {
        setRows(res.data.rows);
        setTotal(res.data.total);
      })
      .catch(() => setError(t('payroll.loadError')))
      .finally(() => setLoading(false));
  }, [siteId, from, to]);

  const columns = [
    { key: 'name', label: t('payroll.worker') },
    { key: 'role', label: t('payroll.role') },
    { key: 'present_days', label: t('payroll.present') },
    { key: 'half_days', label: t('payroll.halfDay') },
    { key: 'absent_days', label: t('payroll.absent') },
    {
      key: 'overtime_hours',
      label: t('payroll.ot'),
      render: (r: PayrollRow) => Number(r.overtime_hours).toString(),
    },
    {
      key: 'wage',
      label: t('payroll.wage'),
      render: (r: PayrollRow) => formatCurrency(Number(r.wage)),
    },
  ];

  return (
    <div>
      <Link
        to={`/sites/${siteId}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        {t('common.backToSite')}
      </Link>

      <PageHeader title={t('payroll.title')} />

      {/* Date range */}
      <div className="flex flex-wrap items-end gap-4 mb-6 bg-white border border-gray-200 rounded-lg p-4">
        <div>
          <label
            htmlFor="payroll-from"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('payroll.from')}
          </label>
          <input
            id="payroll-from"
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="payroll-to"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('payroll.to')}
          </label>
          <input
            id="payroll-to"
            type="date"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<IndianRupee size={48} />}
          message={t('payroll.empty')}
        />
      ) : (
        <>
          <DataTable columns={columns} data={rows} />

          <div className="mt-4 flex justify-end">
            <span className="text-lg font-semibold text-gray-900">
              {t('payroll.total')}: {formatCurrency(Number(total))}
            </span>
          </div>
        </>
      )}

      <p className="text-xs text-gray-500 mt-4">{t('payroll.note')}</p>
    </div>
  );
}

export default Payroll;
