import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '../services/materialService';
import { Material } from '../types';

const formatCurrency = (value: number) =>
  `₹${new Intl.NumberFormat('en-IN').format(value)}`;

const todayISO = () => new Date().toISOString().split('T')[0];

interface MaterialForm {
  name: string;
  quantity: string;
  unit: string;
  unit_price: string;
  vendor: string;
  date: string;
}

const emptyForm: MaterialForm = {
  name: '',
  quantity: '',
  unit: '',
  unit_price: '',
  vendor: '',
  date: todayISO(),
};

function Materials() {
  const { id: siteId } = useParams<{ id: string }>();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [form, setForm] = useState<MaterialForm>(emptyForm);

  const fetchMaterials = () => {
    if (!siteId) return;
    setLoading(true);
    getMaterials(siteId)
      .then((res) => setMaterials(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId]);

  const openAdd = () => {
    setEditingMaterial(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (material: Material) => {
    setEditingMaterial(material);
    setForm({
      name: material.name,
      quantity: String(material.quantity),
      unit: material.unit,
      unit_price: String(material.unit_price),
      vendor: material.vendor,
      date: material.date?.split('T')[0] ?? todayISO(),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMaterial(null);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    if (!siteId || !form.name.trim()) return;

    const payload = {
      name: form.name.trim(),
      quantity: Number(form.quantity),
      unit: form.unit.trim(),
      unit_price: Number(form.unit_price),
      vendor: form.vendor.trim(),
      date: form.date,
    };

    if (editingMaterial) {
      await updateMaterial(editingMaterial.id, payload);
    } else {
      await createMaterial(siteId, payload);
    }

    closeModal();
    fetchMaterials();
  };

  const handleDelete = async (material: Material) => {
    if (!confirm(`Delete material "${material.name}"?`)) return;
    await deleteMaterial(material.id);
    fetchMaterials();
  };

  const handleChange = (field: keyof MaterialForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unit', label: 'Unit' },
    {
      key: 'unit_price',
      label: 'Unit Price',
      render: (item: Material) =>
        formatCurrency(Number(item.unit_price)),
    },
    {
      key: 'total',
      label: 'Total',
      render: (item: Material) =>
        formatCurrency(Number(item.quantity) * Number(item.unit_price)),
    },
    { key: 'vendor', label: 'Vendor' },
    {
      key: 'date',
      label: 'Date',
      render: (item: Material) =>
        new Date(item.date).toLocaleDateString(),
    },
  ];

  const runningTotal = materials.reduce(
    (sum, m) => sum + Number(m.quantity) * Number(m.unit_price),
    0,
  );

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
        to={`/sites/${siteId}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Site
      </Link>

      <PageHeader
        title="Materials"
        actionLabel="Add Material"
        onAction={openAdd}
      />

      {materials.length === 0 ? (
        <EmptyState
          icon={<Package size={48} />}
          message="No materials recorded for this site yet."
          actionLabel="Add Material"
          onAction={openAdd}
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={materials}
            onEdit={openEdit}
            onDelete={handleDelete}
          />

          <div className="mt-4 flex justify-end">
            <span className="text-lg font-semibold text-gray-900">
              Total: {formatCurrency(runningTotal)}
            </span>
          </div>
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingMaterial ? 'Edit Material' : 'Add Material'}
        onSubmit={handleSubmit}
        submitLabel={editingMaterial ? 'Update' : 'Save'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="e.g. Cement, Steel Rods"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                placeholder="0"
                min="0"
                step="any"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                placeholder="bags / kg / pieces / cubic meters"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Price (₹)
            </label>
            <input
              type="number"
              value={form.unit_price}
              onChange={(e) => handleChange('unit_price', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="0"
              min="0"
              step="any"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor
            </label>
            <input
              type="text"
              value={form.vendor}
              onChange={(e) => handleChange('vendor', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="Supplier name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Materials;
