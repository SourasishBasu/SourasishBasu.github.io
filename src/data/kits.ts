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
  /** A 3D model for the bench: the Dynames is built in code, the others are glTF models from Sketchfab. */
  model?: 'dynames' | 'virtue' | 'freedom';
  /** Who made the model, when it isn't ours (CC BY needs credit). */
  modelCredit?: { author: string; href: string; license: string };
  /**
   * Otherwise: a cut-out picture of the kit. `x` is where its body sits across the picture (0–1), so a
   * weapon held out to one side doesn't pull the kit off centre.
   */
  art?: { src: string; width: number; height: number; x: number };
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
    model: 'virtue',
    modelCredit: { author: 'cosmos28', href: 'https://sketchfab.com/3d-models/gundam-virtue-7f3bc6b2e4544c809a6bfd4cf77db777', license: 'CC BY 4.0' },
    art: { src: '/gunpla/virtue.webp', width: 788, height: 754, x: 0.61 },
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
    art: { src: '/gunpla/vidar.webp', width: 795, height: 810, x: 0.61 },
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
    model: 'freedom',
    modelCredit: { author: 'cosmos28', href: 'https://sketchfab.com/3d-models/gundam-freedom-02042775eda240c09d8a39ecc989ad29', license: 'CC BY 4.0' },
    art: { src: '/gunpla/freedom.webp', width: 872, height: 826, x: 0.48 },
  },
];
