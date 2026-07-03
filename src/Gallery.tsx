import { useEffect, useRef, useState } from 'react';

export default function Gallery() {
  const [images, setImages] = useState<string[]>([]);
  const [modalSrc, setModalSrc] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/images')
      .then(r => r.json())
      .then((files: string[]) => setImages(files.map(f => `/images/${f}`)));
  }, []);

  useEffect(() => {
    document.body.style.overflow = modalSrc ? 'hidden' : '';
  }, [modalSrc]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalSrc(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <div id="gallery">
        {images.map(src => <Cell key={src} src={src} onOpen={setModalSrc} />)}
      </div>
      <div id="modal" className={modalSrc ? 'open' : ''} onClick={e => { if (e.target === e.currentTarget) setModalSrc(null); }}>
        <button id="modal-close" onClick={() => setModalSrc(null)}>×</button>
        {modalSrc && <img id="modal-img" src={modalSrc} alt="" />}
      </div>
    </>
  );
}

function Cell({ src, onOpen }: { src: string; onOpen: (src: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="cell" ref={ref} onClick={() => visible && onOpen(src)}>
      {visible && <img src={src} alt="" className={loaded ? 'loaded' : ''} onLoad={() => setLoaded(true)} />}
    </div>
  );
}
