export type WebPublicationScope = "local" | "network";

export type WebPublicationSettings = {
  enabled: boolean;
  scope: WebPublicationScope;
  port: number;
};

export type WebPublicationStatus = WebPublicationSettings & {
  running: boolean;
  address: string;
  message: string;
};

export const DEFAULT_WEB_PUBLICATION_PORT = 8765;

export function normalizeWebPublicationSettings(
  value: Partial<WebPublicationSettings> = {},
): WebPublicationSettings {
  const rawPort = Number(value.port ?? DEFAULT_WEB_PUBLICATION_PORT);
  const port = Number.isInteger(rawPort) && rawPort >= 1024 && rawPort <= 65535
    ? rawPort
    : DEFAULT_WEB_PUBLICATION_PORT;
  return {
    enabled: Boolean(value.enabled),
    scope: value.scope === "network" ? "network" : "local",
    port,
  };
}

export function webPublicationOrigin(settings: WebPublicationSettings, host = "127.0.0.1") {
  const normalized = normalizeWebPublicationSettings(settings);
  const local = normalized.scope === "local";
  return `${local ? "http" : "https"}://${local ? "127.0.0.1" : host}:${normalized.port}`;
}
