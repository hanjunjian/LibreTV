export async function onRequest(context) {
    return new Response(JSON.stringify({ status: "ok", message: "LibreTV Functions are working!" }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
}
