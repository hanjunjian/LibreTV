export async function onRequest(context) {
    return new Response(JSON.stringify({ status: "proxy_index", url: context.request.url }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
}
