type ClassNameValue = string | false | null | undefined;

export const cn = (...classes: ClassNameValue[]) => {
  return classes.filter(Boolean).join(" ");
};
