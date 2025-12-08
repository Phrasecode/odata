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

export function convertStringToKebabCase(input: string): string {
  return input
    .replace(/([a-z])([A-Z])/g, '$1-$2') // handle camelCase → camel-Case
    .replace(/[\s_]+/g, '-') // spaces & underscores → -
    .replace(/[^a-zA-Z0-9-]/g, '') // remove other special chars
    .toLowerCase(); // convert to lowercase
}

export function convertStringToLowerCase(input: string): string {
  return input.toLowerCase();
}
