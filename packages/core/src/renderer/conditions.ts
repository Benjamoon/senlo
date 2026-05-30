import { ContentCondition } from "../emailDesign";
import { RenderContext } from "./types";

export function evaluateCondition(
  condition: ContentCondition | undefined,
  context: RenderContext,
): boolean {
  if (!condition) return true;

  const { variable, operator, value } = condition;
  const data = context.options?.data || {};

  const actualValue = getVariableValue(variable, data);

  switch (operator) {
    case "equals":
      return String(actualValue) === String(value);
    case "not_equals":
      return String(actualValue) !== String(value);
    case "gt":
      return Number(actualValue) > Number(value);
    case "lt":
      return Number(actualValue) < Number(value);
    case "is_set":
      return (
        actualValue !== undefined && actualValue !== null && actualValue !== ""
      );
    case "is_not_set":
      return (
        actualValue === undefined || actualValue === null || actualValue === ""
      );
    default:
      return true;
  }
}

function getVariableValue(variable: string, data: any): any {
  if (!variable) return undefined;

  // Check custom tags first (flat structure)
  if (data.custom && variable in data.custom) {
    return data.custom[variable];
  }

  const parts = variable.split(".");
  const context = parts[0];
  const key = parts.slice(1).join(".");

  if (context === "contact" && data.contact) {
    if (data.contact[key] !== undefined && data.contact[key] !== null) {
      return data.contact[key];
    }

    if (
      data.contact.meta &&
      data.contact.meta[key] !== undefined &&
      data.contact.meta[key] !== null
    ) {
      return data.contact.meta[key];
    }

    if (key === "first_name" && data.contact.name) {
      return data.contact.name.split(" ")[0];
    }
    if (key === "last_name" && data.contact.name) {
      const nameParts = data.contact.name.split(" ");
      return nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    }

    return undefined;
  }

  if (context === "project" && data.project) {
    return (data.project as any)[key];
  }

  if (context === "campaign" && data.campaign) {
    return (data.campaign as any)[key];
  }

  return undefined;
}
