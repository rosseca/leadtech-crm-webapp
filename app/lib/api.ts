// Get API URL from runtime env (set by server via window.ENV) or fallback to build-time/default
function getApiUrl(): string {
  // Server-side: use process.env directly
  if (typeof window === "undefined") {
    return process.env.API_URL || process.env.VITE_API_URL || "http://localhost:3000";
  }
  // Client-side: use window.ENV injected by root loader
  return window.ENV?.API_URL || "http://localhost:3000";
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public isAuthError: boolean = false
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiErrorResponse {
  message: string;
  statusCode: number;
}

class ApiClient {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;
  private onTokenRefreshed: ((token: string, refreshToken: string) => void) | null = null;

  // Resolve baseUrl lazily to ensure window.ENV is available on client
  private get baseUrl(): string {
    return getApiUrl();
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  setRefreshToken(refreshToken: string | null) {
    this.refreshToken = refreshToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  setOnTokenRefreshed(callback: ((token: string, refreshToken: string) => void) | null) {
    this.onTokenRefreshed = callback;
  }

  private async attemptRefresh(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    // If already refreshing, wait for that promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async doRefresh(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/auth/refresh`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.token = data.accessToken;
      if (data.refreshToken) {
        this.refreshToken = data.refreshToken;
      }

      // Notify the auth store about the new tokens
      if (this.onTokenRefreshed && this.token) {
        this.onTokenRefreshed(this.token, this.refreshToken || "");
      }

      return true;
    } catch {
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
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
      // Handle 401 Unauthorized
      if (response.status === 401 && !isRetry && !endpoint.includes("/auth/")) {
        const refreshed = await this.attemptRefresh();
        if (refreshed) {
          // Retry the original request with new token
          return this.request<T>(endpoint, options, true);
        }
        // Refresh failed - throw auth error
        throw new ApiError(
          "Your session has expired. Please try again or re-login.",
          401,
          true
        );
      }

      const error: ApiErrorResponse = await response.json().catch(() => ({
        message: response.statusText,
        statusCode: response.status,
      }));

      throw new ApiError(
        error.message || `HTTP Error: ${response.status}`,
        response.status,
        response.status === 401
      );
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

export const api = new ApiClient();

// Auth API
export type UserRole = 'admin' | 'customer_service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}

// Alias for backwards compatibility
export type LoginResponse = AuthResponse;

export interface InviteUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  role: UserRole;
}

export interface InviteUserResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>("/auth/login", data),
  register: (data: RegisterRequest) => api.post<AuthResponse>("/auth/register", data),
  logout: () => api.post<void>("/auth/logout"),
  refreshToken: (refreshToken: string) =>
    api.post<{ accessToken: string; refreshToken?: string; expiresIn: number }>(
      "/auth/refresh",
      { refreshToken }
    ),
  inviteUser: (data: InviteUserRequest) =>
    api.post<InviteUserResponse>("/auth/invite", data),
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
  limit: number;
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

// User with transactions response
export interface UserTransaction {
  id: string;
  id_transaction: string;
  transaction_type: string;
  transaction_status: string;
  amount: number;
  currency: string;
  payment_type: string;
  payment_date: string | null;
  created_at: string | null;
  subscription_id: string;
  can_refund: boolean;
  refund_status: string;
}

export interface UserTransactionsSummary {
  total_transactions: number;
  successful_payments: number;
  failed_payments: number;
  refunds: number;
  total_amount_paid: number;
  total_refunded: number;
}

export interface UserWithTransactions {
  user: {
    id: string;
    email: string;
    name?: string;
    company_name?: string;
    language?: string;
    created_at: string | null;
    subscription_status?: string;
  };
  transactions: UserTransaction[];
  summary: UserTransactionsSummary;
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
  getWithTransactions: (id: string) =>
    api.get<UserWithTransactions>(`/users/${id}/transactions`),
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
  search?: string;
  customer_id?: string;
  subscription_id?: string;
  transaction_type?: string;
  transaction_status?: string;
  payment_type?: string;
  currency?: string;
  is_test?: string;
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
    if (params.search) searchParams.append("search", params.search);
    if (params.customer_id) searchParams.append("customer_id", params.customer_id);
    if (params.subscription_id) searchParams.append("subscription_id", params.subscription_id);
    if (params.transaction_type) searchParams.append("transaction_type", params.transaction_type);
    if (params.transaction_status) searchParams.append("transaction_status", params.transaction_status);
    if (params.payment_type) searchParams.append("payment_type", params.payment_type);
    if (params.currency) searchParams.append("currency", params.currency);
    if (params.is_test) searchParams.append("is_test", params.is_test);
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

// Refunds API
export interface RefundRequest {
  chargeId: string;
  amount?: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}

export interface RefundResult {
  id: string;
  status: string;
  amount: number;
  currency: string;
  created: number;
  reason: string | null;
}

export interface RefundResponse {
  success: boolean;
  message: string;
  data: {
    refund: RefundResult;
    original_transaction: {
      id: string;
      id_transaction: string;
      amount: number;
      currency: string;
    };
  };
}

export const refundsApi = {
  create: (data: RefundRequest) => api.post<RefundResponse>("/refunds", data),
};

// Notes API
export interface CustomerNote {
  id: string;
  customer_id: string;
  content: string;
  author?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteRequest {
  content: string;
  author?: string;
}

export const notesApi = {
  getByCustomerId: (customerId: string) =>
    api.get<CustomerNote[]>(`/notes/${customerId}`),
  create: (customerId: string, data: CreateNoteRequest) =>
    api.post<CustomerNote>(`/notes/${customerId}`, data),
};
