import { NextResponse } from 'next/server';
import path from 'path';
import * as XLSX from 'xlsx';
import { RequestItem } from '@/types/request';

const EXCEL_FILE = 'Character Request Tracker - redesigned.xlsx';

export async function POST(request: Request) {
  try {
    const items: RequestItem[] = await request.json();
    
    // correct path relative to project root
    const filePath = path.resolve(process.cwd(), EXCEL_FILE);
    
    // Map items back to Excel row format
    const rows = items.map(item => ({
      "Request ID": item.id,
      "Patreon Name": item.patreonName,
      "Tier": item.tier,
      "Character Name": item.characterName,
      "Request Type": item.requestType,
      "Status": item.status,
      "Priority": item.priority,
      "Date Requested": item.dateRequested ? new Date(item.dateRequested) : undefined,
      "Days Waiting": undefined, // Excel formula usually, orcalc
      "Date Started": item.dateStarted ? new Date(item.dateStarted) : undefined,
      "Date Completed": item.dateCompleted ? new Date(item.dateCompleted) : undefined,
      "SLA (Days)": undefined,
      "Overdue?": undefined,
      "Revision Count": item.revisionCount,
      "Notes": item.notes
    }));

    // Create a new workbook
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Requests");

    // Write to file
    try {
      XLSX.writeFile(workbook, filePath);
    } catch (writeErr: any) {
      console.error('Write error:', writeErr);
      if (writeErr.code === 'EBUSY' || writeErr.message.includes('permission') || writeErr.message.includes('cannot save')) {
        return NextResponse.json(
          { success: false, error: 'The Excel file is currently open. Please close it and try again.' },
          { status: 423 } // 423 Locked
        );
      }
      throw writeErr;
    }
    
    return NextResponse.json({ success: true, count: items.length });
    
  } catch (error: any) {
    console.error('Failed to sync to Excel:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to write execution.' },
      { status: 500 }
    );
  }
}
