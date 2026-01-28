const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const INPUT_FILE = 'Character Request Tracker - redesigned.xlsx';
const OUTPUT_FILE = 'lib/seedData.ts';

function generateId() {
    return crypto.randomUUID().slice(0, 8);
}

// Helper to sanitize strings
const safeStr = (v) => (v ? String(v).trim() : "");

// Helper to parse Excel dates
function parseDate(v) {
    if (!v) return undefined;
    // If it's a number (Excel serial date)
    if (typeof v === 'number') {
        const d = new Date(Math.round((v - 25569) * 86400 * 1000));
        return d.toISOString();
    }
    // If it's looking like a string date
    const d = new Date(v);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
}

try {
    const workbook = XLSX.readFile(INPUT_FILE);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    // console.log(`Found ${rawData.length} rows.`);

    const items = rawData
        .filter(row => row['Patreon Name'] && row['Patreon Name'] !== 'Patreon Name') // Filter empty or header rows
        .map(row => {
            // Map fields
            return {
                id: safeStr(row['Request ID']) || generateId(),
                patreonName: safeStr(row['Patreon Name']),
                tier: safeStr(row['Tier']) || "Basic",
                characterName: safeStr(row['Character Name']) || "Unknown",
                requestType: safeStr(row['Request Type']) || "Portrait",
                status: safeStr(row['Status']) || "Pending",
                priority: safeStr(row['Priority']) || "Normal",
                dateRequested: parseDate(row['Date Requested']) || new Date().toISOString(),
                dateStarted: parseDate(row['Date Started']),
                dateCompleted: parseDate(row['Date Completed']),
                revisionCount: parseInt(row['Revision Count'] || '0', 10),
                notes: safeStr(row['Notes'])
            };
        });

    const fileContent = `import { RequestItem } from "@/types/request";

export const IMPORTED_REQUESTS: RequestItem[] = ${JSON.stringify(items, null, 2)};
`;

    fs.writeFileSync(OUTPUT_FILE, fileContent);
    // console.log(`Successfully wrote ${items.length} items to ${OUTPUT_FILE}`);

} catch (error) {
    console.error('Error converting file:', error);
    process.exit(1);
}
