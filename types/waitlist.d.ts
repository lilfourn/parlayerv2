import { RowCellData } from 'google-spreadsheet';

export interface FormData {
  email: string;
}

export interface WaitlistData {
  [key: string]: RowCellData;
  email: string;
  timestamp: string;
}

export interface ApiResponse {
  success?: boolean;
  error?: string;
  message?: string;
}
