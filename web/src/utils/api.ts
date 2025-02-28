import {FormState} from "./types";

export async function fetchData(path: string): Promise<FormState> {
  const req = await fetch(`http://localhost:3000/pf/${path}`, { mode: "cors" })
  const json = await req.json();
  const data = JSON.parse(json["data"] || "{}")
  return Promise.resolve(data);
}

export function getValue(state: FormState | undefined, section: string, id: string) {
  if (!state) return;
  const data = state.form[section]?.data;
  if (!data || data.type === "list") {
    return;
  }
  const value = data.fieldsets?.[id].value || "";
  if (!value) {
    console.log("getValue", section, id, "not found");
    return;
  }
  return value;
}

export type Status = "Not started" | "In progress" | "Submitted" | "Changes requested" | "Completed";

export function getStatus(data: Record<string, unknown> | undefined): Status {
  const status = data?.["status"];
  switch (status) {
    case "not-started":
      return "Not started";
    case "in-progress":
      return "In progress";
    case "submitted":
      return "Submitted";
    case "changes-requested":
      return "Changes requested";
    case "complete":
      return "Completed";
    default:
      return "Not started";
  }
}

export function getBadgeType(data: Record<string, unknown> | undefined) {
  const status = data?.["status"];
  switch (status) {
    case "not-started":
      return "light";
    case "in-progress":
      return "success";
    case "submitted":
      return "important";
    case "changes-requested":
      return "emergency";
    case "complete":
      return "success";
    default:
      return "information";
  }
}
