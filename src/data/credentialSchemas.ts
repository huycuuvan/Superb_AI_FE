// Định nghĩa schema động cho từng provider credential
// Có thể mở rộng thêm provider mới dễ dàng

export interface CredentialField {
  name: string;
  label: string;
  type: "text" | "password" | "textarea" | "file" | "email";
  required: boolean;
  description?: string;
  sensitive?: boolean; // true nếu là token/secret
  placeholder?: string;
}

export interface ProviderSchema {
  provider: string;
  name: string;
  docUrl?: string;
  oauthRedirectUrl?: string;
  fields: CredentialField[];
}

export const CREDENTIAL_SCHEMAS: ProviderSchema[] = [
  {
    provider: "google",
    name: "Google Ads",
    docUrl: "https://developers.google.com/google-ads/api/docs/oauth/overview",
    oauthRedirectUrl: "https://yourdomain.com/oauth/google/callback",
    fields: [
      {
        name: "client_id",
        label: "Client ID",
        type: "text",
        required: true,
        description: "Google OAuth Client ID",
      },
      {
        name: "client_secret",
        label: "Client Secret",
        type: "password",
        required: true,
        description: "Google OAuth Client Secret",
        sensitive: true,
      },
      {
        name: "developer_token",
        label: "Developer Token",
        type: "text",
        required: true,
        description: "Google Ads Developer Token",
        sensitive: true,
      },
      {
        name: "refresh_token",
        label: "Refresh Token",
        type: "password",
        required: true,
        description: "Google OAuth Refresh Token",
        sensitive: true,
      },
      // Nếu cần upload file service account:
      // { name: 'service_account_json', label: 'Service Account JSON', type: 'file', required: false, description: 'Upload file JSON service account' },
    ],
  },
  {
    provider: "facebook",
    name: "Facebook",
    docUrl: "https://developers.facebook.com/docs/facebook-login/access-tokens",
    fields: [
      {
        name: "token",
        label: "Access Token",
        type: "password",
        required: true,
        description: "Facebook API Access Token",
        sensitive: true,
      },
      {
        name: "page_id",
        label: "Page ID",
        type: "text",
        required: true,
        description: "ID của Facebook Page cần kết nối",
      },
    ],
  },
  {
    provider: "aws",
    name: "AWS",
    docUrl:
      "https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html",
    fields: [
      {
        name: "access_key_id",
        label: "Access Key ID",
        type: "text",
        required: true,
        description: "AWS Access Key ID",
      },
      {
        name: "secret_access_key",
        label: "Secret Access Key",
        type: "password",
        required: true,
        description: "AWS Secret Access Key",
        sensitive: true,
      },
      {
        name: "region",
        label: "Region",
        type: "text",
        required: true,
        description: "AWS Region (ví dụ: ap-southeast-1)",
      },
    ],
  },
  {
    provider: "openai",
    name: "OpenAI",
    docUrl: "https://platform.openai.com/account/api-keys",
    fields: [
      {
        name: "api_key",
        label: "API Key",
        type: "password",
        required: true,
        description: "OpenAI API Key",
        sensitive: true,
      },
      {
        name: "organization",
        label: "Organization",
        type: "text",
        required: false,
        description: "OpenAI Organization ID (nếu có)",
      },
    ],
  },
  // Thêm provider khác ở đây nếu cần
];
