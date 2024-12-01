export type DeepSerialize<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Array<infer U>
      ? Array<DeepSerialize<U>>
      : T[K] extends object
        ? DeepSerialize<T[K]>
        : T[K];
};

export function serialize<T = unknown>(obj: T): DeepSerialize<T> {
  if (obj instanceof Date) {
    return obj.toISOString() as DeepSerialize<T>;
  } else if (Array.isArray(obj)) {
    return obj.map((item) => serialize(item)) as DeepSerialize<T>;
  } else if (typeof obj === "object" && obj !== null) {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = serialize(obj[key]);
      }
    }
    return result;
  } else {
    return obj as DeepSerialize<T>;
  }
}
