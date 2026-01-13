const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface ApiError {
  message: string;
  statusCode: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: response.statusText,
        statusCode: response.status,
      }));
      throw new Error(error.message || `HTTP Error: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const api = new ApiClient(API_URL);

// Auth API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>("/auth/login", data),
  logout: () => api.post<void>("/auth/logout"),
};

// Users/Customers API
export interface Customer {
  id: string;
  email: string;
  name: string;
  email_verified: boolean;
  loginWith: "Google" | "Facebook" | "Apple" | "Email";
  company_name?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string | null;
  subscription_id?: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CustomersListParams {
  page?: number;
  limit?: number;
  search?: string;
  email?: string;
  email_verified?: boolean;
  loginWith?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const customersApi = {
  getList: (params: CustomersListParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.search) searchParams.append("search", params.search);
    if (params.email) searchParams.append("email", params.email);
    if (params.email_verified !== undefined)
      searchParams.append("email_verified", params.email_verified.toString());
    if (params.loginWith) searchParams.append("loginWith", params.loginWith);
    if (params.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const query = searchParams.toString();
    return api.get<PaginatedResponse<Customer>>(
      `/users${query ? `?${query}` : ""}`
    );
  },
  getById: (id: string) => api.get<Customer>(`/users/${id}`),
};

// Transactions API
export interface Transaction {
  id: string;
  id_transaction: string;
  customer_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  payment_type: "initial" | "recurring" | "upgrade";
  transaction_type: "payment" | "refund" | "chargeback" | "rdr";
  transaction_status: "success" | "failed" | "in_process" | "waiting_user_interaction";
  payment_date: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TransactionsListParams {
  page?: number;
  limit?: number;
  customer_id?: string;
  subscription_id?: string;
  transaction_type?: string;
  transaction_status?: string;
  currency?: string;
  date_from?: string;
  date_to?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const transactionsApi = {
  getList: (params: TransactionsListParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.customer_id) searchParams.append("customer_id", params.customer_id);
    if (params.subscription_id) searchParams.append("subscription_id", params.subscription_id);
    if (params.transaction_type) searchParams.append("transaction_type", params.transaction_type);
    if (params.transaction_status) searchParams.append("transaction_status", params.transaction_status);
    if (params.currency) searchParams.append("currency", params.currency);
    if (params.date_from) searchParams.append("date_from", params.date_from);
    if (params.date_to) searchParams.append("date_to", params.date_to);
    if (params.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const query = searchParams.toString();
    return api.get<PaginatedResponse<Transaction>>(
      `/transactions${query ? `?${query}` : ""}`
    );
  },
  getById: (id: string) => api.get<Transaction>(`/transactions/${id}`),
};
