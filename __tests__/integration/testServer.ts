import { createServer, IncomingMessage, ServerResponse } from 'http';

type Handler = (req: Request, ctx?: any) => Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
}

const routes: Route[] = [];

function addRoute(method: string, path: string, handler: Handler) {
  const paramNames: string[] = [];
  const pattern = new RegExp(
    '^' +
      path.replace(/\[(\w+)\]/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
      }) +
      '$'
  );
  routes.push({ method, pattern, paramNames, handler });
}

async function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export function createTestApp() {
  return createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url!, 'http://localhost');
    const pathname = url.pathname;
    const method = req.method!.toUpperCase();
    const body = await readBody(req);
    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (val) headers.set(key, Array.isArray(val) ? val.join(', ') : val);
    }
    const nextRequest = new Request(`http://localhost${req.url}`, {
      method,
      headers,
      body: ['GET', 'HEAD'].includes(method) ? undefined : (body.length > 0 ? body : undefined),
    });
    let matched: { handler: Handler; params: Record<string, string> } | null = null;
    for (const route of routes) {
      if (route.method !== method) continue;
      const m = pathname.match(route.pattern);
      if (m) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, i) => { params[name] = m[i + 1]; });
        matched = { handler: route.handler, params };
        break;
      }
    }
    if (!matched) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
      return;
    }
    try {
      const response = await matched.handler(nextRequest, { params: matched.params });
      res.writeHead(response.status, { 'Content-Type': 'application/json' });
      const text = await response.text();
      res.end(text);
    } catch (err: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
}

export async function registerRoutes() {
  const { GET: getProducts, POST: createProduct } = await import('@/app/api/products/route');
  const { GET: getProduct, PATCH: updateProduct } = await import('@/app/api/products/[id]/route');
  const { GET: getOrders, POST: createOrder } = await import('@/app/api/orders/route');
  const { GET: getOrder } = await import('@/app/api/orders/[id]/route');
  const { POST: payOrder } = await import('@/app/api/orders/[id]/pay/route');
  const { POST: shipOrder } = await import('@/app/api/orders/[id]/ship/route');
  const { POST: deliverOrder } = await import('@/app/api/orders/[id]/deliver/route');
  const { POST: createDiscount } = await import('@/app/api/discounts/route');
  const { GET: getDiscount } = await import('@/app/api/discounts/[code]/route');

  addRoute('GET', '/api/products', getProducts);
  addRoute('POST', '/api/products', createProduct);
  addRoute('GET', '/api/products/[id]', getProduct);
  addRoute('PATCH', '/api/products/[id]', updateProduct);
  addRoute('GET', '/api/orders', getOrders);
  addRoute('POST', '/api/orders', createOrder);
  addRoute('GET', '/api/orders/[id]', getOrder);
  addRoute('POST', '/api/orders/[id]/pay', payOrder);
  addRoute('POST', '/api/orders/[id]/ship', shipOrder);
  addRoute('POST', '/api/orders/[id]/deliver', deliverOrder);
  addRoute('POST', '/api/discounts', createDiscount);
  addRoute('GET', '/api/discounts/[code]', getDiscount);
}
