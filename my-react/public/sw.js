// PSHT Offline Service Worker — vanilla, tanpa Workbox
// Cache versioning: ubah string ini saat offline.html atau aset inti berubah
const CACHE_NAME = "psht-offline-v2";
const OFFLINE_URL = "/offline.html";

// Aset inti yang wajib ada agar offline.html tetap cantik saat offline
const PRECACHE_URLS = [OFFLINE_URL, "/logopsht.png", "/favicon.svg"];

// Opsional: ikon PWA jika ada (gagal cache tidak menggagalkan install)
const OPTIONAL_URLS = ["/icons/icon-192.png", "/icons/icon-512.png", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Cache wajib — jika gagal, install tetap dianggap gagal agar tidak half-baked
      await cache.addAll(PRECACHE_URLS);
      // Cache opsional — jangan gagalkan install jika tidak ada
      await Promise.allSettled(
        OPTIONAL_URLS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: "no-cache" });
            if (res.ok) await cache.put(url, res);
          } catch (_) {
            // abaikan
          }
        }),
      );
      // Aktif segera tanpa menunggu tab lama ditutup
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Bersihkan cache lama dengan prefix yang sama
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key.startsWith("psht-offline-")) {
            return caches.delete(key);
          }
          return undefined;
        }),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Hanya tangani GET
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Abaikan scheme non-http(s) seperti chrome-extension://
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Jangan cache / jangan tangkap request API — biarkan network-only
  // Ini mencegah offline.html muncul sebagai respons JSON API saat offline
  if (url.pathname.startsWith("/api/")) return;

  // Navigasi (perubahan halaman / refresh / address bar)
  // Deteksi via mode navigate atau Accept header html
  const isNavigation =
    req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");

  if (isNavigation) {
    event.respondWith(networkFirstNavigation(req));
    return;
  }

  // Aset statis (gambar, css, js, font, dll) — cache-first dengan network fallback
  // Kita batasi ke same-origin agar tidak meng-cache CDN pihak ketiga secara agresif
  const isSameOrigin = url.origin === self.location.origin;
  const isStaticAsset =
    isSameOrigin &&
    (req.destination === "image" ||
      req.destination === "style" ||
      req.destination === "script" ||
      req.destination === "font" ||
      /\.(?:png|jpe?g|webp|avif|svg|ico|css|js|woff2?)$/i.test(url.pathname));

  if (isStaticAsset) {
    event.respondWith(cacheFirstAsset(req));
    return;
  }

  // Default: coba network, jatuh ke cache jika ada
  event.respondWith(
    (async () => {
      try {
        return await fetch(req);
      } catch (_) {
        const cached = await caches.match(req);
        if (cached) return cached;
        // Untuk request lain yang mengharapkan html, fallback ke offline
        if ((req.headers.get("accept") || "").includes("text/html")) {
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
        }
        throw _;
      }
    })(),
  );
});

/**
 * Navigasi: network-first → cache → offline.html
 */
async function networkFirstNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    // Cache salinan navigasi yang sukses (opsional, membantu back-forward saat offline)
    const cache = await caches.open(CACHE_NAME);
    // Clone sebelum dipakai, jangan cache respons error/opaque yang aneh
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone()).catch(() => {});
    }
    return networkResponse;
  } catch (_) {
    // Gagal network — coba cache dari request yang sama
    const cached = await caches.match(request);
    if (cached) return cached;
    // Fallback terakhir: offline page yang sudah di-precache
    const offline = await caches.match(OFFLINE_URL);
    if (offline) return offline;
    // Jika bahkan offline.html tidak ada di cache (kasus aneh), kembalikan 503 sintetis
    return new Response("Anda sedang offline.", {
      status: 503,
      statusText: "Offline",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

/**
 * Aset statis: cache-first → network → cache update
 */
async function cacheFirstAsset(request) {
  const cached = await caches.match(request);
  if (cached) {
    // Revalidate di background (stale-while-revalidate ringan tanpa menunggu)
    fetch(request)
      .then(async (res) => {
        if (res && res.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, res);
        }
      })
      .catch(() => {});
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      // Jangan tunggu cache.put menghalangi respons
      cache.put(request, networkResponse.clone()).catch(() => {});
    }
    return networkResponse;
  } catch (_) {
    // Tidak ada cache dan network gagal — untuk gambar, kembalikan placeholder transparan kecil
    // agar layout tidak rusak; untuk lainnya biarkan error jaringan
    if (request.destination === "image") {
      // 1x1 transparan PNG
      const transparent = Uint8Array.from(
        atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="),
        (c) => c.charCodeAt(0),
      );
      return new Response(transparent, {
        headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
      });
    }
    throw _;
  }
}
