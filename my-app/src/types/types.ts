export interface InstitutionInfo {
  institution_id: string;
  name: string;
  url?: string | null;
  primary_color?: string | null;
  logo?: string | null;
  oauth?: boolean;
  products: string[];       // list of product names as strings
  country_codes: string[];  // list of country code strings, e.g. ["US"]
  status?: string | null;
}

// Represents an individual balance entry returned by /balances/all
export interface Balance {
  account_id: string;
  item_id: string;
  name: string;
  type: string;       // e.g., "depository", "credit", etc.
  subtype: string;    // e.g., "checking", "savings", etc.
  available?: number | null;  // available balance may be null or missing
  current: number;
  limit?: number | null;      // credit limit or similar, optional
  last_updated: string;       // ISO string date-time
}

export interface PlaidAccountSummary {
  id: string;              // or number, depending on your DB type
  item_id: string;
  institution_id: string;
  created_at: string;      // ISO 8601 date string
}

// Request body for exchanging a public token
export interface PublicTokenRequest {
  public_token: string;
}

// Response from Plaid's create_link_token endpoint
export interface CreateLinkTokenResponse {
  link_token: string;
}

// Response from Plaid's item_public_token_exchange endpoint
export interface ItemPublicTokenExchangeResponse {
  access_token: string;
  item_id: string;
}

// API response from your /exchange_public_token endpoint
export interface ExchangeTokenResponse {
  message: string; // e.g. "Success"
}