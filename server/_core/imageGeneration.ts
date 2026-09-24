/**
 * Geração de imagem grátis via Pollinations.ai (sem conta, sem chave).
 * O Gemini não gera imagem no plano gratuito (quota 0), por isso este serviço.
 */
export type GenerateImageOptions = {
  prompt: string;
  width?: number;
  height?: number;
};

export type GenerateImageResponse = {
  url?: string;
};

const MAX_PROMPT_LENGTH = 1500;
const REQUEST_TIMEOUT_MS = 120_000;

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResponse> {
  const width = options.width ?? 1024;
  const height = options.height ?? 1024;
  const prompt = options.prompt.slice(0, MAX_PROMPT_LENGTH);

  const requestUrl =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=${width}&height=${height}&nologo=true`;

  const response = await fetch(requestUrl, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(
      `Image generation request failed (${response.status} ${response.statusText})`
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    throw new Error(`Image generation returned unexpected content type: ${contentType}`);
  }

  // Devolve a imagem embutida (data URL): sem arquivo em disco, funciona em
  // hospedagem com disco temporário e não acumula lixo.
  const buffer = Buffer.from(await response.arrayBuffer());
  const mimeType = contentType.split(";")[0].trim();

  return { url: `data:${mimeType};base64,${buffer.toString("base64")}` };
}
