export function generatePlaceShareText(place, destination) {
  const dest = destination?.name || 'Oman';
  return `🌍 ${place.title} – ${place.location}, ${dest}\n\n${place.shortDescription}\n\nEntdeckt mit Travel Guide App`;
}

export function generateItineraryShareText(places, destination) {
  const dest = destination?.name || 'Oman';
  const list = places.map((p, i) => `${i + 1}. ${p.title} (${p.location})`).join('\n');
  return `✈️ Meine ${dest} Reise\n\n${list}\n\nGeplant mit Travel Guide App`;
}

export async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  return Promise.resolve();
}

export function shareViaWhatsApp(text) {
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}

export function shareViaEmail(subject, body) {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  window.open(`mailto:?subject=${encodedSubject}&body=${encodedBody}`, '_blank');
}

export async function sharePlace(place, destination) {
  const text = generatePlaceShareText(place, destination);
  const title = place.title;
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.title + ' ' + place.location)}`;

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return { success: true, method: 'native' };
    } catch {
      // Fall through to clipboard
    }
  }
  await copyToClipboard(`${text}\n${url}`);
  return { success: true, method: 'clipboard' };
}
