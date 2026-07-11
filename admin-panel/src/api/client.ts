export type Role = 'poster' | 'admin';
export type TripStatus = 'live' | 'paused' | 'deleted' | 'past';

export type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type User = {
  _id: string;
  name: string;
  mobile: string;
  organizationName?: string;
  role: Role;
  isVerified?: boolean;
  createdAt?: string;
};

export type Category = {
  _id: string;
  slug: string;
  label: string;
  imageUrl?: string;
  sortOrder?: number;
  active?: boolean;
};

export type Destination = {
  name: string;
  geo?: {
    type: 'Point';
    coordinates: [number, number];
  };
};

export type Trip = {
  _id: string;
  posterId?: User | string;
  title: string;
  category: string;
  destination: Destination;
  startDate: string;
  endDate: string;
  durationDays?: number;
  pricePerPerson: number;
  totalSeats: number;
  seatsRemaining?: number;
  description?: string;
  coverPhotoUrl: string;
  galleryUrls?: string[];
  status: TripStatus;
  createdAt?: string;
};

export type Lead = {
  _id: string;
  tripId?: Trip | string;
  posterId?: User | string;
  tripTitle?: string;
  travelerName: string;
  travelerMobile: string;
  destinationInterest?: string;
  requirements?: string;
  createdAt: string;
};

export type LeadFilters = {
  from?: string;
  to?: string;
  destination?: string;
  category?: string;
  tripId?: string;
  posterId?: string;
  page?: number;
  limit?: number;
};

export type ListingFilters = {
  q?: string;
  category?: string;
  status?: TripStatus;
  page?: number;
  limit?: number;
  sort?: 'recent' | 'departing' | 'priceAsc' | 'priceDesc';
};

type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Meta;
};

type ApiErrorResponse = {
  success: false;
  error?: {
    message?: string;
    details?: unknown[];
  };
};

type RequestOptions = RequestInit & {
  token?: string | null;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(
  /\/$/,
  ''
);

function queryString(params: Record<string, unknown>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  const value = search.toString();
  return value ? `?${value}` : '';
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const { token, headers, body, ...init } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? ((await response.json()) as ApiSuccess<T> | ApiErrorResponse)
    : null;

  if (!response.ok || payload?.success === false) {
    const message =
      payload?.success === false
        ? payload.error?.message || 'Request failed'
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (!payload || payload.success !== true) {
    throw new Error('Unexpected API response');
  }

  return { data: payload.data, meta: payload.meta };
}

export const api = {
  requestOtp(mobile: string) {
    return request<{ mobile: string; expiresInSeconds: number; devCode?: string; message: string }>(
      '/auth/request-otp',
      {
        method: 'POST',
        body: JSON.stringify({ mobile }),
      }
    );
  },

  verifyOtp(mobile: string, code: string) {
    return request<{ token: string; user: User; isNewUser: boolean }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, code }),
    });
  },

  me(token: string) {
    return request<{ user: User }>('/auth/me', { token });
  },

  listCategories(token?: string | null) {
    return request<{ categories: Category[] }>(`/categories${token ? '?all=true' : ''}`, {
      token,
    });
  },

  listLeads(token: string, filters: LeadFilters) {
    return request<Lead[]>(`/leads${queryString(filters)}`, { token });
  },

  async exportLeadsCsv(token: string, filters: LeadFilters) {
    const response = await fetch(`${API_BASE_URL}/leads/export${queryString(filters)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed with status ${response.status}`);
    }

    return response.blob();
  },

  listTrips(filters: ListingFilters) {
    return request<Trip[]>(`/trips${queryString(filters)}`);
  },

  pauseTrip(token: string, id: string) {
    return request<{ trip: Trip }>(`/trips/${id}/pause`, { method: 'POST', token });
  },

  resumeTrip(token: string, id: string) {
    return request<{ trip: Trip }>(`/trips/${id}/resume`, { method: 'POST', token });
  },

  deleteTrip(token: string, id: string) {
    return request<{ id: string; status: TripStatus }>(`/trips/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};
