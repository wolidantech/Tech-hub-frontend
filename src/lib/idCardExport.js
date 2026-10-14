/**
 * Student ID-card export: renders ONLY the issued card node (never the page)
 * to PNG, and wraps that PNG in a real, self-contained PDF. Downloading never
 * calls issue_student_id_card() — the existing card number is preserved.
 */
import { toPng } from 'html-to-image';
import { BRAND_TILE_DATA_URL, dataUrlToBlob, saveOrShareImage } from './certImage';

export const idCardFileBase = (card) =>
  `DANQEL-student-id-${String(card?.cardNumber || 'card').replace(/[^A-Za-z0-9-]+/g, '-')}`;

async function inlineCardImages(node) {
  const imgs = Array.from(node.querySelectorAll('img')).filter((i) => i.getAttribute('src') && !/^(data:|blob:)/i.test(i.getAttribute('src')));
  const prev = imgs.map((i) => i.getAttribute('src'));
  await Promise.all(imgs.map(async (img) => {
    try {
      const res = await fetch(img.getAttribute('src'), { mode: 'cors', credentials: 'omit', cache: 'no-store' });
      if (!res.ok) throw new Error(`Photo download failed (${res.status}). Check your connection and retry.`);
      const blob = await res.blob();
      img.setAttribute('src', await new Promise((resolve, reject) => {
        const r = new FileReader(); r.onloadend = () => resolve(String(r.result)); r.onerror = reject; r.readAsDataURL(blob);
      }));
    } catch (err) {
      // A missing/expired photo link must not produce a card with a blank face:
      // surface it unless it is just the decorative brand mark.
      if (img.dataset.cardPhoto === 'true') throw err;
      img.setAttribute('src', BRAND_TILE_DATA_URL);
    }
  }));
  return () => imgs.forEach((img, i) => img.setAttribute('src', prev[i]));
}

export async function captureIdCardPng(node) {
  if (!node) throw new Error('Your ID card is still loading. Wait a moment, then try again.');
  try { await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 2000))]); } catch { /* use fallback fonts */ }
  const restore = await inlineCardImages(node);
  try {
    let last;
    for (const pixelRatio of [3, 2, 1.5]) {
      try {
        const dataUrl = await toPng(node, {
          width: node.offsetWidth, height: node.offsetHeight, pixelRatio,
          cacheBust: true, backgroundColor: '#061236',
          fetchRequestInit: { mode: 'cors', credentials: 'omit' },
        });
        const blob = dataUrlToBlob(dataUrl);
        if (blob.size > 0) return { blob, dataUrl };
        throw new Error('The exported image was empty.');
      } catch (e) { last = e; }
    }
    throw last || new Error('Could not prepare the card image. Please retry.');
  } finally { restore(); }
}

/** Wrap a PNG blob in a one-page PDF (JPEG image XObject, CR80 landscape). */
export async function idCardPdfBlob(pngBlob) {
  const bitmap = await createImageBitmap(pngBlob).catch(() => null);
  if (!bitmap) throw new Error('Could not prepare the PDF image. Try Download Image instead.');
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width; canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#061236'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
  const jpegBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
  if (!jpegBlob) throw new Error('Could not prepare the PDF. Try Download Image instead.');
  const bytes = new Uint8Array(await jpegBlob.arrayBuffer());

  const pageW = 323; const pageH = Math.max(120, Math.round(pageW * canvas.height / canvas.width)); // points
  const enc = new TextEncoder();
  const parts = []; let length = 0;
  const push = (chunk) => { const b = typeof chunk === 'string' ? enc.encode(chunk) : chunk; parts.push(b); length += b.length; return length - b.length; };
  const offsets = [0];
  push('%PDF-1.4\n%âãÏÓ\n');
  offsets[1] = push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  offsets[2] = push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);
  offsets[3] = push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);
  offsets[4] = push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`);
  push(bytes); push('\nendstream\nendobj\n');
  const content = `q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im0 Do\nQ\n`;
  offsets[5] = push(`5 0 obj\n<< /Length ${enc.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`);
  const xref = length;
  let tail = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) tail += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  tail += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  push(tail);
  return new Blob(parts, { type: 'application/pdf' });
}

export async function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fileName; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 8000);
  return 'saved';
}

export async function shareOrDownload(blob, dataUrl, fileName, title) {
  if (fileName.endsWith('.png')) {
    return saveOrShareImage({ blob, dataUrl, fileName, title, text: title });
  }
  // PDFs: prefer the native share sheet (Save to Files / Drive) where offered.
  try {
    const file = new File([blob], fileName, { type: 'application/pdf' });
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title }); return 'shared'; }
  } catch (err) { if (err?.name === 'AbortError') return 'dismissed'; }
  return downloadBlob(blob, fileName);
}

export function openBlobInNewTab(blob) {
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return Boolean(win);
}
