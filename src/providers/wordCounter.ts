import * as fs from 'fs';

export interface WordLine {
  chatId: number
  word: string
  times: number
  users: Users
}

export interface Users {
  [key: string]: number
}

const dataFilePath = './data.txt'; // Path to the data file

export function addWord(chat: number, data: string, times = 1, user: string): void {
  let added = false;
  const lines = fs.readFileSync(dataFilePath, 'utf-8').split('\n').filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const json: WordLine = JSON.parse(lines[i]);
    if (chat !== json.chatId) continue;
    if (json.word !== data) continue;
    json.times += times;
    json.users[user] += times;
    lines[i] = JSON.stringify(json);
    fs.writeFileSync(dataFilePath, lines.join('/n'));
    added = true;
  }
  if (!added) {
    const string = JSON.stringify([chat, data, 1, [{ user: 1 }]]);
    fs.appendFileSync(dataFilePath, `${string}\n`);
  }

}

export function readData(): string {
  return fs.readFileSync(dataFilePath, 'utf-8');
}

export function clearData(): void {
  fs.writeFileSync(dataFilePath, '');
}