import 'server-only'

export async function POST(request: Request) {
	let body: { password?: string } = {}
	try {
		body = await request.json()
	} catch {
		// ignore JSON parse errors and treat as empty body
		body = {}
	}

	const { password } = body

	const isMatch = typeof password === 'string' && password === process.env.MOCK_AUTH_PASSWORD

  if (isMatch) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } else {
    return new Response(JSON.stringify({ success: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
