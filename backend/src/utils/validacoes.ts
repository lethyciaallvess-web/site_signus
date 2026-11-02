const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailValido(email: string): boolean {
  return email.length <= 255 && REGEX_EMAIL.test(email);
}