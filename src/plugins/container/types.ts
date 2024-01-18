export const TYPES = {
  DB: Symbol.for("db"),
};

export const classToSymbol = (targetClass: { name: string }) =>
  Symbol.for(targetClass.name);
