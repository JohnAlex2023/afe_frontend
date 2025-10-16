/**
 * Statistics cards component for Dashboard
 */

import { Grid } from '@mui/material';
import {
  AttachFile,
  RemoveRedEye,
  CheckCircle,
  SmartToy,
  Cancel,
} from '@mui/icons-material';
import { zentriaColors } from '../../../theme/colors';
import type { DashboardStats } from '../types';
import { EnhancedStatCard } from './EnhancedStatCard';

interface StatsCardsProps {
  stats: DashboardStats;
  previousStats?: DashboardStats;
  onCardClick?: (filter: string) => void;
}

interface StatCard {
  key: keyof DashboardStats;
  label: string;
  value: number;
  color: string;
  bgGradient: string;
  border: string;
  icon: React.ReactElement;
  filter: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, previousStats, onCardClick }) => {
  const statsConfig: StatCard[] = [
    {
      key: 'total',
      label: 'TOTAL FACTURAS',
      value: stats.total,
      color: zentriaColors.violeta.main,
      bgGradient: `linear-gradient(135deg, ${zentriaColors.violeta.main}10, ${zentriaColors.violeta.main}05)`,
      border: `1px solid ${zentriaColors.violeta.main}30`,
      icon: <AttachFile />,
      filter: 'todos',
    },
    {
      key: 'en_revision',
      label: 'EN REVISIÓN',
      value: stats.en_revision,
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, #3b82f610, #3b82f605)',
      border: '1px solid #3b82f630',
      icon: <RemoveRedEye />,
      filter: 'en_revision',
    },
    {
      key: 'aprobadas',
      label: 'APROBADAS',
      value: stats.aprobadas,
      color: zentriaColors.verde.main,
      bgGradient: `linear-gradient(135deg, ${zentriaColors.verde.main}10, ${zentriaColors.verde.main}05)`,
      border: `1px solid ${zentriaColors.verde.main}30`,
      icon: <CheckCircle />,
      filter: 'aprobada',
    },
    {
      key: 'aprobadas_auto',
      label: 'APROBADAS AUTO',
      value: stats.aprobadas_auto,
      color: '#06b6d4',
      bgGradient: 'linear-gradient(135deg, #06b6d410, #06b6d405)',
      border: '1px solid #06b6d430',
      icon: <SmartToy />,
      filter: 'aprobada_auto',
    },
    {
      key: 'rechazadas',
      label: 'RECHAZADAS',
      value: stats.rechazadas,
      color: zentriaColors.naranja.main,
      bgGradient: `linear-gradient(135deg, ${zentriaColors.naranja.main}10, ${zentriaColors.naranja.main}05)`,
      border: `1px solid ${zentriaColors.naranja.main}30`,
      icon: <Cancel />,
      filter: 'rechazada',
    },
  ];

  return (
    <Grid container spacing={3} mb={4}>
      {statsConfig.map((stat, index) => (
        <Grid item xs={12} sm={6} md={2.4} lg={2.4} key={index}>
          <EnhancedStatCard
            label={stat.label}
            value={stat.value}
            previousValue={previousStats?.[stat.key]}
            color={stat.color}
            bgGradient={stat.bgGradient}
            border={stat.border}
            icon={stat.icon}
            onClick={onCardClick ? () => onCardClick(stat.filter) : undefined}
          />
        </Grid>
      ))}
    </Grid>
  );
};
