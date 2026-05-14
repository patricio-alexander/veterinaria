export const initialName = (name: string) => {
  return name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("");
};
