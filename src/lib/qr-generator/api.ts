/**
 * API Client — الاتصال بـ Cloudflare Worker
 */

import { API_CONFIG, QR_MESSAGES } from './constants';
import type {
  QRData,
  QRType,
  CreateResponse,
  GetResponse,
  UpdateResponse,
  DeleteResponse,
  ListResponse,
  APIError,
} from './types';

// ============================================
// Helper: Fetch with Timeout
// ============================================

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_CONFIG.TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(QR_MESSAGES.ERROR_TIMEOUT);
    }
    throw error;
  }
}

// ============================================
// Helper: Handle Response
// ============================================

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const error = data as APIError;
    throw new Error(error.error || QR_MESSAGES.ERROR_API);
  }

  return data as T;
}

// ============================================
// API: Create QR
// ============================================

export async function createQr(
  type: QRType,
  data: QRData
): Promise<CreateResponse> {
  const response = await fetchWithTimeout(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, data }),
    }
  );

  return handleResponse<CreateResponse>(response);
}

// ============================================
// API: Get QR by ID
// ============================================

export async function getQr(id: string): Promise<GetResponse> {
  const response = await fetchWithTimeout(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET}/${id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return handleResponse<GetResponse>(response);
}

// ============================================
// API: Update QR
// ============================================

export async function updateQr(
  id: string,
  apiKey: string,
  data: QRData
): Promise<UpdateResponse> {
  const response = await fetchWithTimeout(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE}/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ data }),
    }
  );

  return handleResponse<UpdateResponse>(response);
}

// ============================================
// API: Delete QR
// ============================================

export async function deleteQr(
  id: string,
  apiKey: string
): Promise<DeleteResponse> {
  const response = await fetchWithTimeout(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE}/${id}`,
    {
      method: 'DELETE',
      headers: {
        'X-API-Key': apiKey,
      },
    }
  );

  return handleResponse<DeleteResponse>(response);
}

// ============================================
// API: List QRs
// ============================================

export async function listQrs(apiKey: string): Promise<ListResponse> {
  const response = await fetchWithTimeout(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIST}`,
    {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
      },
    }
  );

  return handleResponse<ListResponse>(response);
}

// ============================================
// Helper: Get Public URL
// ============================================

export function getPublicUrl(id: string): string {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PUBLIC}/${id}`;
}

// ============================================
// Helper: Health Check
// ============================================

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(
      `${API_CONFIG.BASE_URL}/health`,
      {},
      5000 as number
    );
    return response.ok;
  } catch (error) {
    return false;
  }
}
