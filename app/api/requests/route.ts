import { NextRequest, NextResponse } from 'next/server';
import { IMPORTED_REQUESTS } from '@/lib/seedData';
import { RequestItem } from '@/types/request';

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
      // Better CSV parser that handles quoted fields properly
      const values = [];
      let current = '';
      let inQuotes = false;
      let i = 0;
      
      while (i < line.length) {
        const char = line[i];
        
        if (char === '"') {
          if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
            // Escaped quote within quotes
            current += '"';
            i += 2;
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
            i++;
          }
        } else if (char === ',' && !inQuotes) {
          // Field separator
          values.push(current.trim());
          current = '';
          i++;
        } else {
          current += char;
          i++;
        }
      }
      values.push(current.trim()); // Add the last value
      
      // Clean up values (remove surrounding quotes)
      const cleanValues = values.map(v => {
        if (v.startsWith('"') && v.endsWith('"')) {
          return v.slice(1, -1);
        }
        return v;
      });
      
      // Skip rows that don't have enough columns or have empty patreon name
      if (cleanValues.length < 7 || !cleanValues[0]) {
        console.log('Skipping malformed row:', cleanValues);
        return null;
      }
      
      // Debug: log the parsed values
      console.log('Parsed values:', cleanValues);
      
      // Calculate days since request
      const requestDate = new Date(cleanValues[2]);
      const today = new Date();
      const daysSinceRequest = Math.floor((today.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: '',
        patreonName: cleanValues[0] || '', // Patron Name
        tier: cleanValues[1] as any, // Tier
        characterName: cleanValues[3] || '', // Character Name (4th column)
        origin: cleanValues[4] || '', // Anime / Origin
        requestType: cleanValues[5] as any, // Type
        status: cleanValues[6] as any, // Status
        priority: 'Normal' as any, // Default priority (not in CSV)
        dateRequested: cleanValues[2] || new Date().toISOString(), // Request Date (3rd column)
        revisionCount: 0, // Default revision count (not in CSV)
        notes: cleanValues[7] || '', // Notes (8th column)
        daysSinceRequest: daysSinceRequest, // Add days since request
      };
    })
    .filter(item => item !== null); // Remove null rows
}

// GET all requests
export async function GET() {
  try {
    if (!CSV_URL) {
      console.warn('GOOGLE_SHEETS_CSV_URL not configured - serving seed data');
      return respondWithSeedData();
    }

    const response = await fetch(CSV_URL, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('Raw CSV data:', csvText.substring(0, 500)); // Log first 500 chars
    
    const requests = parseCSV(csvText).map(normalizeRequest);
    console.log('Parsed requests:', requests.slice(0, 2)); // Log first 2 requests
    
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

// PUT update a request (CSV is read-only for now)
export async function PUT(request: NextRequest) {
  try {
    // For now, CSV is read-only
    console.log('CSV is read-only - using localStorage for updates');
    return NextResponse.json({ success: true });
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
