export type SubjectCategory = {
  id: string;
  name: string;
  colorHex: string;
  textColorHex: string;
};

export const UNKNOWN_SUBJECT_CATEGORY: SubjectCategory = {
  id: "unknown",
  name: "미분류",
  colorHex: "#F3F4F6",
  textColorHex: "#4B5563",
};

export const toSubjectCategory = (input: {
  id?: string | null;
  slug?: string | null;
  name?: string | null;
  colorHex?: string | null;
  textColorHex?: string | null;
} | null): SubjectCategory => {
  const id = input?.slug ?? input?.id ?? UNKNOWN_SUBJECT_CATEGORY.id;
  const name = input?.name ?? UNKNOWN_SUBJECT_CATEGORY.name;
  const colorHex = input?.colorHex ?? UNKNOWN_SUBJECT_CATEGORY.colorHex;
  const textColorHex =
    input?.textColorHex ?? UNKNOWN_SUBJECT_CATEGORY.textColorHex;

  return {
    id,
    name,
    colorHex,
    textColorHex,
  };
};

export const mergeSubjectCategories = (
  base: SubjectCategory[],
  items: Array<Partial<SubjectCategory> | null | undefined>,
): SubjectCategory[] => {
  const map = new Map<string, SubjectCategory>();

  base.forEach((category) => {
    map.set(category.id, category);
  });

  items.forEach((item) => {
    const id = String(item?.id ?? "").trim();
    if (!id) return;
    if (map.has(id)) return;

    map.set(id, {
      id,
      name: String(item?.name ?? id),
      colorHex: item?.colorHex ?? UNKNOWN_SUBJECT_CATEGORY.colorHex,
      textColorHex: item?.textColorHex ?? UNKNOWN_SUBJECT_CATEGORY.textColorHex,
    });
  });

  return Array.from(map.values());
};
