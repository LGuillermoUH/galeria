import { useEffect, useState, type FormEvent } from 'react';

export default function Private() {
  const [secret, setSecret] = useState(() => new URLSearchParams(location.search).get('secret') ?? '');
  const [images, setImages] = useState<string[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState('');

  async function load(s: string) {
    const res = await fetch(`/api/private/images?secret=${encodeURIComponent(s)}`);
    setAuthorized(res.ok);
    setImages(res.ok ? await res.json() : []);
  }

  useEffect(() => { if (secret) load(secret); }, []);

  async function handleUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set('secret', secret);
    const res = await fetch('/api/private/upload', { method: 'POST', body: data });
    if (res.ok) { form.reset(); load(secret); }
    else setError(await res.text());
  }

  async function handleDelete(file: string) {
    const data = new FormData();
    data.set('secret', secret);
    data.set('file', file);
    await fetch('/api/private/delete', { method: 'POST', body: data });
    load(secret);
  }

  if (!authorized) {
    return (
      <div id="secret-modal" className="open">
        <div className="box">
          <h1>Acceso privado</h1>
          <input
            type="password"
            placeholder="Secret"
            autoFocus
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') load(secret); }}
          />
          <div className="actions">
            <button onClick={() => { location.href = '/'; }}>Cancelar</button>
            <button onClick={() => load(secret)}>Entrar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-center">
      <div className="wrap">
        <div className="box">
          <h1>Subir imagen a la galería</h1>
          <form onSubmit={handleUpload}>
            <input type="file" name="image" accept="image/*" multiple required />
            <br /><br />
            <button type="submit">Subir</button>
          </form>
          {error && <p className="err">{error}</p>}
        </div>

        <div className="grid">
          {images.map(f => (
            <div className="thumb" key={f}>
              <img src={`/images/${f}`} alt="" loading="lazy" />
              <button className="del" title="Borrar" onClick={() => handleDelete(f)}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
