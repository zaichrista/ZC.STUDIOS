# Enquiry form -> Google Sheet (one-time setup, ~3 minutes)

1. Create a new Google Sheet (signed in as zairachristastudios@gmail.com), name it "ZC Studios Enquiries".
2. Extensions > Apps Script. Delete the default code, paste in `Code.gs`, save.
3. Deploy > New deployment > type "Web app". Execute as: **Me**. Who has access: **Anyone**. Deploy and authorise when asked.
4. Copy the Web app URL (ends in `/exec`).
5. In `js/site.js`, set `var ENDPOINT = 'that URL';`, then `npm run build` and push.

Each submission adds a row to the "Enquiries" tab and emails you a copy.
Until ENDPOINT is set, the form just opens the visitor's email app instead.
