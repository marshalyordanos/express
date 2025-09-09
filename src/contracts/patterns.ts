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

  BRANCH_CREATE: 'branch.create',
  BRANCH_FIND_BY_ID: 'branch.findById',
  BRANCH_FIND_ALL: 'branch.findAll',
  BRANCH_UPDATE: 'branch.update',
  BRANCH_DELETE: 'branch.delete',
} as const;