export const prerender = false;
import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { resolve, basename, extname } from 'node:path';

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
};

export const GET: APIRoute = async ({ params }) => {
  const name = basename(params.file ?? '');
  const type = MIME[extname(name).toLowerCase()];
  if (!name || !type) return new Response(null, { status: 404 });

  try {
    const data = await readFile(resolve('./public/images', name));
    return new Response(data, {
      headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
};
