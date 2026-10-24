import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWordDto {
  @IsString()
  @IsNotEmpty()
  term!: string;

  @IsString()
  @IsNotEmpty()
  meaning!: string;
}
