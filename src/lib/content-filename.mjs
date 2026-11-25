export function isValidContentFilename(filename) {
  return typeof filename === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]*\.md$/.test(filename);
}
