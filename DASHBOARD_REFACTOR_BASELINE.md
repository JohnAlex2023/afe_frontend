# Dashboard Refactor Phase 1 - BASELINE DOCUMENTATION (CORRECTED)

**Date**: 2025-11-12
**Branch**: feat/dashboard-refactor-phase1
**Senior Owner**: Claude Code Senior
**Responsibility**: Ensure zero downtime, zero data loss
**CRITICAL FIX**: Corrected data model - "pendiente" state does NOT exist in backend

## BASELINE STATE (Before Changes)

### CRITICAL DATA MODEL CORRECTION
**Backend has ONLY these 5 estados** (NO "pendiente"):
- `en_revision` - Requires manual review
- `aprobada` - Manually approved
- `aprobada_auto` - Auto approved
- `rechazada` - Rejected
- `pagada` - Paid

⚠️ **FRONTEND BUG**: useDashboardData.ts line 50 incorrectly filters for `f.estado === 'pendiente'` which returns 0 always.

### Current Dashboard Layout
```
4 Charts in 1x4 Grid (25% each):
[BarChartFacturas] [PieChartEstados (REDUNDANT)] [LineChartMontos] [GaugeChartKPI]
```

### Component Structure
- **DashboardPage.tsx**: Main container, imports ChartsSection
- **ChartsSection.tsx**: Grid wrapper, imports all 4 charts
- **charts/BarChartFacturas.tsx**: Shows ONLY "Total" bar (line 108-112), not stacked
- **charts/PieChartEstados.tsx**: Pie chart with 5 states (REDUNDANT with KPIs)
- **charts/LineChartMontos.tsx**: Line chart with 3 lines (Monto Total, Subtotal, IVA)
- **charts/GaugeChartKPI.tsx**: Gauge for automation rate

### Data Flow
1. DashboardPage passes `stats` prop to ChartsSection
2. ChartsSection calls `useDashboardStats()` hook
3. Hook fetches monthly/workflow/comparison stats from backend
4. Data transformed and passed to each chart component

### Current Issues (Why We're Changing)
- **PieChartEstados**: 100% redundant with KPIs (265, 1, 56, 2 already visible)
- **BarChartFacturas**: Data prepared as stacked (line 48-56) but only "Total" rendered
- **Space Wasted**: 25% of dashboard with no unique value

## CHANGES PLANNED (PHASE 1)

### Change #1: BarChartFacturas → True Stacked Bar
**File**: `src/features/dashboard/components/charts/BarChartFacturas.tsx`

**What Changed**:
- Line 108-112: Replace single `<Bar dataKey="Total" />` with 5 stacked bars
- Colors: Pendientes=Naranja, En Revisión=Amarillo, Aprobadas=Verde, Aprobadas Auto=Cyan, Rechazadas=Naranja
- No API changes, no data changes, only visualization

**Before**:
```jsx
<Bar dataKey="Total" fill={zentriaColors.violeta.main} />
```

**After**:
```jsx
<Bar dataKey="Pendientes" stackId="a" fill={COLORS.pendientes} radius={[4, 4, 0, 0]} />
<Bar dataKey="En Revisión" stackId="a" fill={COLORS.en_revision} />
<Bar dataKey="Aprobadas Auto" stackId="a" fill={COLORS.aprobadas_auto} />
<Bar dataKey="Aprobadas" stackId="a" fill={COLORS.aprobadas} />
<Bar dataKey="Rechazadas" stackId="a" fill={COLORS.rechazadas} />
```

### Change #2: Remove PieChartEstados from ChartsSection
**File**: `src/features/dashboard/components/ChartsSection.tsx`

**What Changed**:
- Line 8-13: Remove `PieChartEstados` from imports
- Line 62-64: Remove `<Grid>` containing `PieChartEstados`

**Result**: 3 charts in grid (33% each)

## TESTING STRATEGY

### Before Commit:
1. ✅ Component renders without errors
2. ✅ Data values match original (no data loss)
3. ✅ Colors match Zentria palette
4. ✅ Responsive on mobile (xs, sm, lg breakpoints)
5. ✅ Tooltips work
6. ✅ Legend shows all 5 states

### Manual QA Checklist:
- [ ] Dashboard loads without errors
- [ ] BarChart shows 5 colors stacked
- [ ] Hover shows correct values
- [ ] Total height = same as before (proportional stacking)
- [ ] PieChart is gone from UI
- [ ] Grid spacing looks balanced
- [ ] No console errors

## ROLLBACK PLAN

If anything breaks:
```bash
# Option 1: Stash commits and go back to main
git reset --hard HEAD~1

# Option 2: Restore from stash if needed
git stash list
git stash pop stash@{0}

# Option 3: Full revert to main
git checkout main
```

## METRICS TO TRACK
- Bundle size: Should stay same or decrease (removed component)
- Runtime performance: Should improve (fewer DOM elements)
- User feedback: Monitor if anyone complains about missing pie chart

## SIGN-OFF

- [ ] Code Review Complete
- [ ] Tests Pass
- [ ] QA Approval
- [ ] Merge to main
