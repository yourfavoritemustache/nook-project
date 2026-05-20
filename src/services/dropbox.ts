export interface DropboxTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  account_id: string;
  uid: string;
}

export class DropboxService {
  private static clientId: string = '';
  private static clientSecret: string = '';
  
  /**
   * Initialize client settings.
   */
  public static init(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Generates the Dropbox OAuth Authorization URL.
   * Redirect URI should point back to the app (web callback or Capacitor deep link).
   */
  public static getAuthUrl(redirectUri: string, state: string = ''): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      token_access_type: 'offline', // Requests a long-lived refresh token
      state: state,
    });
    return `https://www.dropbox.com/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchange the authorization code for access and refresh tokens.
   */
  public static async exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<DropboxTokenResponse & { refresh_token: string }> {
    if (!this.clientId) {
      throw new Error('DropboxService not initialized. Call init() first.');
    }

    const params = new URLSearchParams({
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      client_id: this.clientId,
    });

    if (this.clientSecret) {
      params.append('client_secret', this.clientSecret);
    }

    const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Dropbox token exchange failed: ${JSON.stringify(err)}`);
    }

    return response.json();
  }

  /**
   * Obtain a new access token using a refresh token.
   */
  public static async getAccessTokenFromRefreshToken(
    refreshToken: string
  ): Promise<string> {
    if (!this.clientId) {
      throw new Error('DropboxService not initialized. Call init() first.');
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
    });

    if (this.clientSecret) {
      params.append('client_secret', this.clientSecret);
    }

    const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Dropbox token refresh failed: ${JSON.stringify(err)}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Uploads a file (blob/binary) to the user's Dropbox.
   * Path should start with a slash, e.g., '/nook/bookmarks/recipe.pdf'.
   */
  public static async uploadFile(
    accessToken: string,
    path: string,
    fileBlob: Blob
  ): Promise<any> {
    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({
          path: path,
          mode: 'overwrite',
          autorename: true,
          mute: false,
          strict_conflict: false,
        }),
        'Content-Type': 'application/octet-stream',
      },
      body: fileBlob,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Dropbox file upload failed: ${err}`);
    }

    return response.json();
  }

  /**
   * Retrieves a temporary direct-download link for a file (valid for 4 hours).
   */
  public static async getTemporaryLink(
    accessToken: string,
    path: string
  ): Promise<string> {
    const response = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: path,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Dropbox get temporary link failed: ${JSON.stringify(err)}`);
    }

    const data = await response.json();
    return data.link;
  }

  /**
   * Deletes a file or folder from Dropbox.
   */
  public static async deleteFile(
    accessToken: string,
    path: string
  ): Promise<any> {
    const response = await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: path,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Dropbox delete file failed: ${JSON.stringify(err)}`);
    }

    return response.json();
  }
}
