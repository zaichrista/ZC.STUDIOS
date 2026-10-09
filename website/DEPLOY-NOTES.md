# ZC Studios site: deploy notes

1. In your repo, back up the current index.html (rename to index-old.html, then delete once happy).
2. Copy everything in this folder into the repo root. Keep the existing /cases/ images (case-reach.jpg, case-mandaloun.jpg); they are not included here.
3. Typekit kit adg0sut must list your live domain (github.io host) or Sets Grotesk will fall back. Add it in Adobe Fonts > Web Projects.
4. Replace og/og-default.png (placeholder) with a real 1200x630 image.
5. Search Console: add the property, submit /ZC.STUDIOS/sitemap.xml, request indexing of the home page.
6. robots.txt only works at a host root. On github.io project paths it is ignored; it starts working once you use a custom domain (then update BASE/PATH, canonicals and sitemap).
7. Claims to confirm: "from £400" diagnosis, info@zairachrista.com, West London focus.
