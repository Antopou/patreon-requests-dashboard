import { google } from 'googleapis';
import { RequestItem } from '@/types/request';

// These should be stored in environment variables
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '';
const SHEET_ID = 277611643; // Use the sheet ID from your URL (gid=277611643)

// Initialize Google Sheets API with JWT
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL || '',
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Convert RequestItem to array for Google Sheets
function requestItemToArray(item: RequestItem): (string | number)[] {
  return [
    item.patreonName, // Patreon (A)
    item.tier, // Tier (B)
    item.dateRequested, // Request Date (C)
    item.characterName, // Character Name (D)
    item.origin || '', // Anime / Origin (E)
    item.requestType, // Type (F)
    item.status, // Status (G)
    item.notes || '', // Notes (H)
  ];
}

// Convert array from Google Sheets to RequestItem
function arrayToRequestItem(row: string[], index: number, headerOffset = 0): RequestItem {
  // Sheet rows are 1-based; header offset accounts for header row present
  const sheetRowNumber = index + 1 + headerOffset; // index 0 -> row 1 if no header, row 2 if header exists

  return {
    id: `req-${sheetRowNumber}`,
    patreonName: row[0] || '', // Patreon Name
    tier: row[1] as any, // Tier
    characterName: row[3] || '', // Character Name
    origin: row[4] || '', // Anime / Origin
    requestType: row[5] as any, // Type
    status: row[6] as any, // Status
    priority: 'Normal' as any, // Default priority (not in sheet)
    dateRequested: row[2] || new Date().toISOString(), // Request Date
    revisionCount: 0, // Default (not in sheet)
    notes: row[7] || '', // Notes
  };
}

// Get all requests from Google Sheets
export async function getRequests(): Promise<RequestItem[]> {
  try {
    if (!SPREADSHEET_ID) {
      console.warn('Google Sheets not configured, using empty array');
      return [];
    }

    // ...existing code...
    
    // Get the correct sheet name
    const sheetName = await getSheetName();
    // console.log('Using sheet name:', sheetName);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetName}'!A:K`,
    });

    const rows = response.data.values || [];
    
    // Detect header row (column A starts with "Patreon" or "Patreon Name")
    const hasHeader = rows.length > 0 && typeof rows[0][0] === 'string' && rows[0][0].toLowerCase().includes('patreon');

    // Skip header row if present
    const dataRows = hasHeader ? rows.slice(1) : rows;
    const headerOffset = hasHeader ? 1 : 0;
    
    return dataRows.map((row, index) => arrayToRequestItem(row, index, headerOffset));
  } catch (error) {
    console.error('Error fetching requests from Google Sheets:', error);
    return [];
  }
}

// Add a new request to Google Sheets
export async function addRequest(item: RequestItem): Promise<boolean> {
  try {
    if (!SPREADSHEET_ID) {
      console.warn('Google Sheets not configured, cannot add request');
      return false;
    }

    // Get the correct sheet name
    const sheetName = await getSheetName();

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetName}'!A:K`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [requestItemToArray(item)],
      },
    });

    return response.status === 200;
  } catch (error) {
    console.error('Error adding request to Google Sheets:', error);
    return false;
  }
}

// Get sheet metadata to find the correct sheet name
async function getSheetName(): Promise<string> {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    const sheetName = response.data.sheets?.[0]?.properties?.title || 'Character Request Tracker';
    return sheetName;
  } catch (error) {
    console.error('Error getting sheet name, falling back to Character Request Tracker:', error);
    return 'Character Request Tracker';
  }
}

