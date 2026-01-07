export interface RazorpayOrderRequest {
  planId: string
  amount: number
}

export interface RazorpayOrderResponse {
  orderId: string
  amount: number
  currency: string
}

export interface RazorpayVerifyRequest {
  orderId: string
  paymentId: string
  signature: string
}

export interface RazorpayVerifyResponse {
  success: boolean
  subscriptionId?: string
  message: string
}

export interface RazorpayOrder {
  id: string
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  status: string
  attempts: number
  created_at: number
}

declare global {
  interface Window {
    Razorpay: any
  }
}




