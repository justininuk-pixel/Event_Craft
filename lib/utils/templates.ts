import { CardConfig } from "../themes/types";

export function fillTemplate(template: string, config: CardConfig): string {
  if (!template) return "";
  return template
    .replace(/{recipient}/g, config.recipient || "")
    .replace(/{sender}/g, config.sender || "")
    .replace(/{title}/g, config.title || "")
    .replace(
      /{date}/g,
      config.countdownTarget
        ? new Date(config.countdownTarget).toLocaleDateString()
        : new Date().toLocaleDateString()
    );
}
