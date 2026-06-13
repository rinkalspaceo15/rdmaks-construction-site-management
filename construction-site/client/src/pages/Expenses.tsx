import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, DollarSign } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../services/expenseService';
import { Expense } from '../types';
import { useTranslation } from '../i18n';
import { formatINR } from '../utils/format';

const CATEGORIES = ['material', 'labor', 'transport', 'misc'] as const;

const EMPTY_FORM = {
  category: 'material' as Expense['category'],
  description: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
};

function Expenses() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [activeFilter, setActiveFilter] = useState<'all' | Expense['category']>('all');

  const fetchExpenses = () => {
    if (!id) return;
    setLoading(true);
    getExpenses(id)
      .then((res) => setExpenses(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExpenses();
  }, [id]);

  const openAddModal = () => {
    setEditingExpense(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setForm({
      category: expense.category,
      description: expense.description,
      amount: String(Number(expense.amount)),
      date: expense.date.slice(0, 10),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingExpense(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!id) return;

    const payload = {
      category: form.category,
      description: form.description,
      amount: Number(form.amount),
      date: form.date,
    };

    if (editingExpense) {
      await updateExpense(editingExpense.id, payload);
    } else {
      await createExpense(id, payload);
    }

    fetchExpenses();
    closeModal();
  };

  const handleDelete = async (expense: Expense) => {
    await deleteExpense(expense.id);
    fetchExpenses();
  };

  // Category totals
  const categoryTotals = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = expenses
        .filter((e) => e.category === cat)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      return acc;
    },
    {} as Record<Expense['category'], number>,
  );

  const grandTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Client-side filter
  const filteredExpenses =
    activeFilter === 'all'
      ? expenses
      : expenses.filter((e) => e.category === activeFilter);

  const columns = [
    {
      key: 'category',
      label: t('expenses.col.category'),
      render: (item: Expense) => t(`expenses.cat.${item.category}`),
    },
    { key: 'description', label: t('expenses.col.description') },
    {
      key: 'amount',
      label: t('expenses.col.amount'),
      render: (item: Expense) => formatINR(Number(item.amount)),
    },
    {
      key: 'date',
      label: t('expenses.col.date'),
      render: (item: Expense) =>
        new Date(item.date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div>
      <Link
        to={`/sites/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        {t('common.backToSite')}
      </Link>

      <PageHeader title={t('expenses.title')} actionLabel={t('expenses.add')} onAction={openAddModal} />

      {/* Category summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {CATEGORIES.map((cat) => (
          <StatCard
            key={cat}
            label={t(`expenses.cat.${cat}`)}
            value={formatINR(categoryTotals[cat])}
            icon={<DollarSign className="w-6 h-6" />}
          />
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {(['all', ...CATEGORIES] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === tab
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab === 'all' ? t('expenses.filter.all') : t(`expenses.cat.${tab}`)}
          </button>
        ))}
      </div>

      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon={<DollarSign size={48} />}
          message={
            activeFilter === 'all'
              ? t('expenses.emptyAll')
              : t('expenses.emptyCat', { cat: t(`expenses.cat.${activeFilter}`) })
          }
          actionLabel={t('expenses.add')}
          onAction={openAddModal}
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={filteredExpenses}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />

          {/* Grand total */}
          <div className="flex items-center justify-end mt-4 px-4">
            <span className="text-sm font-medium text-gray-500 mr-3">{t('expenses.grandTotal')}</span>
            <span className="text-lg font-bold text-gray-900">{formatINR(grandTotal)}</span>
          </div>
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingExpense ? t('expenses.editTitle') : t('expenses.addTitle')}
        onSubmit={handleSubmit}
        submitLabel={editingExpense ? t('common.update') : t('common.save')}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="expense-category" className="block text-sm font-medium text-gray-700 mb-1">
              {t('expenses.form.category')} <span className="text-red-500">*</span>
            </label>
            <select
              id="expense-category"
              required
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as Expense['category'] })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`expenses.cat.${cat}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="expense-description" className="block text-sm font-medium text-gray-700 mb-1">
              {t('expenses.form.description')}
            </label>
            <textarea
              id="expense-description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder={t('expenses.form.descPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="expense-amount" className="block text-sm font-medium text-gray-700 mb-1">
              {t('expenses.form.amount')} <span className="text-red-500">*</span>
            </label>
            <input
              id="expense-amount"
              type="number"
              required
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder={t('expenses.form.amountPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="expense-date" className="block text-sm font-medium text-gray-700 mb-1">
              {t('expenses.form.date')} <span className="text-red-500">*</span>
            </label>
            <input
              id="expense-date"
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Expenses;
