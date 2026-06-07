const FOLDER_ID = '1NGS0BC4M5oIX8t-rVHC7NZk5n8clcbjG';

function doGet(e) {
  const action   = e.parameter.action;
  const callback = e.parameter.callback || 'callback';
  let result;

  if (action === 'list')       result = listFiles();
  else if (action === 'read')  result = readFile(e.parameter.filename);
  else if (action === 'write') result = writeFile(
    e.parameter.filename,
    decodeURIComponent(e.parameter.text || '')
  );
  else result = { status: 'ok' };

  const json = JSON.stringify(result);
  return ContentService
    .createTextOutput(callback + '(' + json + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  let result;
  if (params.action === 'write') {
    result = writeFile(params.filename, params.text);
  } else {
    result = { error: 'unknown' };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function readFile(filename) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFilesByName(filename);
  if (!files.hasNext()) return { found: false, text: '' };
  return { found: true, text: files.next().getBlob().getDataAsString('utf-8') };
}

function writeFile(filename, text) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFilesByName(filename);
  if (files.hasNext()) {
    files.next().setContent(text);
  } else {
    folder.createFile(filename, text, MimeType.PLAIN_TEXT);
  }
  return { saved: true };
}

function listFiles() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFiles();
  const names = [];
  while (files.hasNext()) {
    const f = files.next();
    if (f.getMimeType() === MimeType.PLAIN_TEXT) names.push(f.getName());
  }
  return { files: names };
}
