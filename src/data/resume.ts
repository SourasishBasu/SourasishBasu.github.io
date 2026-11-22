/**
 * The resume is written in Typst: resume/resume.typ holds the words and resume/template.typ the layout. It's compiled
 * at build time, so every deploy produces the PDF at /resume.pdf and the page drawn on /resume/ from the same source.
 * Paths are relative to the project root, where Astro and the tests run.
 */
import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler';

export const RESUME_SOURCE = 'resume/resume.typ';
export const RESUME_PDF = '/resume.pdf';
export const RESUME_DOWNLOAD_NAME = 'Sourasish-Basu-Resume.pdf';

export interface Resume {
  pdf: Uint8Array<ArrayBuffer>;
  /** Each page as an SVG drawing, glyphs as outlines. */
  svg: string;
  pages: number;
  warnings: string[];
}

let compiler: NodeCompiler | undefined;

const messages = (e: { shortDiagnostics: { message?: string }[] } | null) =>
  (e?.shortDiagnostics ?? []).map((d) => d.message ?? String(d));

/**
 * typst.ts's SVG carries a stylesheet for its selectable text layer, and one rule in it, `svg { fill: none }`, would
 * reach every icon on the page once the drawing is inlined. Scope that rule to the drawing itself.
 */
export function scopeSvg(svg: string): string {
  return svg.replace(/(^|[}>]\s*)svg\s*\{/g, '$1.typst-doc {');
}

/** Compile the resume; throws with Typst's messages when it doesn't compile. */
export function compileResume(): Resume {
  compiler ??= NodeCompiler.create({ workspace: 'resume', fontArgs: [{ fontPaths: ['resume/fonts'] }] });
  // resetRead picks up edits to the .typ files between requests in dev.
  const result = compiler.compile({ mainFilePath: RESUME_SOURCE, resetRead: true });
  const doc = result.result;
  if (!doc || result.hasError()) {
    throw new Error(`${RESUME_SOURCE} didn't compile:\n${messages(result.takeError()).join('\n')}`);
  }
  const warnings = messages(result.takeWarnings());
  for (const w of warnings) console.warn(`[resume] ${w}`);
  return {
    pdf: new Uint8Array(compiler.pdf(doc, { pdfTags: true })),
    svg: compiler.svg(doc),
    pages: doc.numOfPages,
    warnings,
  };
}
