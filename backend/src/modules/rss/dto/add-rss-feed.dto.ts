import { IsString, IsUrl } from 'class-validator';

export class AddRssFeedDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;
}
