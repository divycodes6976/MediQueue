export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "Set-Cookie": "token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
    },
  });
}
