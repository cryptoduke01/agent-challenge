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

    const performanceAnalysis = codeStore.analyzePerformance(code, language);

    return NextResponse.json(performanceAnalysis);

  } catch (error) {
    console.error('Performance analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze performance' },
      { status: 500 }
    );
  }
}
