import { Expose } from 'class-transformer';

export class ResponseMessage {
  @Expose()
  message: string;

  @Expose({ name: 'error' })
  errorMessage?: string;

  constructor(message: string, err?: any) {
    this.message = message;
    if (err) {
      if (typeof err === 'string') {
        this.errorMessage = err;
      } else {
        this.errorMessage = err.message || err?.response?.message;
      }
    }
  }
}
