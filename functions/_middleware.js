// Cloudflare Pages Middleware - 内联 SHA-256 实现，避免跨目录导入
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequest(context) {
  const { request, env, next } = context;
  
  try {
    const response = await next();
    const contentType = response.headers.get("content-type") || "";
    
    if (contentType.includes("text/html")) {
      let html = await response.text();
      const password = env.PASSWORD || "";
      let passwordHash = "";
      if (password) {
        passwordHash = await sha256(password);
      }
      html = html.replace('window.__ENV__.PASSWORD = "{{PASSWORD}}";', 
                          `window.__ENV__.PASSWORD = "${passwordHash}"; // SHA-256 hash`);
      return new Response(html, {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
      });
    }
    
    return response;
  } catch (e) {
    // 如果中间件失败，透传原始请求
    return next();
  }
}