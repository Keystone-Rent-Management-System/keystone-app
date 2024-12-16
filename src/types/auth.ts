export interface AccessTypes {
  roles: string[];
}

export interface Profile {
  phoneNumber: string;
  name: string;
  access_types: AccessTypes;
  userId: string;
  username: string;
}

export type ProfileKey = keyof Profile;
