export const AWARDS = {
  MA000002: {
    code: 'MA000002',
    name: 'Clerks - Private Sector Award 2020',
    shortName: 'Clerks',
    description: 'Covers clerical and administrative employees in private sector businesses.',
    scope: 'Office/admin workers, receptionists, data entry, accounts clerks',
    workType: 'Admin',
    span: 'Mon-Fri 7am-7pm, Sat 7am-12:30pm',
    maxDaily: '10 hours (excl unpaid breaks)',
  },
  MA000038: {
    code: 'MA000038',
    name: 'Road Transport and Distribution Award 2020',
    shortName: 'RTD',
    description: 'Covers local transport and distribution workers including drivers and yard staff.',
    scope: 'Local transport drivers, warehouse, yard hands, driver facilitators',
    workType: 'Local Transport',
    span: 'Mon-Fri 5:30am-6:30pm',
    maxDaily: '8 hours ordinary',
  },
  MA000039: {
    code: 'MA000039',
    name: 'Road Transport (Long Distance Operations) Award 2020',
    shortName: 'RTLDO',
    description: 'Covers long distance transport operations where journeys exceed specific thresholds.',
    scope: 'Long distance drivers (journeys >100km from depot)',
    workType: 'Long Distance',
    span: 'Trip-based operations',
    maxDaily: 'Trip-based / CPK or hourly',
  },
};

export const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-Time' },
  { value: 'part_time', label: 'Part-Time' },
  { value: 'casual', label: 'Casual' },
];

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const SHIFTWORK_OPTIONS = [
  { value: 'none', label: 'No Shiftwork' },
  { value: 'afternoon', label: 'Afternoon Shift (+15%)' },
  { value: 'night', label: 'Night Shift (+15%)' },
  { value: 'permanent_night', label: 'Permanent Night (+30%)' },
];

export const PH_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'standard', label: 'Standard Public Holiday' },
  { value: 'special', label: 'Special (Good Fri/Xmas Day)' },
];

export const JUNIOR_RATES = {
  15: { pct: 45, label: 'Under 16 — 45%' },
  16: { pct: 50, label: 'Age 16 — 50%' },
  17: { pct: 60, label: 'Age 17 — 60%' },
  18: { pct: 70, label: 'Age 18 — 70%' },
  19: { pct: 80, label: 'Age 19 — 80%' },
  20: { pct: 90, label: 'Age 20 — 90%' },
};

export const ALLOWANCE_OPTIONS = [
  { key: 'first_aid', label: 'First Aid' },
  { key: 'leading_hand', label: 'Leading Hand' },
  { key: 'own_vehicle', label: 'Own Vehicle' },
  { key: 'dangerous_goods', label: 'Dangerous Goods' },
  { key: 'ot_meal', label: 'OT Meal Allowance' },
  { key: 'early_morning', label: 'Early Morning (RTD)', awardFilter: ['MA000038'] },
  { key: 'travelling', label: 'Travelling' },
  { key: 'furniture_livestock', label: 'Furniture/Livestock' },
  { key: 'excess_dimensions', label: 'Excess Dimensions' },
];

export const getDayOfWeek = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return DAYS_OF_WEEK[d.getDay() === 0 ? 6 : d.getDay() - 1];
};
