import { readdir, writeFile, mkdir, unlink } from 'node:fs/promises';
import { resolve, basename, extname } from 'node:path';
import index from './src/index.html';
import privatePage from './src/private.html';

const IMAGES_DIR = resolve('./public/images');
const SECRET = process.env.UPLOAD_SECRET;
const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
};

const listImages = () => readdir(IMAGES_DIR).then(f => f.filter(n => IMG_RE.test(n))).catch(() => [] as string[]);
const authorized = (secret: string) => Boolean(SECRET) && secret === SECRET;

Bun.serve({
  routes: {
    '/': index,
    '/private': privatePage,

    '/api/images': async () => Response.json(await listImages()),

    '/api/private/images': async req => {
      const secret = new URL(req.url).searchParams.get('secret') ?? '';
      if (!authorized(secret)) return new Response('unauthorized', { status: 401 });
      return Response.json(await listImages());
    },

    '/api/private/upload': async req => {
      const data = await req.formData();
      if (!authorized(String(data.get('secret') ?? ''))) return new Response('unauthorized', { status: 401 });
      const files = data.getAll('image').filter((f): f is File => f instanceof File && f.size > 0);
      if (!files.length) return new Response('Selecciona una imagen.', { status: 400 });
      await mkdir(IMAGES_DIR, { recursive: true });
      for (const [i, file] of files.entries()) {
        const safe = file.name.replace(/[^a-z0-9._-]/gi, '_');
        await writeFile(resolve(IMAGES_DIR, `${Date.now()}-${i}-${safe}`), Buffer.from(await file.arrayBuffer()));
      }
      return new Response('ok');
    },

    '/api/private/delete': async req => {
      const data = await req.formData();
      if (!authorized(String(data.get('secret') ?? ''))) return new Response('unauthorized', { status: 401 });
      const name = basename(String(data.get('file') ?? ''));
      if (name) await unlink(resolve(IMAGES_DIR, name)).catch(() => {});
      return new Response('ok');
    },

    '/images/:file': async req => {
      const name = basename(req.params.file);
      const type = MIME[extname(name).toLowerCase()];
      const file = type && Bun.file(resolve(IMAGES_DIR, name));
      if (!file || !(await file.exists())) return new Response(null, { status: 404 });
      return new Response(file, {
        headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable' },
      });
    },
  },
  fetch: () => new Response('Not found', { status: 404 }),
});

console.log('Listening on http://localhost:3000');
