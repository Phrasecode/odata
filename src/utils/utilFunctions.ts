export const convertStringToSnakeCase = (input: string): string => {
  if (!input) {
    return input;
  }
  return (
    input
      // Convert camelCase or PascalCase to snake_case
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      // Replace spaces, hyphens, and multiple underscores with a single underscore
      .replace(/[\s-]+/g, '_')
      // Convert everything to lowercase
      .toLowerCase()
  );
};
