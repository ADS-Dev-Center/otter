export interface CredentialField {
  id: string;
  credentialId: string;
}

export interface CredentialFieldWithValue extends CredentialField {
  key: string;
  value: string;
  decryptionFailed?: boolean;
}

export interface Credential {
  id: string;
  slug: string;
  name: string;
  environment: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  fields: CredentialField[];
}

export interface CredentialWithProject extends Credential {
  project: {
    id: string;
    name: string;
    divisionId: string;
  };
}
