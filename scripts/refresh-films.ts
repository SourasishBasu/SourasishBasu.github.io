// Refresh the committed snapshot of recent well-rated films, used when a build
// can't reach Letterboxd. Run with: npm run films:refresh
import { writeFileSync } from 'node:fs';
import { fetchRecentFilms } from '../src/data/letterboxd.ts';

const films = await fetchRecentFilms('https://letterboxd.com/sasquatch06/', { min: 3.5, count: 12 });
if (!films.length) throw new Error('No films came back; snapshot left as it was.');
writeFileSync(new URL('../src/data/recent-films.snapshot.json', import.meta.url), JSON.stringify(films, null, 2) + '\n');
console.log(`Saved ${films.length} films (${films.filter((f) => f.still).length} with stills).`);
