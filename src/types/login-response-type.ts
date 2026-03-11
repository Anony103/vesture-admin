export type LoginResponseType = {
  code: number;
  message: string;
  data: {
    firstName: string;
    middleName: string;
    lastName: string;
    token ?: string 
  };
};
