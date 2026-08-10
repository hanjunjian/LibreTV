export async function onRequest(context) {
    const url = new URL(context.request.url);
    const path = url.pathname.replace('/proxy/', '');
    return new Response(JSON.stringify({ 
        status: "proxy_test",
        path: path,
        decoded: decodeURIComponent(path)
    }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
}
