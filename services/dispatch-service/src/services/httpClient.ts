export class ServiceClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly serviceName: string,
  ) {
    super(message);
    this.name = "ServiceClientError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  token?: string;
  body?: unknown;
}

export async function requestJson<T>(
  baseUrl: string,
  path: string,
  serviceName: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers({
    Accept: "application/json",
  });

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  let response: Response;

  try {
    response = await fetch(
      `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`,
      {
        method: options.method ?? "GET",
        headers,
        body:
          options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: AbortSignal.timeout(10_000),
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown network error";

    throw new ServiceClientError(
      `${serviceName} request failed: ${message}`,
      503,
      serviceName,
    );
  }

  const responseText = await response.text();

  let data: unknown = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }
  }

  if (!response.ok) {
    const errorMessage =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : `${serviceName} returned HTTP ${response.status}`;

    throw new ServiceClientError(errorMessage, response.status, serviceName);
  }

  return data as T;
}
