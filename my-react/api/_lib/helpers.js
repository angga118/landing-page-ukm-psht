import Busboy from 'busboy';
import { sniffMime } from './mime.js';

function setJsonHeaders(res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

export function jsonSuccess(res, data, status = 200) {
  const payload = { success: true, data };
  const body = JSON.stringify(payload);
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(payload);
  }
  res.statusCode = status;
  setJsonHeaders(res);
  res.end(body);
}

export function jsonError(res, message, status = 400, errors = null) {
  const payload = { success: false, message };
  if (errors !== null) payload.errors = errors;
  const body = JSON.stringify(payload);
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(payload);
  }
  res.statusCode = status;
  setJsonHeaders(res);
  res.end(body);
}

// Safely read req.body. On Vercel's Node runtime, `req.body` is a getter that
// can THROW "Invalid JSON" when the request body isn't valid JSON. Always guard
// access so a malformed body never crashes the handler.
function getBody(req) {
  try {
    return req.body;
  } catch {
    return undefined;
  }
}

async function readBodyAsString(req) {
  const body = getBody(req);
  if (body !== undefined && body !== null) {
    if (typeof body === 'string') return body;
    if (Buffer.isBuffer(body)) return body.toString('utf8');
    if (typeof body === 'object' && !Array.isArray(body)) {
      try { return JSON.stringify(body); } catch { return ''; }
    }
  }
  return '';
}

export async function getJsonInput(req) {
  const body = getBody(req);
  if (body !== undefined && body !== null && typeof body === 'object' && !Buffer.isBuffer(body) && !Array.isArray(body)) {
    return body;
  }
  let raw;
  if (typeof body === 'string') raw = body;
  else if (Buffer.isBuffer(body)) raw = body.toString('utf8');
  else return {};
  try {
    const data = JSON.parse(raw);
    return typeof data === 'object' && data !== null ? data : {};
  } catch {
    throw new Error('Invalid JSON body');
  }
}

function parseUrlencodedBody(req) {
  const body = getBody(req);
  let raw;
  if (Buffer.isBuffer(body)) raw = body.toString('utf8');
  else if (typeof body === 'string') raw = body;
  else return {};
  return Object.fromEntries(new URLSearchParams(raw).entries());
}

export function parseMultipart(req) {
  // Vercel's restoreBody() patches req.on('data'|'end') and req.read, but NOT
  // Symbol.asyncIterator. So `for await (const chunk of req)` is dead code after
  // Vercel consumes the stream — however `req.pipe(busboy)` still works because
  // it relies on the patched `req.on`/`req.read`.
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: req.headers,
      limits: { fileSize: 2 * 1024 * 1024, files: 1 },
    });
    const fields = {};
    const files = {};

    busboy.on('field', (name, val) => {
      fields[name] = val;
    });

    busboy.on('file', (name, file, info) => {
      const { filename } = info;
      const chunks = [];
      let limitHit = false;
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('limit', () => {
        limitHit = true;
      });
      file.on('close', () => {
        const buffer = Buffer.concat(chunks);
        const truncated = file.truncated || limitHit;
        files[name] = {
          buffer,
          filename,
          size: buffer.length,
          truncated,
        };
      });
      file.on('end', () => {
        // fallback if close not fired
        if (!files[name]) {
          const buffer = Buffer.concat(chunks);
          const truncated = file.truncated || limitHit;
          files[name] = { buffer, filename, size: buffer.length, truncated };
        }
      });
    });

    busboy.on('finish', () => {
      resolve({ fields, files });
    });
    busboy.on('error', (err) => reject(err));
    req.pipe(busboy);
  });
}

export async function getRequestData(req) {
  const ct = (req.headers['content-type'] || req.headers['Content-Type'] || '').toLowerCase();
  if (ct.includes('application/json')) {
    return await getJsonInput(req);
  }
  if (ct.includes('multipart/form-data')) {
    const result = await parseMultipart(req);
    return result;
  }
  if (ct.includes('application/x-www-form-urlencoded')) {
    return parseUrlencodedBody(req);
  }
  // Fallback auto-detect: dispatch directly via req.body (no stream read).
  // Vercel already consumed the stream into req.body, so for-await is dead code.
  const body = getBody(req);
  if (body !== undefined && body !== null && typeof body === 'object' && !Buffer.isBuffer(body) && !Array.isArray(body)) {
    return body;
  }
  let raw;
  if (typeof body === 'string') raw = body;
  else if (Buffer.isBuffer(body)) raw = body.toString('utf8');
  else return {};
  if (raw) {
    try {
      const j = JSON.parse(raw);
      if (typeof j === 'object' && j !== null) return j;
    } catch {}
    if (raw.includes('=')) {
      return Object.fromEntries(new URLSearchParams(raw).entries());
    }
  }
  return {};
}
