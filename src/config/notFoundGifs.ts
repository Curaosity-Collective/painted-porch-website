import oopsyDaisy from "@/assets/not-found/oopsy-daisy.webp";

/**
 * The GIFs the Page not found screen rotates through: one is picked at random each time the page opens, so
 * visitors see different ones now and then (PPS Admin, 2026-11-09: "a rotating set of 404 page not found GIFs,
 * where different ones are shown at each visit of the page (not precise, but just a fun rotation here and
 * there)"). The files live in the site itself, not on the old Kajabi site, so they can't break if that account
 * closes.
 *
 * To add one: put the file in src/assets/not-found/ (an animated WebP is a tenth the size of the GIF; the
 * Oopsy-Daisy one went from 3 MB to 330 KB), import it here, and add a line with alt text that says what
 * happens in it. Faces must be real people, never AI-generated (PPS-DEC-0023).
 */
export const NOT_FOUND_GIFS: readonly { src: string; alt: string }[] = [
  { src: oopsyDaisy, alt: "Moira Rose from Schitt's Creek saying “Oopsy-daisy”" },
];

/** One GIF from the set, at random. `random` is injectable for tests. */
export function pickNotFoundGif(random: () => number = Math.random) {
  const i = Math.min(Math.floor(random() * NOT_FOUND_GIFS.length), NOT_FOUND_GIFS.length - 1);
  return NOT_FOUND_GIFS[Math.max(i, 0)];
}
