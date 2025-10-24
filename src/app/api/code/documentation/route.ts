import { NextRequest, NextResponse } from 'next/server';
import { codeStore } from '@/lib/code-store';

export async function POST(request: NextRequest) {
  try {
    const { code, language, projectName, framework } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    const documentationAnalysis = codeStore.generateDocumentation(code, language, projectName);

    return NextResponse.json(documentationAnalysis);

  } catch (error) {
    console.error('Documentation generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate documentation' },
      { status: 500 }
    );
  }
}
