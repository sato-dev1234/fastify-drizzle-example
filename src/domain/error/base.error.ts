export abstract class BaseError {
  statusCode?: number;

  code: string;

  error: string;

  constructor(code: string, error: string, statusCode?: number) {
    this.statusCode = statusCode;
    this.code = code;
    this.error = error;
  }
}
