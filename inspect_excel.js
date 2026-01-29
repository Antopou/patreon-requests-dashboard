const XLSX = require('xlsx');

const filename = 'Character Request Tracker - redesigned.xlsx';
const workbook = XLSX.readFile(filename);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Get headers (first row)
const headers = [];
const range = XLSX.utils.decode_range(sheet['!ref']);
const R = range.s.r; // First row
for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })];
    headers.push(cell ? cell.v : 'UNKNOWN ' + C);
}

// console.log('Sheet Name:', sheetName);
// console.log('Headers:', JSON.stringify(headers, null, 2));

// Preview first 2 rows
const data = XLSX.utils.sheet_to_json(sheet, { header: headers });
// console.log('First 2 rows:', JSON.stringify(data.slice(0, 2), null, 2));
