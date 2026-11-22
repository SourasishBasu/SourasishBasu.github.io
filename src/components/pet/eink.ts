/**
 * Sasquatch's e-ink screen, shared by the footer pet and the 404's lost pet: Pwnagotchi-style faces and a status line
 * that types itself out. With reduced motion the line changes instantly instead of typing.
 */

export const FACES = {
  awake: '(◕‿‿◕)',
  lookRight: '( ⚆_⚆)',
  lookLeft: '(☉_☉ )',
  happyRight: '( ◕‿◕)',
  happyLeft: '(◕‿◕ )',
  friend: '(♥‿‿♥)',
  excited: '(ᵔ◡◡ᵔ)',
  grateful: '(^‿‿^)',
  annoyed: "(-_-')",
  sad: '(╥☁╥ )',
  sleep: '(⇀‿‿↼)',
  shock: '(°▃▃°)',
} as const;

export interface Screen {
  /** Change mood: the face, the mood label if there is one, and optionally a new line. */
  become(mood: string, face: string, text?: string): void;
  /** Change only the face (eyes following the pointer). */
  look(face: string): void;
  say(text: string): void;
  readonly mood: string;
}

export function screen(root: HTMLElement, initialMood = ''): Screen {
  const face = root.querySelector<HTMLElement>('[data-face]')!;
  const line = root.querySelector<HTMLElement>('[data-line]')!;
  const label = root.querySelector<HTMLElement>('[data-mood]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mood = initialMood;
  let typing = 0;

  const say = async (text: string) => {
    const id = ++typing;
    if (reduced) return void (line.textContent = text);
    line.textContent = '>';
    for (let i = 2; i <= text.length; i++) {
      if (id !== typing) return;
      line.textContent = text.slice(0, i);
      await new Promise((r) => setTimeout(r, 26));
    }
  };

  return {
    become(m, f, text) {
      mood = m;
      if (label) label.textContent = m;
      face.textContent = f;
      if (text) say(text);
    },
    look(f) {
      face.textContent = f;
    },
    say,
    get mood() {
      return mood;
    },
  };
}
