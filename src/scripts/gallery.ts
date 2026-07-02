declare global { interface Window { __images: string[] } }

const images = window.__images ?? [];

const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const cell = e.target as HTMLElement;
    const img = document.createElement('img');
    img.src = cell.dataset.src!;
    img.alt = '';
    img.addEventListener('load', () => img.classList.add('loaded'));
    img.addEventListener('click', () => openModal(cell.dataset.src!));
    cell.appendChild(img);
    io.unobserve(cell);
  }
}, { rootMargin: '300px' });

const gallery = document.getElementById('gallery')!;
for (const src of images) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.dataset.src = src;
  gallery.appendChild(cell);
  io.observe(cell);
}

const modal    = document.getElementById('modal')!;
const modalImg = document.getElementById('modal-img') as HTMLImageElement;

function openModal(src: string) {
  modalImg.src = src;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  modalImg.src = '';
}

modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.getElementById('modal-close')!.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
