import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

/**
 * @dev Import UserAttributes.
 */
import {
  PASSWORD_EXPLAIN,
  PASSWORD_REGEX,
  UserAttributes,
} from '../entities/user.entity';

/**
 * @dev Declare attribute dto.
 */
export class CreateUserAttributeDto implements UserAttributes {
  @IsOptional()
  @IsUrl({
    require_protocol: true,
    require_valid_protocol: true,
  })
  avatar?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
    require_valid_protocol: true,
  })
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  nickname?: string;

  @IsOptional()
  @IsString()
  @Length(2)
  locale?: string;

  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  middle_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  last_name?: string;
}

/**
 * @dev Declare create user dto
 */
export class CreateUserDto {
  @IsEmail()
  email?: string;

  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_EXPLAIN })
  password?: string;

  @ValidateNested()
  @Type(() => CreateUserAttributeDto)
  attributes?: CreateUserAttributeDto;
}
