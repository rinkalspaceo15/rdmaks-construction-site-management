import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, UserCheck, Clock } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { getWorkers } from '../services/workerService';
import { getAttendance, markAttendance } from '../services/attendanceService';
import { Worker } from '../types';
import { useTranslation } from '../i18n';

type AttendanceStatus = 'present' | 'absent' | 'half_day';

interface AttendanceEntry {
  status: AttendanceStatus;
  overtime_hours: number;
}

function Attendance() {
  const { id: siteId } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceEntry>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    getWorkers()
      .then((res) => {
        setWorkers(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!siteId || workers.length === 0) return;

    getAttendance(siteId, date).then((res) => {
      const existing = res.data;
      const map: Record<string, AttendanceEntry> = {};

      for (const worker of workers) {
        const record = existing.find((a) => a.worker_id === worker.id);
        if (record) {
          map[worker.id] = {
            status: record.status,
            overtime_hours: Number(record.overtime_hours) || 0,
          };
        } else {
          map[worker.id] = { status: 'present', overtime_hours: 0 };
        }
      }

      setAttendanceMap(map);
    });
  }, [siteId, date, workers]);

  const updateStatus = (workerId: string, status: AttendanceStatus) => {
    setSaveSuccess(false);
    setAttendanceMap((prev) => ({
      ...prev,
      [workerId]: { ...prev[workerId], status },
    }));
  };

  const updateOvertime = (workerId: string, hours: number) => {
    setSaveSuccess(false);
    setAttendanceMap((prev) => ({
      ...prev,
      [workerId]: { ...prev[workerId], overtime_hours: hours },
    }));
  };

  const markAllPresent = () => {
    setSaveSuccess(false);
    setAttendanceMap((prev) => {
      const updated: Record<string, AttendanceEntry> = {};
      for (const workerId of Object.keys(prev)) {
        updated[workerId] = { ...prev[workerId], status: 'present' };
      }
      return updated;
    });
  };

  const handleSave = async () => {
    if (!siteId) return;

    setSaving(true);
    setSaveSuccess(false);

    const records = Object.entries(attendanceMap).map(([worker_id, entry]) => ({
      worker_id,
      status: entry.status,
      overtime_hours: entry.overtime_hours,
    }));

    try {
      await markAttendance(siteId, { date, records });
      setSaveSuccess(true);
    } catch {
      // Error is handled by the API interceptor / toast layer
    } finally {
      setSaving(false);
    }
  };

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
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.backToSite')}
      </Link>

      <PageHeader title={t('attendance.title')} />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        {workers.length > 0 && (
          <button
            onClick={markAllPresent}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            {t('attendance.markAllPresent')}
          </button>
        )}
      </div>

      {workers.length === 0 ? (
        <EmptyState
          icon={<UserCheck className="w-12 h-12" />}
          message={t('attendance.noWorkers')}
        />
      ) : (
        <>
          <div className="space-y-3">
            {workers.map((worker) => {
              const entry = attendanceMap[worker.id];
              if (!entry) return null;

              return (
                <div
                  key={worker.id}
                  className="bg-white rounded-lg shadow-sm p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {worker.name}
                      </p>
                      <p className="text-sm text-gray-500">{worker.role}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusButton
                        label={t('attendance.present')}
                        active={entry.status === 'present'}
                        activeClass="bg-green-600 text-white"
                        onClick={() => updateStatus(worker.id, 'present')}
                      />
                      <StatusButton
                        label={t('attendance.absent')}
                        active={entry.status === 'absent'}
                        activeClass="bg-red-500 text-white"
                        onClick={() => updateStatus(worker.id, 'absent')}
                      />
                      <StatusButton
                        label={t('attendance.halfDay')}
                        active={entry.status === 'half_day'}
                        activeClass="bg-yellow-500 text-white"
                        onClick={() => updateStatus(worker.id, 'half_day')}
                      />
                    </div>
                  </div>

                  {(entry.status === 'present' || entry.status === 'half_day') && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <label className="text-sm text-gray-600">{t('attendance.overtimeLabel')}</label>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={entry.overtime_hours}
                        onChange={(e) =>
                          updateOvertime(worker.id, Math.max(0, Number(e.target.value)))
                        }
                        className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              {saving ? t('common.saving') : t('attendance.save')}
            </button>

            {saveSuccess && (
              <span className="text-sm text-green-600 font-medium">
                {t('attendance.saved')}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface StatusButtonProps {
  label: string;
  active: boolean;
  activeClass: string;
  onClick: () => void;
}

function StatusButton({ label, active, activeClass, onClick }: StatusButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active ? activeClass : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

export default Attendance;
