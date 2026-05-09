export interface CredentialField {
  id: string;
  key: string;
  secret: boolean;
  credentialId: string;
}

export interface CredentialFieldWithValue extends CredentialField {
  value: string;
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
