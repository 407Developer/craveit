import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
  return json({
    categories: ['tech', 'hobby project', 'tech updates', 'politics'],
    mediaTypes: ['all', 'video', 'text']
  });
};
