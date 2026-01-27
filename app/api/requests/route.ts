import { NextRequest, NextResponse } from 'next/server';
import { IMPORTED_REQUESTS } from '@/lib/seedData';
import { RequestItem } from '@/types/request';
import { updateRequest as updateRequestInSheets, getRequests as getRequestsFromSheets } from '@/lib/sheets';

const CSV_URL = process.env.GOOGLE_SHEETS_CSV_URL || '';

// Ensure every request has stable fields and derived metadata
function normalizeRequest(item: RequestItem, index: number): RequestItem {
  const safeDate = item.dateRequested || new Date().toISOString();
  const requestDate = new Date(safeDate);
  const now = Date.now();
  const daysSinceRequest = Math.max(
    0,
    Math.floor((now - requestDate.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return {
    id: item.id || `req-${index}`,
    patreonName: item.patreonName || 'Unknown',
    tier: item.tier,
    characterName: item.characterName || '',
    origin: item.origin || '',
    requestType: item.requestType,
    status: item.status,
    priority: item.priority || 'Normal',
    dateRequested: safeDate,
    dateStarted: item.dateStarted,
    dateCompleted: item.dateCompleted,
    revisionCount: item.revisionCount ?? 0,
    notes: item.notes || '',
    details: item.details || '',
    daysSinceRequest,
  };
}

function respondWithSeedData() {
  const hydrated = IMPORTED_REQUESTS.map((item, index) => normalizeRequest(item, index));
  return NextResponse.json(hydrated, { status: 200, headers: { 'x-data-source': 'seed' } });
}

// Parse CSV data to RequestItem array
function parseCSV(csvText: string): RequestItem[] {
  const lines = csvText.split('\n');
  
  // Skip header row and filter out empty lines
  return lines.slice(1)
    .filter(line => line.trim() && !line.startsWith(','))
    .map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      let i = 0;

      while (i < line.length) {
        const char = line[i];

        if (char === '"') {
          if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i += 2;
          } else {
            inQuotes = !inQuotes;
            i++;
          }
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
          i++;
        } else {
          current += char;
          i++;
        }
      }
      values.push(current.trim());

      const cleanValues = values.map(v => {
        if (v.startsWith('"') && v.endsWith('"')) {
          return v.slice(1, -1);
        }
        return v;
      });

      if (cleanValues.length < 7 || !cleanValues[0]) {
        return null;
      }

      const requestDate = new Date(cleanValues[2]);
      const today = new Date();
      const daysSinceRequest = Math.floor((today.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: '',
        patreonName: cleanValues[0] || '',
        tier: cleanValues[1] as any,
        characterName: cleanValues[3] || '',
        origin: cleanValues[4] || '',
        requestType: cleanValues[5] as any,
        status: cleanValues[6] as any,
        priority: 'Normal' as any,
        dateRequested: cleanValues[2] || new Date().toISOString(),
        revisionCount: 0,
        notes: cleanValues[7] || '',
        daysSinceRequest: daysSinceRequest,
      };
    })
    .filter(item => item !== null); // Remove null rows
}

// GET all requests
export async function GET() {
  try {
    // First try to get from Google Sheets API (no cache delays)
    const sheetsRequests = await getRequestsFromSheets();
    
    if (sheetsRequests && sheetsRequests.length > 0) {
      console.log(`Loaded ${sheetsRequests.length} requests from Google Sheets API`);
      const normalized = sheetsRequests.map(normalizeRequest);
      return NextResponse.json(normalized);
    }

    // Fallback to CSV if Sheets API fails
    if (!CSV_URL) {
      console.warn('GOOGLE_SHEETS_CSV_URL not configured - serving seed data');
      return respondWithSeedData();
    }

    console.log('Sheets API failed, falling back to CSV export');
    const response = await fetch(CSV_URL, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const requests = parseCSV(csvText).map(normalizeRequest);
    
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching requests, serving seed data instead:', error);
    return respondWithSeedData();
  }
}

// POST a new request (CSV is read-only for now)
export async function POST(request: NextRequest) {
  try {
    // For now, CSV is read-only. We'll just return success and use localStorage
    console.log('CSV is read-only - using localStorage for new requests');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding request:', error);
    return NextResponse.json(
      { error: 'Failed to add request' },
      { status: 500 }
    );
  }
}

// PUT update a request
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Try to update in Google Sheets first
    const sheetsUpdated = await updateRequestInSheets(id, updates);
    
    if (sheetsUpdated) {
      console.log('Request updated in Google Sheets:', id);
      return NextResponse.json({ success: true, updated: 'sheets' });
    }

    // Fallback: just acknowledge (will be saved to localStorage client-side)
    console.log('Update acknowledged (will sync to localStorage):', id);
    return NextResponse.json({ success: true, updated: 'local' });
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}

// DELETE a request (CSV is read-only for now)
export async function DELETE(request: NextRequest) {
  try {
    // For now, CSV is read-only
    console.log('CSV is read-only - using localStorage for deletes');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting request:', error);
    return NextResponse.json(
      { error: 'Failed to delete request' },
      { status: 500 }
    );
  }
}