// Update an existing request in Google Sheets
export async function updateRequest(id: string, updates: Partial<RequestItem>): Promise<boolean> {
  try {
    if (!SPREADSHEET_ID) {
      console.warn('Google Sheets not configured, cannot update request');
      return false;
    }

    // Get the correct sheet name
    const sheetName = await getSheetName();

    // Get all requests to find the row index
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetName}'!A:K`,
    });

    const rows = response.data.values || [];
    if (rows.length < 2) {
      console.error('Sheet appears to be empty');
      return false;
    }

    // Try multiple strategies to find the row
    // Strategy 1: Match by ID in first column
    let rowIndex = rows.findIndex((row, idx) => idx > 0 && row[0] === id);
    
      // Strategy 2: If ID not found and starts with "req-", we encoded the sheet row number in the ID
      // ID format: req-<sheetRowNumber>. rows[] is 0-based (includes header if present), so rowIndex = sheetRowNumber - 1.
      if (rowIndex === -1 && id.startsWith('req-')) {
        const sheetRowNumber = parseInt(id.replace('req-', ''));
        if (!isNaN(sheetRowNumber) && sheetRowNumber >= 1) {
          rowIndex = sheetRowNumber - 1;
          // console.log(`Using sheetRow mapping: ${id} -> rowIndex ${rowIndex} (sheet row ${sheetRowNumber})`);
        }
      }

      if (rowIndex === -1 || rowIndex >= rows.length) {
        console.error('Request not found:', id, 'rowIndex:', rowIndex, 'total rows:', rows.length);
        return false;
      }

      // console.log(`Updating row ${rowIndex} (sheet row ${rowIndex + 1}) for ID: ${id}`);

    // Build the current full request by merging with existing data (columns A-H)
    const existingRow = rows[rowIndex];
    const currentRequest: RequestItem = {
      id,
      patreonName: existingRow[0] || '',       // Patreon Name (A)
      tier: existingRow[1] as any,              // Tier (B)
      dateRequested: existingRow[2] || new Date().toISOString(), // Request Date (C)
      characterName: existingRow[3] || '',      // Character Name (D)
      origin: existingRow[4] || '',             // Anime / Origin (E)
      requestType: existingRow[5] as any,       // Type (F)
      status: existingRow[6] as any,            // Status (G)
      notes: existingRow[7] || '',              // Notes (H)
      priority: 'Normal' as any,                // Not stored in sheet
      revisionCount: 0,                         // Not stored in sheet
    };

    // Merge updates
    const updatedRequest = { ...currentRequest, ...updates };

    // Convert back to array and update
    const updatedRow = requestItemToArray(updatedRequest);

    const updateResponse = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetName}'!A${rowIndex + 1}:H${rowIndex + 1}`, // Only update columns we manage (A-H)

      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    });

    console.log('Update response:', {
      status: updateResponse.status,
      statusText: updateResponse.statusText,
      updatedCells: updateResponse.data.updatedCells,
      updatedRows: updateResponse.data.updatedRows,
    });

    return updateResponse.status === 200;
  } catch (error) {
    console.error('Error updating request in Google Sheets:', error);
    return false;
  }
}

// Delete a request from Google Sheets
export async function deleteRequest(id: string): Promise<boolean> {
  try {
    if (!SPREADSHEET_ID) {
      console.warn('Google Sheets not configured, cannot delete request');
      return false;
    }

    // First, get all requests to find the row index
    const requests = await getRequests();
    const rowIndex = requests.findIndex(r => r.id === id);
    
    if (rowIndex === -1) {
      console.error('Request not found:', id);
      return false;
    }

    // Delete the row (add 2 for 0-index + header row)
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: SHEET_ID, // Use the actual sheet ID
                dimension: 'ROWS',
                startIndex: rowIndex + 1, // Add 1 for header row
                endIndex: rowIndex + 2,   // End index is exclusive
              },
            },
          },
        ],
      },
    });

    return response.status === 200;
  } catch (error) {
    console.error('Error deleting request from Google Sheets:', error);
    return false;
  }
}

// Initialize the sheet with headers if it doesn't exist
export async function initializeSheet(): Promise<boolean> {
  try {
    if (!SPREADSHEET_ID) {
      console.warn('Google Sheets not configured, cannot initialize sheet');
      return false;
    }

    const headers = [
      'id',
      'patreonName',
      'tier',
      'characterName',
      'origin',
      'requestType',
      'status',
      'priority',
      'dateRequested',
      'revisionCount',
      'notes',
    ];

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'Character Request Tracker'!A1:K1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });

    return response.status === 200;
  } catch (error) {
    console.error('Error initializing Google Sheet:', error);
    return false;
  }
}
