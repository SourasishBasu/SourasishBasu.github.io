// Work experience, verbatim from the design. Atlan metrics stay as [placeholders]
// until there are numbers cleared for public use.

export type CellIcon = 'cost' | 'dash' | 'alert';

export interface Metric {
  /** One flap cell per character. */
  cells: string;
  label: string;
}

export interface Job {
  id: 'atlan' | 'adm';
  company: string;
  /** Name in the switcher. */
  shortName: string;
  /** Years in the switcher. */
  years: string;
  initials: string;
  /** Square brand mark in public/logos/ (the company's own file). */
  logo?: string;
  /** The mark brings its own frame, so it fills the slot instead of sitting inset. */
  logoFramed?: boolean;
  role: string;
  /** Short line under the company in the switcher. */
  short: string;
  when: string;
  where: string;
  summary?: string;
  cells?: { icon: CellIcon; title: string; body: string }[];
  metrics: Metric[];
  tags?: string[];
}

export const jobs: Job[] = [
  {
    id: 'atlan',
    company: 'Atlan',
    shortName: 'Atlan',
    years: '2025–now',
    initials: 'At',
    logo: '/logos/atlan-mark.png',
    logoFramed: true,
    role: 'Platform Engineer Intern',
    short: 'Platform · 2025–now',
    when: 'June 2025 – present',
    where: 'Remote',
    cells: [
      {
        icon: 'cost',
        title: 'Cloud cost',
        body: 'Root-caused cost spikes and built cost visibility across tenant infrastructure, to bring cost as a share of ARR down.',
      },
      {
        icon: 'dash',
        title: 'Dashboards',
        body: 'Self-service Grafana and Sigma dashboards over VictoriaMetrics, Snowflake and Mixpanel data.',
      },
      {
        icon: 'alert',
        title: 'Alerting',
        body: 'Distributed alerting workflows in Go on Temporal, so anomalies get caught before they turn into incidents.',
      },
    ],
    metrics: [
      { cells: '$##K', label: '[monthly cloud spend cut]' },
      { cells: '##h', label: '[hours saved a month]' },
      { cells: '###', label: '[clusters upgraded]' },
      { cells: '##', label: '[dashboards in daily use]' },
    ],
    tags: ['Go', 'Temporal', 'Grafana', 'Sigma', 'VictoriaMetrics', 'Snowflake', 'Mixpanel'],
  },
  {
    id: 'adm',
    company: 'Anonymous Digital Marketing',
    shortName: 'Anonymous Digital',
    years: '2024',
    initials: 'AD',
    logo: '/logos/anonymous-digital-mark.png',
    role: 'Software Engineer Intern',
    short: 'Software · 2024',
    when: 'June – Oct 2024',
    where: 'Kolkata',
    summary:
      'Built a highly available employee management and fraud-prevention app for the National Restaurant Association of India: Flask APIs, tuned PostgreSQL, Docker on AWS with CI/CD, and Prometheus and Grafana watching it. Manual intervention dropped by 40%.',
    metrics: [
      { cells: '35%', label: 'less employee fraud' },
      { cells: '60%', label: 'more efficient onboarding' },
      { cells: '200+', label: 'F&B businesses on it' },
      { cells: '99.9%', label: 'uptime' },
    ],
  },
];
