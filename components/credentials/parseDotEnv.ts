export function parseDotEnv(text: string): Array<{ key: string; value: string }> {
  const lines = text.split(/\r?\n/);
  const pairs: Array<{ key: string; value: string }> = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const cleaned = line.replace(/^export\s+/, "");
    const idx = cleaned.indexOf("=");
    if (idx === -1) {
      pairs.push({ key: cleaned, value: "" });
      continue;
    }
    const key = cleaned.slice(0, idx).trim();
    let value = cleaned.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    pairs.push({ key, value });
  }
  return pairs;
}
