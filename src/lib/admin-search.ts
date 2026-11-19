export const ADMIN_PAGE_SIZE = 10;

export type AdminSearchParams = Record<
  string,
  string | string[] | undefined
>;

export function adminParam(params: AdminSearchParams, key: string) {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function adminPage(params: AdminSearchParams) {
  const page = Number.parseInt(adminParam(params, "page"), 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}
