// Paste into script.google.com (bound to your Google Sheet via Extensions > Apps Script).
var SHEET_NAME = 'Enquiries';
var NOTIFY = 'zairachristastudios@gmail.com';

function doPost(e) {
  var p = e.parameter;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(['Received', 'Name', 'Email', 'Venue', 'Website', 'Service', 'Message']);
  sh.appendRow([new Date(), p.name, p.email, p.venue, p.website, p.service, p.message]);
  MailApp.sendEmail(NOTIFY, 'New enquiry: ' + p.service,
    'From: ' + p.name + ' <' + p.email + '>\nVenue: ' + p.venue + '\nWebsite: ' + p.website + '\n\n' + p.message);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
