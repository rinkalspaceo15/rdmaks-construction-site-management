import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle, PauseCircle, Users } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { getSites } from '../services/siteService';
import { getWorkers } from '../services/workerService';
import { Site, Worker } from '../types';
import { useTranslation } from '../i18n';

function Dashboard() {
  const { t } = useTranslation();
  const [sites, setSites] = useState<Site[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSites(), getWorkers()])
      .then(([sitesRes, workersRes]) => {
        setSites(sitesRes.data);
        setWorkers(workersRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  const totalSites = sites.length;
  const activeSites = sites.filter((s) => s.status === 'active').length;
  const onHoldSites = sites.filter((s) => s.status === 'on_hold').length;
  const totalWorkers = workers.length;

  const recentSites = sites.slice(0, 5);

  return (
    <div>
      <PageHeader title={t('dashboard.title')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label={t('dashboard.totalSites')}
          value={totalSites}
          icon={<Building2 className="w-6 h-6" />}
        />
        <StatCard
          label={t('dashboard.activeSites')}
          value={activeSites}
          icon={<CheckCircle className="w-6 h-6" />}
        />
        <StatCard
          label={t('dashboard.onHold')}
          value={onHoldSites}
          icon={<PauseCircle className="w-6 h-6" />}
        />
        <StatCard
          label={t('dashboard.totalWorkers')}
          value={totalWorkers}
          icon={<Users className="w-6 h-6" />}
        />
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.recentSites')}</h2>

        {recentSites.length === 0 ? (
          <p className="text-gray-500">{t('dashboard.noSites')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSites.map((site) => (
              <Link
                key={site.id}
                to={`/sites/${site.id}`}
                className="block bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{site.name}</h3>
                  <StatusBadge status={site.status} />
                </div>
                <p className="text-sm text-gray-500">{site.address}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
