import { nanoid } from 'nanoid';

export function generateId(prefix = 'id') {
  return `${prefix}-${nanoid()}`;
}
