import * as path from 'path';

export interface GenerationPath {
  dirName: string;
  fileName: string;
  fullPath: string;
  normalizedPath: string;
}

export const parseGenerationPath = (input: string, rootPath: string): GenerationPath => {
  const trimmedInput = input.trim();
  if (!trimmedInput || /\s/.test(trimmedInput)) {
    throw new Error("That's not a valid name! (no whitespaces or special characters)");
  }

  const normalizedPath = trimmedInput.replace(/[\\/]+/g, path.sep);
  const segments = normalizedPath.split(path.sep);
  if (
    path.isAbsolute(normalizedPath) ||
    segments.some(
      (segment) => segment === '.' || segment === '..' || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(segment),
    )
  ) {
    throw new Error('The generated path must stay inside the selected folder');
  }

  const parsedDirectory = path.dirname(normalizedPath);
  return {
    dirName: parsedDirectory === '.' ? '' : parsedDirectory,
    fileName: path.basename(normalizedPath),
    fullPath: path.join(rootPath, normalizedPath),
    normalizedPath,
  };
};
