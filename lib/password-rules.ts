export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRuleState = {
  minLength: boolean;
  hasLower: boolean;
  hasUpper: boolean;
  hasDigit: boolean;
};

export function evaluatePasswordRules(password: string): PasswordRuleState {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasDigit: /\d/.test(password)
  };
}

export function isPasswordStrong(password: string): boolean {
  const result = evaluatePasswordRules(password);
  return result.minLength && result.hasLower && result.hasUpper && result.hasDigit;
}
