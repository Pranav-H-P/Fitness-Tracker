import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ObjectMapperService {
  constructor() {}

  snakeToCamelCase(input: string) {
    const parts = input.toLowerCase().split('_');
    const camelCased = parts
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');

    return camelCased;
  }

  dbRowToInterface<T>(dbRowObject: any): T {
    return dbRowObject as T;
  }
}
