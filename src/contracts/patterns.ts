export const PATTERNS = {
  AUTH_REGISTER: 'auth.register',
  AUTH_LOGIN: 'auth.login',
  AUTH_REFRESH_TOKEN: 'auth.refresh_token',
  AUTH_CHANGE_PASSWORD: 'auth.change_password',

  USER_CREATE: 'user.create',
  USER_FIND_BY_ID: 'user.findById',
  USER_FIND_ALL: 'user.findAll',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_FIND_BY_EMAIL: 'user.findByEmail',
  USER_CHANGE_ROLE: 'user.changeRole',

  STAFF_CREATE: 'staff.register',
  STAFF_DELETE: 'staff.delete',
  STAFF_FIND_ALL: 'staff.findAll',
  STAFF_FIND_BY_ROLE: 'staff.findByRole',

  BRANCH_CREATE: 'branch.create',
  BRANCH_FIND_BY_ID: 'branch.findById',
  BRANCH_FIND_ALL: 'branch.findAll',
  BRANCH_UPDATE: 'branch.update',
  BRANCH_DELETE: 'branch.delete',
  BRANCH_ASSIGN_MANAGER: 'branch.assignManager',
  BRANCH_REVOKE_MANAGER: 'branch.revokeManager',

  ROLE_CREATE: 'role.create',
  ROLE_FIND_BY_ID_OR_NAME: 'role.findByIdOrName',
  ROLE_FIND_ALL: 'role.findAll',
  ROLE_UPDATE: 'role.update',
  ROLE_DELETE: 'role.delete',
} as const;