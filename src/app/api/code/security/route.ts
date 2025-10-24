import { NextRequest, NextResponse } from 'next/server';
import { codeStore } from '@/lib/code-store';

export async function POST(request: NextRequest) {
  try {
    const { code, language, framework } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    const securityScan = codeStore.scanSecurity(code, language);

    return NextResponse.json(securityScan);

  } catch (error) {
    console.error('Security scan error:', error);
    return NextResponse.json(
      { error: 'Failed to scan security' },
      { status: 500 }
    );
  }
}
