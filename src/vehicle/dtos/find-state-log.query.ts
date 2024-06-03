import { IsDateString } from 'class-validator';

export class FindStateLogQuery {
  @IsDateString()
  timestamp: string;
}
