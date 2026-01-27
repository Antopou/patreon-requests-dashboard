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
function requestItemToArray(item: RequestItem): string[] {
  return [
    item.id,
    item.patreonName,
    item.tier,
    item.characterName,
    item.origin || '',
    item.requestType,
    item.status,
    item.priority.toString(),
    item.dateRequested,
    item.revisionCount.toString(),
    item.notes || '',
  ];
}

// Convert array from Google Sheets to RequestItem
function arrayToRequestItem(row: string[]): RequestItem {
  return {
    id: row[0] || '',
    patreonName: row[1] || '',
    tier: row[2] as any,
    characterName: row[3] || '',
    origin: row[4] || '',
    requestType: row[5] as any,
    status: row[6] as any,
    priority: parseInt(row[7]) || 1 as any,
    dateRequested: row[8] || new Date().toISOString(),
    revisionCount: parseInt(row[9]) || 0,
    notes: row[10] || '',
  };
}

// Get all requests from Google Sheets
export async function getRequests(): Promise<RequestItem[]> {
  try {
    if (!SPREADSHEET_ID) {
      console.warn('Google Sheets not configured, using empty array');
      return [];
    }

    console.log('Attempting to fetch from sheet:', SPREADSHEET_ID);
    
    // First, let's try to get the sheet info to see what sheets are available
    try {
      const sheetInfo = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });
      console.log('Available sheets:', sheetInfo.data.sheets?.map(s => ({ 
        name: s.properties?.title, 
        id: s.properties?.sheetId 
      })));
    } catch (infoError) {
      console.log('Could not get sheet info:', infoError);
    }
    
    // Try to get data by sheet ID instead of name
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_ID}!A:K`, // Use sheet ID instead of name
    });

    const rows = response.data.values || [];
    
    // Skip header row if exists
    const dataRows = rows.length > 0 && rows[0][0] === 'id' ? rows.slice(1) : rows;
    
    return dataRows.map(arrayToRequestItem);
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

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `'Character Request Tracker'!A:K`,
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

// Update an existing request in Google Sheets
export async function updateRequest(id: string, updates: Partial<RequestItem>): Promise<boolean> {
  try {
    if (!SPREADSHEET_ID) {
      console.warn('Google Sheets not configured, cannot update request');
      return false;
    }

    // First, get all requests to find the row index
    const requests = await getRequests();
    const rowIndex = requests.findIndex(r => r.id === id);
    
    if (rowIndex === -1) {
      console.error('Request not found:', id);
      return false;
    }

    // Update the request
    const updatedRequest = { ...requests[rowIndex], ...updates };
    
    // Update the row (add 2 for 0-index + header row)
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'Character Request Tracker'!A${rowIndex + 2}:K${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [requestItemToArray(updatedRequest)],
      },
    });

    return response.status === 200;
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
