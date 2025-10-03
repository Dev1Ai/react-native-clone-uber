import { fetchAPI } from "./fetch";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

/**
 * API client for ServiceLink backend
 */
export class ApiClient {
  private static token: string | null = null;

  /**
   * Store authentication token
   */
  static async setToken(token: string) {
    this.token = token;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  /**
   * Get stored authentication token
   */
  static async getToken(): Promise<string | null> {
    if (this.token) return this.token;

    try {
      this.token = await SecureStore.getItemAsync(TOKEN_KEY);
      return this.token;
    } catch {
      return null;
    }
  }

  /**
   * Remove authentication token
   */
  static async clearToken() {
    this.token = null;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }

  /**
   * Make authenticated API request
   */
  static async request<T = any>(
    url: string,
    options?: RequestInit,
  ): Promise<T> {
    const token = await this.getToken();

    return fetchAPI(url, {
      ...options,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });
  }

  /**
   * Sign up a new user
   */
  static async signUp(data: {
    email: string;
    password: string;
    name: string;
    role?: "CUSTOMER" | "PROVIDER";
  }) {
    const response = await fetchAPI("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.access_token) {
      await this.setToken(response.access_token);
    }

    return response;
  }

  /**
   * Sign in existing user
   */
  static async signIn(data: { email: string; password: string }) {
    const response = await fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.access_token) {
      await this.setToken(response.access_token);
    }

    return response;
  }

  /**
   * Get current user profile
   */
  static async getProfile() {
    return this.request("/auth/profile");
  }

  /**
   * Sign out user
   */
  static async signOut() {
    await this.clearToken();
  }

  // ========== Jobs API ==========

  /**
   * Create a new job
   */
  static async createJob(data: {
    title: string;
    description: string;
    categoryId?: string;
  }) {
    return this.request("/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Get all jobs for current user
   */
  static async getJobs() {
    return this.request("/jobs/mine");
  }

  /**
   * Get single job by ID
   */
  static async getJob(id: string) {
    return this.request(`/jobs/${id}`);
  }

  // ========== Providers API ==========

  /**
   * Search for providers near a location
   */
  static async searchProviders(params: {
    lat: number;
    lng: number;
    radiusKm?: number;
    categorySlug?: string;
  }) {
    const query = new URLSearchParams({
      lat: params.lat.toString(),
      lng: params.lng.toString(),
      ...(params.radiusKm && { radiusKm: params.radiusKm.toString() }),
      ...(params.categorySlug && { categorySlug: params.categorySlug }),
    });

    return this.request(`/providers/near?${query}`);
  }

  /**
   * Get online providers (real-time availability)
   */
  static async getOnlineProviders(params: {
    lat: number;
    lng: number;
    radiusKm?: number;
  }) {
    const query = new URLSearchParams({
      lat: params.lat.toString(),
      lng: params.lng.toString(),
      ...(params.radiusKm && { radiusKm: params.radiusKm.toString() }),
    });

    return this.request(`/providers/online?${query}`);
  }

  // ========== Quotes API ==========

  /**
   * Get quotes for a job
   */
  static async getQuotes(jobId: string) {
    return this.request(`/jobs/${jobId}/quotes`);
  }

  /**
   * Accept a quote
   */
  static async acceptQuote(jobId: string, quoteId: string) {
    return this.request(`/jobs/${jobId}/quotes/${quoteId}/accept`, {
      method: "POST",
    });
  }

  // ========== Payments API ==========

  /**
   * Create payment intent
   */
  static async createPaymentIntent(data: { jobId: string; amount: number }) {
    return this.request("/payments/create-intent", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ========== Categories API ==========

  /**
   * Get all categories
   */
  static async getCategories() {
    return this.request("/categories");
  }
}
