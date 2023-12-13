import Stripe from 'stripe'
import { env } from './config'

export const stripe = new Stripe(env.STRIPE_API_KEY as string, {
    apiVersion: '2023-10-16',
    typescript: true
})