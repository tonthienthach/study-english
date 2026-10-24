import { IsBase64, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssessPronunciationDto {
  @IsString()
  @IsNotEmpty()
  referenceText!: string;

  @IsBase64()
  audioBase64!: string;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsString()
  @IsOptional()
  locale?: string;
}
