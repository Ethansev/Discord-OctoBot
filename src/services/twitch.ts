import axios from 'axios';
import { config } from '../config.js';

const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const STREAMS_URL = 'https://api.twitch.tv/helix/streams';
// Refresh ~5 minutes before the existing token expires.
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;

export interface HelixStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  is_mature?: boolean;
}

interface TokenState {
  accessToken: string;
  expiresAt: number;
}

let tokenState: TokenState | undefined;

async function fetchToken(): Promise<TokenState> {
  const { clientId, clientSecret } = config.twitch;
  if (!clientId || !clientSecret) {
    throw new Error('Twitch client credentials are not configured');
  }
  const response = await axios.post<{ access_token: string; expires_in: number }>(
    TOKEN_URL,
    null,
    {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      },
    }
  );
  return {
    accessToken: response.data.access_token,
    expiresAt: Date.now() + response.data.expires_in * 1000,
  };
}

async function getToken(): Promise<string> {
  if (tokenState && tokenState.expiresAt - Date.now() > TOKEN_REFRESH_MARGIN_MS) {
    return tokenState.accessToken;
  }
  tokenState = await fetchToken();
  return tokenState.accessToken;
}

export async function isLive(username: string): Promise<HelixStream | null> {
  const token = await getToken();
  const response = await axios.get<{ data: HelixStream[] }>(STREAMS_URL, {
    params: { user_login: username },
    headers: {
      Authorization: `Bearer ${token}`,
      'Client-Id': config.twitch.clientId,
    },
  });
  return response.data?.data?.[0] ?? null;
}

export function _resetForTests(): void {
  tokenState = undefined;
}
