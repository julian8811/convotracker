/**
 * Normaliza una URL para que sea absoluta y usable en href.
 * Siempre intenta devolver una URL válida cuando el valor parece una URL.
 * @param {string|null|undefined} url - URL tal como viene del backend
 * @returns {string|null} URL absoluta o null solo si está vacía o no es string
 */
export function ensureAbsoluteUrl(url) {
  if (url == null || typeof url !== 'string') return null;
  // Quitar espacios y quedarnos con el primer token (por si viene basura al final)
  const trimmed = url.trim().split(/\s+/)[0];
  if (!trimmed) return null;

  // Ya es http o https → usar tal cual (sin espacios)
  if (/^https?:\/\/.+/i.test(trimmed)) return trimmed;
  // Protocol-relative
  if (trimmed.startsWith('//')) return `https:${trimmed}`;

  // Sin protocolo: si tiene punto (host) o empieza por www, añadir https://
  const sinBarras = trimmed.replace(/^\/+/, '');
  if (!sinBarras) return null;
  if (sinBarras.includes('.') || /^www\./i.test(sinBarras)) {
    const withProtocol = `https://${sinBarras}`;
    try {
      new URL(withProtocol);
      return withProtocol;
    } catch {
      return withProtocol; // usar igual para que el enlace aparezca
    }
  }

  // Path solo (ej. /foo/bar): no podemos resolver dominio; devolver null
  return null;
}

/**
 * Devuelve una URL absoluta lista para href "Ver convocatoria original".
 * Acepta snake_case (url_fuente) o camelCase (urlFuente).
 * Si la URL no tiene protocolo, se añade https://.
 */
export function getConvocatoriaSourceUrl(conv) {
  if (!conv) return null;
  const raw = (conv.url_fuente ?? conv.urlFuente ?? '').trim().split(/\s+/)[0];
  if (!raw) return null;
  const normalized = ensureAbsoluteUrl(raw);
  if (normalized) return normalized;
  return raw.startsWith('http') ? raw : `https://${raw.replace(/^\/+/, '')}`;
}
