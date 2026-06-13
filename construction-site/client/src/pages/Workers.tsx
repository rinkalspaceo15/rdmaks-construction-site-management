import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { getWorkers, createWorker, updateWorker, deleteWorker } from '../services/workerService';
import { Worker } from '../types';
import { useTranslation } from '../i18n';
import { formatINR } from '../utils/format';

const EMPTY_FORM = { name: '', role: '', phone: '', daily_wage: '' };

function Workers() {
  const { t } = useTranslation();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchWorkers = () => {
    setLoading(true);
    getWorkers()
      .then((res) => setWorkers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const openAddModal = () => {
    setEditingWorker(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (worker: Worker) => {
    setEditingWorker(worker);
    setForm({
      name: worker.name,
      role: worker.role,
      phone: worker.phone,
      daily_wage: String(worker.daily_wage),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingWorker(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      role: form.role,
      phone: form.phone,
      daily_wage: Number(form.daily_wage),
    };

    if (editingWorker) {
      await updateWorker(editingWorker.id, payload);
    } else {
      await createWorker(payload);
    }

    fetchWorkers();
    closeModal();
  };

  const handleDelete = async (worker: Worker) => {
    await deleteWorker(worker.id);
    fetchWorkers();
  };

  const columns = [
    {
      key: 'name',
      label: t('workers.col.name'),
      render: (item: Record<string, unknown>) => {
        const worker = item as unknown as Worker;
        return <span className="font-semibold text-gray-900">{worker.name}</span>;
      },
    },
    { key: 'role', label: t('workers.col.role') },
    { key: 'phone', label: t('workers.col.phone') },
    {
      key: 'daily_wage',
      label: t('workers.col.dailyWage'),
      render: (item: Record<string, unknown>) => {
        const worker = item as unknown as Worker;
        return (
          <span>{formatINR(Number(worker.daily_wage))}</span>
        );
      },
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
      <PageHeader title={t('workers.title')} actionLabel={t('workers.add')} onAction={openAddModal} />

      {workers.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          message={t('workers.empty')}
          actionLabel={t('workers.add')}
          onAction={openAddModal}
        />
      ) : (
        <DataTable
          columns={columns}
          data={workers as unknown as Record<string, unknown>[]}
          onEdit={(item) => openEditModal(item as unknown as Worker)}
          onDelete={(item) => handleDelete(item as unknown as Worker)}
        />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingWorker ? t('workers.editTitle') : t('workers.addTitle')}
        onSubmit={handleSubmit}
        submitLabel={editingWorker ? t('common.update') : t('common.save')}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="worker-name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('workers.form.name')} <span className="text-red-500">*</span>
            </label>
            <input
              id="worker-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder={t('workers.form.namePlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="worker-role" className="block text-sm font-medium text-gray-700 mb-1">
              {t('workers.form.role')}
            </label>
            <input
              id="worker-role"
              type="text"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder={t('workers.form.rolePlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="worker-phone" className="block text-sm font-medium text-gray-700 mb-1">
              {t('workers.form.phone')}
            </label>
            <input
              id="worker-phone"
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder={t('workers.form.phonePlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="worker-wage" className="block text-sm font-medium text-gray-700 mb-1">
              {t('workers.form.dailyWage')}
            </label>
            <input
              id="worker-wage"
              type="number"
              value={form.daily_wage}
              onChange={(e) => setForm({ ...form, daily_wage: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder={t('workers.form.wagePlaceholder')}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Workers;
