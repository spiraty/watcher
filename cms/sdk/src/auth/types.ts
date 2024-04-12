export type AuthenticationMode = 'json' | 'cookie' | 'session';

export type LoginOptions = {
	/** The user's one-time-password (if MFA is enabled). */
	otp?: string;
	/** Whether to retrieve the refresh token in the JSON response, or in a httpOnly cookie. One of `json`, `cookie` or `session`. Defaults to `cookie`. */
	mode?: AuthenticationMode;
	/** Use a specific authentication provider (does not work for SSO that relies on browser redirects). */
	provider?: string;
};

export interface AuthenticationData {
	access_token: string | null;
	refresh_token: string | null;
	expires: number | null;
	expires_at: number | null;
}

export interface AuthenticationStorage {
	get: () => Promise<AuthenticationData | null> | AuthenticationData | null;
	set: (value: AuthenticationData | null) => Promise<void> | void;
}

export interface AuthenticationConfig {
	autoRefresh: boolean;
	msRefreshBeforeExpires: number;
	credentials?: RequestCredentials;
	storage?: AuthenticationStorage;
}

export interface AuthenticationClient<_Schema extends object> {
	login(email: string, password: string, options?: LoginOptions): Promise<AuthenticationData>;
	refresh(): Promise<AuthenticationData>;
	logout(): Promise<void>;

	stopRefreshing(): void;

	getToken(): Promise<string | null>;
	setToken(access_token: string | null): void;
}

export interface StaticTokenClient<_Schema extends object> {
	getToken(): Promise<string | null>;
	setToken(access_token: string | null): void;
}
