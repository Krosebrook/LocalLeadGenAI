
import React from 'react';
import { OpportunityType } from '../types';
import { ShieldAlert, TrendingUp, Info } from 'lucide-react';

interface Props {
  type: OpportunityType;
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
    }
  };

  const styles = getStyles();

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium uppercase tracking-wider ${styles.bg} ${styles.text} ${styles.border}`}>
      {styles.icon}
      {type}
    </div>
  );
};

export default OpportunityBadge;
