import * as fs from 'fs';
import * as path from 'path';

const isGeneratedDartFile = (fileName: string): boolean => {
  const lowerCaseName = fileName.toLowerCase();
  return lowerCaseName.endsWith('.g.dart') || lowerCaseName.endsWith('.freezed.dart');
};

export const collectIndexFiles = async (
  directory: string,
  fileList: string[] = [],
  isRoot = true,
): Promise<string[]> => {
  const files = (await fs.promises.readdir(directory)).sort();
  if (!isRoot && files.includes('index.dart')) {
    fileList.push(path.join(directory, 'index.dart'));
    return fileList;
  }

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = await fs.promises.stat(filePath);
    if (stat.isDirectory()) {
      await collectIndexFiles(filePath, fileList, false);
    } else if (file.toLowerCase().endsWith('.dart') && !isGeneratedDartFile(file)) {
      fileList.push(filePath);
    }
  }

  return fileList;
};

export const createIndexContent = async (directory: string, quote: string): Promise<string> => {
  const files = await collectIndexFiles(directory);
  return files
    .map((filePath) => path.relative(directory, filePath).replace(/\\/g, '/'))
    .filter((relativePath) => relativePath !== 'index.dart')
    .map((relativePath) => `export ${quote}${relativePath}${quote};\n`)
    .join('');
};
