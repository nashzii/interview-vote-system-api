import { IsNotEmpty, IsString } from 'class-validator';
export class AddVoteItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class EditVoteItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
