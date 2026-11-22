import type { APIRoute } from 'astro';
import { compileResume } from '../data/resume';

// /resume.pdf, compiled from resume/resume.typ when the site builds.
export const GET: APIRoute = () =>
  new Response(compileResume().pdf, { headers: { 'Content-Type': 'application/pdf' } });
