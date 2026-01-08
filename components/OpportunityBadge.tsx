
import React from 'react';
import { OpportunityType } from '../types';
import { ShieldAlert, TrendingUp, Info, AlertCircle } from 'lucide-react';

interface Props {
  type: OpportunityType | string;
}

const OpportunityBadge: React.FC<Props> = ({ type }) => {
  const getStyles = () => {
    switch (type) {
      case OpportunityType.LOW_REPUTATION:
        return {
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          border: 'border-red-500/30',
          icon: <ShieldAlert size={12} className="mr-1" />
        };
      case OpportunityType.UNDERVALUED:
        return {
          bg: 'bg-cyan-500/10',
          text: 'text-cyan-400',
          border: 'border-cyan-500/30',
          icon: <TrendingUp size={12} className="mr-1" />
        };
      case OpportunityType.MISSING_INFO:
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
          icon: <Info size={12} className="mr-1" />
        };
      default:
        // Default style for dynamic audit gaps
        return {
          bg: 'bg-rose-500/10',
          text: 'text-rose-400',
          border: 'border-rose-500/30',
          icon: <AlertCircle size={12} className="mr-1" />
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${styles.bg} ${styles.text} ${styles.border} transition-all hover:brightness-110`}>
      {styles.icon}
      {type}
    </div>
  );
};

export default OpportunityBadge;
