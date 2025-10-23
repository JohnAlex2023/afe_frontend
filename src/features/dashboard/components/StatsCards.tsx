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
  // Paleta de colores mejorada y sincronizada según mejores prácticas UX/UI
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
      // Amarillo corporativo para estados pendientes/en revisión
      color: '#f59e0b', // Amber 500 - más visible que el amarillo pastel
      bgGradient: 'linear-gradient(135deg, #f59e0b10, #f59e0b05)',
      border: '1px solid #f59e0b30',
      icon: <RemoveRedEye />,
      filter: 'en_revision',
    },
    {
      key: 'aprobadas',
      label: 'APROBADAS',
      value: stats.aprobadas,
      // Verde corporativo para aprobados manuales
      color: zentriaColors.verde.main, // #00B094
      bgGradient: `linear-gradient(135deg, ${zentriaColors.verde.main}10, ${zentriaColors.verde.main}05)`,
      border: `1px solid ${zentriaColors.verde.main}30`,
      icon: <CheckCircle />,
      filter: 'aprobada',
    },
    {
      key: 'aprobadas_auto',
      label: 'APROBADAS AUTO',
      value: stats.aprobadas_auto,
      // Verde más claro (cyan) para aprobados automáticos - diferenciación visual
      color: '#45E3C9', // zentriaColors.verde.light - más claro que aprobadas manuales
      bgGradient: 'linear-gradient(135deg, #45E3C910, #45E3C905)',
      border: '1px solid #45E3C930',
      icon: <SmartToy />,
      filter: 'aprobada_auto',
    },
    {
      key: 'rechazadas',
      label: 'RECHAZADAS',
      value: stats.rechazadas,
      // Naranja corporativo para rechazados - alerta sin ser demasiado agresivo
      color: zentriaColors.naranja.main, // #FF5F3F
      bgGradient: `linear-gradient(135deg, ${zentriaColors.naranja.main}10, ${zentriaColors.naranja.main}05)`,
      border: `1px solid ${zentriaColors.naranja.main}30`,
      icon: <Cancel />,
      filter: 'rechazada',
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statsConfig.map((stat, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 2.4, lg: 2.4 }} key={index}>
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
