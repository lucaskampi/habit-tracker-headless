import { IsString, IsOptional, IsEnum, IsObject, IsInt, Min } from 'class-validator';
import { FrequencyType } from '@prisma/client';

export class CreateHabitDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(FrequencyType)
  frequencyType: FrequencyType;

  @IsObject()
  frequencySpec: any;

  @IsOptional()
  @IsInt()
  @Min(1)
  goal?: number = 1;
}
