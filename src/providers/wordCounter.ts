import * as fs from 'fs';

const dataFilePath = './data.txt'; // Path to the data file

export function saveData(data: string): void {
  fs.appendFileSync(dataFilePath, `${data}\n`);
}

export function readData(): string {
  return fs.readFileSync(dataFilePath, 'utf-8');
}