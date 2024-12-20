export type SubscriptionPlan = 'Free' | 'Pro'

export interface User {
  id: string
  name: string
  email: string
  image?: string | null
  subscriptionPlan: SubscriptionPlan
}
