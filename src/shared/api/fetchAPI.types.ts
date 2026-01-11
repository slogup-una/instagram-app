type Row<T> = {
  row: T;
  statusCode: number;
};

type Rows<T> = {
  rows: T[];
  count: number;
  statusCode: number;
};

type ErrorResponse = {
  data: {
    error: string;
    errorCode: string;
    message: string;
    statusCode: number;
  };
  status: number;
};

export type { Row, Rows, ErrorResponse };
