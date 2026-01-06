export type ProfileFormState = {
  firstName: string;
  lastName: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ProfileMeta = {
  roleLabel: string;
  roleBadgeClass: string;
  permissionBadges: Array<{ label: string }>;
};
