const SERVICE_API_URL =
  process.env.NEXT_PUBLIC_SERVICE_API_URL || "http://localhost:4004";

interface ApiOptions extends RequestInit {
  token?: string;
}

async function serviceRequest<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const token =
    options.token ||
    (typeof window !== "undefined"
      ? localStorage.getItem("fleetflow_token")
      : null);

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${SERVICE_API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Service API request failed with status ${response.status}`,
    );
  }

  return data as T;
}

export const serviceApi = {
  get<T>(endpoint: string) {
    return serviceRequest<T>(endpoint, {
      method: "GET",
    });
  },

  post<T>(endpoint: string, body: unknown) {
    return serviceRequest<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  patch<T>(endpoint: string, body: unknown) {
    return serviceRequest<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string) {
    return serviceRequest<T>(endpoint, {
      method: "DELETE",
    });
  },
};
