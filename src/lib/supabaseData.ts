import { requireSupabase } from './supabase';

type Json = null | boolean | number | string | Json[] | { [key: string]: Json | undefined };

export type DataTable =
  | 'vehicles'
  | 'bookings'
  | 'tours'
  | 'daily_finances'
  | 'business_profile';

interface StoredRecord {
  id: string;
  data: Json;
}

const MEDIA_PREFIX = 'supabase-media:';
const MEDIA_BUCKET = 'rental-media';

function throwIfError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

function pathFromSignedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const marker = `/storage/v1/object/sign/${MEDIA_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex < 0) return null;
    return url.pathname
      .slice(markerIndex + marker.length)
      .split('/')
      .map((part) => decodeURIComponent(part))
      .join('/');
  } catch {
    return null;
  }
}

async function uploadImage(dataUrl: string): Promise<string> {
  const client = requireSupabase();
  const response = await fetch(dataUrl);
  if (!response.ok) throw new Error('Unable to read the selected image.');
  const blob = await response.blob();
  const extension = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'bin';
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from(MEDIA_BUCKET).upload(path, blob, {
    contentType: blob.type || 'application/octet-stream',
    upsert: false,
  });
  throwIfError(error);
  return `${MEDIA_PREFIX}${path}`;
}

async function toStoredValue(value: unknown): Promise<unknown> {
  if (typeof value === 'string') {
    if (value.startsWith('data:image/')) return uploadImage(value);
    if (value.startsWith(MEDIA_PREFIX)) return value;
    const path = pathFromSignedUrl(value);
    return path ? `${MEDIA_PREFIX}${path}` : value;
  }
  if (Array.isArray(value)) return Promise.all(value.map(toStoredValue));
  if (value && typeof value === 'object') {
    const entries = await Promise.all(
      Object.entries(value).map(async ([key, item]) => [key, await toStoredValue(item)] as const)
    );
    return Object.fromEntries(entries);
  }
  return value;
}

function collectMediaPaths(value: unknown, paths: Set<string>): void {
  if (typeof value === 'string' && value.startsWith(MEDIA_PREFIX)) {
    paths.add(value.slice(MEDIA_PREFIX.length));
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectMediaPaths(item, paths));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectMediaPaths(item, paths));
  }
}

function restoreMediaLinks(value: unknown, signedUrls: Map<string, string>): unknown {
  if (typeof value === 'string' && value.startsWith(MEDIA_PREFIX)) {
    const path = value.slice(MEDIA_PREFIX.length);
    const signedUrl = signedUrls.get(path);
    if (!signedUrl) throw new Error(`Unable to create a download link for ${path}.`);
    return signedUrl;
  }
  if (Array.isArray(value)) return value.map((item) => restoreMediaLinks(item, signedUrls));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, restoreMediaLinks(item, signedUrls)])
    );
  }
  return value;
}

async function hydrateMedia(value: unknown): Promise<unknown> {
  const paths = new Set<string>();
  collectMediaPaths(value, paths);
  if (!paths.size) return value;
  const pathList = [...paths];
  const { data, error } = await requireSupabase()
    .storage.from(MEDIA_BUCKET)
    .createSignedUrls(pathList, 60 * 60 * 24 * 7);
  throwIfError(error);
  const signedUrls = new Map(
    (data ?? []).flatMap((entry) => (
      entry.path && entry.signedUrl ? [[entry.path, entry.signedUrl] as const] : []
    ))
  );
  return restoreMediaLinks(value, signedUrls);
}

export async function readRecords<T>(table: DataTable): Promise<T[]> {
  const { data, error } = await requireSupabase().from(table).select('id,data');
  throwIfError(error);
  return ((await hydrateMedia((data ?? []).map((record) => (record as StoredRecord).data))) as T[]);
}

export async function saveRecord<T>(table: DataTable, id: string, data: T): Promise<T> {
  const storedData = await toStoredValue(data);
  const { error } = await requireSupabase()
    .from(table)
    .upsert({ id, data: storedData as Json }, { onConflict: 'id' });
  throwIfError(error);
  return await hydrateMedia(storedData) as T;
}

export async function saveRecords<T>(
  table: DataTable,
  records: Array<{ id: string; data: T }>,
  ignoreDuplicates = false
): Promise<void> {
  if (!records.length) return;
  const storedRecords = await Promise.all(
    records.map(async ({ id, data }) => ({
      id,
      data: await toStoredValue(data) as Json,
    }))
  );
  const { error } = await requireSupabase()
    .from(table)
    .upsert(storedRecords, { onConflict: 'id', ignoreDuplicates });
  throwIfError(error);
}

export async function deleteRecord(table: DataTable, id: string): Promise<void> {
  const { error } = await requireSupabase().from(table).delete().eq('id', id);
  throwIfError(error);
}

export async function deleteAllRecords(table: DataTable): Promise<void> {
  const { error } = await requireSupabase().from(table).delete().neq('id', '');
  throwIfError(error);
}

export async function replaceRecords<T>(
  table: DataTable,
  records: Array<{ id: string; data: T }>
): Promise<void> {
  await deleteAllRecords(table);
  await saveRecords(table, records);
}
