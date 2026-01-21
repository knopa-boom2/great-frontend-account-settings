export interface AccountData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  avatarUrl: string | null;
}

export type AccountUpdate = Pick<
  AccountData,
  'firstName' | 'lastName' | 'email' | 'username'
>;

export type AvatarUpdate = Pick<AccountData, 'avatarUrl'>;

export const getAccount = async (): Promise<AccountData> => {
  const response = await fetch('/api/account');
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
};

export const updateAccount = async (
  data: AccountUpdate
): Promise<AccountData> => {
  const response = await fetch('/api/account', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const updatedData: AccountData = await response.json();
  return updatedData;
};

export const updateAvatar = async (avatar: File): Promise<AvatarUpdate> => {
  const formData = new FormData();
  formData.append('avatar', avatar);

  const response = await fetch('/api/account/avatar', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const updatedAvatar: AvatarUpdate = await response.json();
  return updatedAvatar;
};

export const isUsernameUnique = async (username: string): Promise<boolean> => {
  const response = await fetch(
    `/api/account/username?value=${encodeURIComponent(username)}`
  );

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data: { unique: boolean } = await response.json();
  return data.unique;
};
