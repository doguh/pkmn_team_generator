export function randomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

export function random<T>(list: T[]): T {
  return list[randomIndex(list.length)];
}
