import mammoth from "mammoth";

export type ParsedWordDocument = {
  text: string;
  messages: unknown[];
};

export async function parseWordBuffer(buffer: Buffer): Promise<ParsedWordDocument> {
  const result = await mammoth.extractRawText({ buffer });

  return {
    text: result.value,
    messages: result.messages
  };
}
