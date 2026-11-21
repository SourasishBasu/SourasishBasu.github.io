/** Gunpla kits for the Off the clock bench, in shelf order: built first, then what's next. */
export interface Kit {
  id: string;
  name: string;
  code: string;
  grade: string;
  series: string;
  built: boolean;
  /** Built: when it was finished. Not built: where it sits in the queue. */
  when: string;
  whenLabel: 'Built' | 'Status';
  /** A 3D model exists for this kit. */
  model?: 'dynames';
}

export const kits: Kit[] = [
  {
    id: 'dynames',
    name: 'Gundam Dynames',
    code: 'GN-002',
    grade: 'MG · 1/100',
    series: 'Mobile Suit Gundam 00',
    built: true,
    when: '[Month Year]',
    whenLabel: 'Built',
    model: 'dynames',
  },
  {
    id: 'virtue',
    name: 'Gundam Virtue',
    code: 'GN-005',
    grade: 'MG · 1/100',
    series: 'Mobile Suit Gundam 00',
    built: true,
    when: '[Month Year]',
    whenLabel: 'Built',
  },
  {
    id: 'vidar',
    name: 'Gundam Vidar',
    code: 'ASW-G-XX',
    grade: 'MG · 1/100',
    series: 'Iron-Blooded Orphans',
    built: false,
    when: 'Up next',
    whenLabel: 'Status',
  },
  {
    id: 'freedom',
    name: 'Freedom Gundam',
    code: 'ZGMF-X10A',
    grade: '[Grade · scale]',
    series: 'Gundam SEED',
    built: false,
    when: 'After Vidar',
    whenLabel: 'Status',
  },
];
