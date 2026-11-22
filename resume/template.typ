// Resume layout. resume.typ holds the words; this file holds the look.
//
// Modelled on the LaTeX template the resume used before (Aras Gungore's, MIT):
// US Letter, half-inch margins, Computer Modern at 11pt, small-caps section
// heads over a rule, and two-column rows for each role. New Computer Modern is
// built into Typst; FontAwesome 4 (fonts/, SIL OFL 1.1) draws the contact icons.

#let fa = (at: 0xf1fa, linkedin: 0xf08c, github: 0xf09b, mail: 0xf0e0, globe: 0xf0ac, phone: 0xf095)

#let icon(name) = text(font: "FontAwesome", str.from-unicode(fa.at(name)))

// LaTeX sizes at an 11pt base: \small, \footnotesize, \large, \Huge.
#let small = 10pt
#let footnote = 9pt
#let large = 12pt
#let huge = 24.88pt

// Left indent of every entry, and how far short of the right margin its dates stop.
#let entry-inset = (left: 0.15in, right: 0.075in)

#let resume(name: "", contacts: (), body) = {
  set document(title: name + " – Resume", author: name)
  set page(paper: "us-letter", margin: (x: 0.5in, top: 0.5in, bottom: 0.45in))
  set text(font: "New Computer Modern", size: 11pt, lang: "en", hyphenate: false)
  set par(justify: false, leading: 0.52em, spacing: 0.52em)
  set underline(offset: 2pt, stroke: 0.4pt)

  // Section heads: small caps over a full-width rule.
  show heading.where(level: 1): it => block(above: 12pt, below: 7pt, width: 100%, stack(
    spacing: 3.5pt,
    text(size: large, weight: "regular", smallcaps(it.body)),
    line(length: 100%, stroke: 0.4pt),
  ))

  align(center, {
    text(size: huge, weight: "bold", name)
    v(9pt, weak: true)
    text(size: small, contacts.map(c => [#icon(c.icon)#h(1.5pt)#link(c.url, c.label)]).join[ #h(1pt)|#h(1pt) ])
  })
  v(2pt)

  body
}

// Bulleted points under a role or project: \small text, a tiny centred bullet.
#let points(body) = {
  set text(size: small)
  set list(
    marker: text(size: 6pt, baseline: -0.7pt, sym.bullet),
    indent: 15.7pt,
    body-indent: 5.5pt,
    spacing: 4.6pt,
  )
  body
}

// A job or a school: name and place on the first line, title and dates under it.
#let role(name: "", place: "", title: "", dates: [], body) = block(above: 9pt, below: 0pt, width: 100%, {
  block(inset: entry-inset, below: 5.8pt, grid(
    columns: (1fr, auto),
    row-gutter: 6.6pt,
    text(size: large, weight: "bold", name), place,
    text(size: small, title), text(size: footnote, dates),
  ))
  if body != [] { pad(left: entry-inset.left, points(body)) }
})

// A project: its name and a link on one line, then its points.
#let project(name: "", url: none, label: "Github Link", body) = block(above: 8pt, below: 0pt, width: 100%, {
  block(inset: entry-inset, below: 5.6pt, [*#name* #h(1pt)|#h(1pt) #underline(link(url, label))])
  pad(left: entry-inset.left, points(body))
})

// Skills: one \small line per group, its label in bold.
#let skills(..groups) = block(inset: entry-inset, above: 2pt, width: 100%, {
  set text(size: small)
  set par(spacing: 0.52em + 2pt)
  for (label, items) in groups.pos() [*#label:* #items #parbreak()]
})

// A certificate or membership: its name, and the date on the right.
#let award(name: "", date: "") = block(inset: entry-inset, above: 8pt, width: 100%, grid(
  columns: (1fr, auto),
  text(weight: "bold", name), text(size: small, date),
))
