import { IntegrationBase, SqlQuery } from "@budibase/types"
import Stripe from "stripe"

class CustomIntegration implements IntegrationBase {
  private readonly stripe: Stripe

  constructor(config: { apiKey: string; }) {
    this.stripe = new Stripe(config.apiKey, {
      apiVersion: '2022-08-01'
    })
  }

  async create(query: { 
    amount: number,
    charge: string,
    currency: string,
    description: string,
    metadata: object,
    payment_intent: string,
    reason: string,
    refund_application_fee: string,
    reverse_transfer: string,
    statement_descriptor: string,
    extra: { [key:string]: string }
   }) {
    if (query.extra.type === "Refunds") {
      return await this.stripe.refunds.create({
        charge: query.charge,
        amount: query.amount,
        metadata: query.metadata as Stripe.Metadata,
        payment_intent: query.payment_intent,
        reason: query.reason as Stripe.RefundCreateParams.Reason,
        refund_application_fee: query.refund_application_fee === "true",
        reverse_transfer: query.reverse_transfer === "true"
      })
    }
    return await this.stripe.payouts.create({
      amount: query.amount,
      currency: query.currency,
      description: query.description,
      metadata: query.metadata as Stripe.Metadata,
      statement_descriptor: query.statement_descriptor
    })
  }

  async read(query: { 
    id: string,
    status: string,
    destination: string,
    charge: string,
    payment_intent: string,
    ending_before: string,
    limit: number,
    starting_after: string,
    extra: { [key:string]: string }
   }) {
    if (query.extra.type === "Refunds") {
      if (query.id) {
        return await this.stripe.refunds.retrieve(query.id)
      }
      return await this.stripe.refunds.list({
        charge: query.charge,
        payment_intent: query.payment_intent,
        ending_before: query.ending_before,
        limit: query.limit,
        starting_after: query.starting_after
      })
    }
    if (query.id) {
      return await this.stripe.payouts.retrieve(query.id)
    }
    return await this.stripe.payouts.list({
      destination: query.destination,
      ending_before: query.ending_before,
      limit: query.limit,
      starting_after: query.starting_after
    })
  }

  async update(query: {
    id: string,
    metadata: object,
    extra: { [key:string]: string }
   }) {
    if (query.extra.type === "Refunds") {
      return await this.stripe.refunds.update(query.id, { metadata: query.metadata as Stripe.Metadata })
    }
    return await this.stripe.payouts.update(query.id, { metadata: query.metadata as Stripe.Metadata })
  }

  async cancel(query: { id: string, extra: { [key:string]: string } }) {
    if (query.extra.type === "Refunds") {
      return await this.stripe.refunds.cancel(query.id)
    }
    return await this.stripe.payouts.cancel(query.id)
  }
}

export default CustomIntegration