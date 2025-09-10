export interface AccountData {
  name: string;
  token: string;
  chatId: string;
  username: string;
  password: string;
}

export interface ClientData {
  name: string;
  number: string;
  username: string;
  password: string;
}

export interface TeamGroup {
  id: string;
  name: string;
  client: ClientData;
  producer: AccountData;
  designer: AccountData;
  reviewer: AccountData;
  createdAt: Date;
}
