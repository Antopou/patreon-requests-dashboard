const ExcelJS = require('exceljs');

const filename = 'Character Request Tracker - redesigned.xlsx';
const workbook = new ExcelJS.Workbook();

await workbook.xlsx.readFile(filename);
const worksheet = workbook.worksheets[0];
const sheetName = worksheet.name;

// Get headers (first row)
const headers = [];
const firstRow = worksheet.getRow(1);
firstRow.eachCell((cell, colNumber) => {
    headers.push(cell.value || 'UNKNOWN ' + colNumber);
});

// console.log('Sheet Name:', sheetName);
// console.log('Headers:', JSON.stringify(headers, null, 2));

// Preview first 2 rows
const data = [];
worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    const rowData = {};
    row.eachCell((cell, colNumber) => {
        rowData[headers[colNumber - 1]] = cell.value;
    });
    data.push(rowData);
});
// console.log('First 2 rows:', JSON.stringify(data.slice(0, 2), null, 2));
