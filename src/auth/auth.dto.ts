import { IsNotEmpty, IsString } from 'class-validator';
export class SigninDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
