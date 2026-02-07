import type { CredentialSource, KeychainCredentials } from './keychain.js'
import { saveCredentials } from './keychain.js'

const OAUTH_CLIENT_ID = '9d1c250a-e61b-44d9-88ed-5944d1962f5e'
const TOKEN_ENDPOINT = 'https://platform.claude.com/v1/oauth/token'
const EXPIRY_BUFFER_MS = 5 * 60 * 1000

export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt - EXPIRY_BUFFER_MS
}

export async function refreshToken(credentials: KeychainCredentials): Promise<KeychainCredentials | null> {
  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: OAUTH_CLIENT_ID,
        refresh_token: credentials.claudeAiOauth.refreshToken,
        scope: 'user:profile user:inference user:sessions:claude_code user:mcp_servers'
      })
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as {
      access_token: string
      refresh_token: string
      expires_in: number
    }

    return {
      claudeAiOauth: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
        subscriptionType: credentials.claudeAiOauth.subscriptionType
      }
    }
  } catch {
    return null
  }
}

export async function ensureValidToken(
  configDirPath: string,
  source: CredentialSource,
  credentials: KeychainCredentials
): Promise<string | null> {
  if (!isTokenExpired(credentials.claudeAiOauth.expiresAt)) {
    return credentials.claudeAiOauth.accessToken
  }

  const refreshed = await refreshToken(credentials)
  if (!refreshed) {
    return null
  }

  // Persist refreshed credentials back to the original source
  saveCredentials(configDirPath, source, refreshed)
  return refreshed.claudeAiOauth.accessToken
}
