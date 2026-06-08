import { ApiService } from '../services/ApiService';

export function getAssetUrl(path?: string | null) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
  return ApiService.apiUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}
