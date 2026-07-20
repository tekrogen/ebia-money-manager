export type SearchResultKind = "card" | "statement" | "payment";

export type SearchResultItem = {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle: string;
  meta: string | null;
  href: string;
};

export type SearchGroupsDTO = {
  query: string;
  groups: {
    cards: SearchResultItem[];
    statements: SearchResultItem[];
    payments: SearchResultItem[];
  };
  totalCount: number;
};

export const emptySearchGroups = (query = ""): SearchGroupsDTO => ({
  query,
  groups: { cards: [], statements: [], payments: [] },
  totalCount: 0,
});
