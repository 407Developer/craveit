import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const allowedProviders = new Set(['youtube', 'reddit']);

export const POST: RequestHandler = async ({ params }) => {
  const provider = params.provider;
  if (!provider || !allowedProviders.has(provider)) {
    return json({
      success: false,
      error: 'Unsupported provider'
    }, { status: 400 });
  }

  return json({
    success: true,
    provider,
    authUrl: null,
    message: 'OAuth not configured yet. Wire this to your backend auth flow.'
  });
};
