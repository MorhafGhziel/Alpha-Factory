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

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  groupId?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  type: string;
  filmingStatus: string;
  fileLinks?: string;
  notes?: string;
  date: string;
  startDate?: Date;
  endDate?: Date;

  // Progress tracking fields
  editMode: string;
  reviewMode: string;
  designMode: string;
  verificationMode: string;

  // Links for different stages
  reviewLinks?: string;
  designLinks?: string;
  documentation?: string;
  videoDuration?: string;

  // Relations
  clientId: string;
  client?: {
    id: string;
    name: string;
    email: string;
  };
  groupId?: string;
  group?: {
    id: string;
    name: string;
    telegramChatId?: string;
  };

  // Assignment tracking
  editorId?: string;
  editor?: {
    id: string;
    name: string;
    email: string;
  };
  designerId?: string;
  designer?: {
    id: string;
    name: string;
    email: string;
  };
  reviewerId?: string;
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

// Global type declarations
declare global {
  var otpStorage: Map<string, { code: string; expires: number }> | undefined;
}
