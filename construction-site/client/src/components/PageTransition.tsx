import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// Wraps page content so each route fades/slides in on navigation.
// Keyed by pathname so the entrance animation replays on every route change.
function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
