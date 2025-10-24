// Database-backed invoice types
export type DatabaseInvoice = {
  id: string;
  invoiceNumber: string;
  clientId: string;
  startDate: Date;
  dueDate: Date;
  totalAmount: number;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  items: DatabaseInvoiceItem[];
  payments: DatabasePayment[];
};

export type DatabaseInvoiceItem = {
  id: string;
  invoiceId: string;
  projectId: string;
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
  workDate?: Date;
  workDescription?: string;
  createdAt: Date;
  updatedAt: Date;
  project: {
    id: string;
    title: string;
    type: string;
    designLinks?: string;
  };
};

export type DatabasePayment = {
  id: string;
  invoiceId: string;
  paymentMethod:
    | "PAYPAL"
    | "CRYPTO_BITCOIN"
    | "CRYPTO_ETHEREUM"
    | "CRYPTO_USDT"
    | "BANK_TRANSFER"
    | "OTHER";
  paymentProvider?: string;
  transactionId?: string;
  amount: number;
  currency: string;
  status:
    | "PENDING"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED";
  paypalOrderId?: string;
  paypalPayerId?: string;
  cryptoAddress?: string;
  cryptoNetwork?: string;
  metadata?: Record<string, unknown>;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

// Legacy types for backward compatibility during migration
export type LegacyInvoiceItem = {
  id: string;
  projectId: string;
  projectName: string;
  projectType: string;
  unitPrice?: number;
  quantity?: number;
  total?: number;
  workDate?: Date;
  workDescription?: string;
};

export type LegacyInvoice = {
  index: number;
  startDate: Date;
  dueDate: Date;
  items: LegacyInvoiceItem[];
  grandTotal?: number;
};
