import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

// Counts from 0 up to the target on mount, formatted with Indian grouping.
function CountUpNumber({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const duration = 1000;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setVal(Math.round(target * progress));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <>{val.toLocaleString('en-IN')}</>;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="flex items-center gap-4 bg-white rounded-lg shadow-sm p-5 border border-transparent hover:border-amber-200 hover:shadow-md group"
    >
      <motion.div
        whileHover={{ scale: 1.08, rotate: -3 }}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 shrink-0"
      >
        {icon}
      </motion.div>
      <div>
        <p className="text-2xl font-bold text-gray-900">
          {typeof value === 'number' ? <CountUpNumber target={value} /> : value}
        </p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </motion.div>
  );
}

export default StatCard;
