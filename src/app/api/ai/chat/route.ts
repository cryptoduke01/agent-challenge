import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Try to connect to the real Mastra agent
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const MASRTA_BASE = process.env.NOS_AGENT_URL || 'http://localhost:4111';
      const response = await fetch(`${MASRTA_BASE}/api/agents/sentraAgent/generate/vnext`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }]
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          response: data.text || 'I received your message and I\'m processing it.',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.log('Mastra agent not available, using fallback response:', error);
    }

    // Fallback response
    return NextResponse.json({
      response: `🤖 **AI Code Analysis Assistant**

I'm here to help with your development needs! I can:

**Code Analysis:**
• Quality assessment and scoring
• Complexity analysis
• Best practices recommendations
• Code review and suggestions

**Security & Performance:**
• Vulnerability scanning
• Performance optimization
• Security best practices
• Compliance checking

**Project Management:**
• Roadmap generation
• Documentation creation
• Architecture analysis
• Deployment strategies

What specific aspect would you like me to help you with?`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
