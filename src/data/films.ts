// Films for Off the clock. The five-star list comes from Letterboxd (user
// sasquatch06); slugs, directors and poster URLs were checked against each
// film's Letterboxd page on 2026-11-22. Posters are Letterboxd's own thumbnails,
// shown linked back to the film, the way Letterboxd's widgets do.

export const letterboxd = {
  user: 'sasquatch06',
  profile: 'https://letterboxd.com/sasquatch06/',
  film: (slug: string) => `https://letterboxd.com/film/${slug}/`,
} as const;

/**
 * All-time films logged, from the Letterboxd profile. The profile page is
 * behind a bot check, so this is set by hand for now (phase 5 refreshes it).
 * null shows the placeholder flaps.
 */
export const filmsLogged: number | null = null;

export interface Film {
  title: string;
  year: number;
  director: string;
  slug: string;
  poster: string;
}

const P = 'https://a.ltrbxd.com/resized/';

export const fiveStar: Film[] = [
  { title: 'City of God', year: 2002, director: 'Fernando Meirelles', slug: 'city-of-god', poster: `${P}film-poster/5/1/5/2/3/51523-city-of-god-0-600-0-900-crop.jpg?v=7517ea94ce` },
  { title: 'Linda Linda Linda', year: 2005, director: 'Nobuhiro Yamashita', slug: 'linda-linda-linda', poster: `${P}film-poster/3/4/6/0/6/34606-linda-linda-linda-0-600-0-900-crop.jpg?v=8a8c1ef4f8` },
  { title: 'National Theatre Live: Fleabag', year: 2019, director: 'Tony Grech-Smith, Vicky Jones', slug: 'national-theatre-live-fleabag', poster: `${P}sm/upload/qt/or/uf/2m/fleabag%20p-0-600-0-900-crop.jpg?v=334f7a22f3` },
  { title: 'Uncut Gems', year: 2019, director: 'Josh Safdie, Benny Safdie', slug: 'uncut-gems', poster: `${P}film-poster/4/0/4/2/6/6/404266-uncut-gems-0-600-0-900-crop.jpg?v=670cb7034d` },
  { title: 'The Angry Birds Movie', year: 2016, director: 'Clay Kaytis, Fergal Reilly', slug: 'the-angry-birds-movie', poster: `${P}sm/upload/an/93/rb/va/t2mZzQXjpQxmqtJOPpe8Dr2YpMl-0-600-0-900-crop.jpg?v=9ca8f7540b` },
  { title: 'Shrek', year: 2001, director: 'Andrew Adamson, Vicky Jenson', slug: 'shrek', poster: `${P}film-poster/5/1/3/4/4/51344-shrek-0-600-0-900-crop.jpg?v=cd09df2c75` },
  { title: 'The Young Pope', year: 2016, director: 'Paolo Sorrentino', slug: 'the-young-pope', poster: `${P}sm/upload/zo/9s/20/j4/1HtIvHtEKXRbQSJLg1raqECKrmQ-0-600-0-900-crop.jpg?v=d64512250b` },
  { title: 'In Bruges', year: 2008, director: 'Martin McDonagh', slug: 'in-bruges', poster: `${P}film-poster/4/7/8/0/9/47809-in-bruges-0-600-0-900-crop.jpg?v=616745d99a` },
  { title: 'Whiplash', year: 2014, director: 'Damien Chazelle', slug: 'whiplash-2014', poster: `${P}sm/upload/cl/dn/kr/f1/4C9LHDxMsoYI0S3iMPZdm3Oevwo-0-600-0-900-crop.jpg?v=d13ea36528` },
  { title: 'Gangs of Wasseypur – Part 2', year: 2012, director: 'Anurag Kashyap', slug: 'gangs-of-wasseypur-part-2', poster: `${P}film-poster/9/8/8/3/6/98836-gangs-of-wasseypur-part-2-0-600-0-900-crop.jpg?v=55cfdb1bbf` },
  { title: 'Gangs of Wasseypur – Part 1', year: 2012, director: 'Anurag Kashyap', slug: 'gangs-of-wasseypur-part-1', poster: `${P}film-poster/9/3/2/9/6/93296-gangs-of-wasseypur-0-600-0-900-crop.jpg?v=44ba9f4ab0` },
  { title: 'Oldboy', year: 2003, director: 'Park Chan-wook', slug: 'oldboy', poster: `${P}film-poster/5/1/4/5/4/51454-oldboy-0-600-0-900-crop.jpg?v=294dbcadef` },
  { title: 'La La Land', year: 2016, director: 'Damien Chazelle', slug: 'la-la-land', poster: `${P}film-poster/2/4/0/3/4/4/240344-la-la-land-0-600-0-900-crop.jpg?v=053670ff84` },
];
