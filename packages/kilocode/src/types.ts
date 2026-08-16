import { Schema } from "effect"

export const KiloGatewayOptions = Schema.Struct({
  token: Schema.optional(Schema.String),
  organizationId: Schema.optional(Schema.String),
  baseURL: Schema.optional(Schema.String),
})

export type KiloGatewayOptions = Schema.Schema.Type<typeof KiloGatewayOptions>

export const KiloModel = Schema.Struct({
  id: Schema.String,
  name: Schema.optional(Schema.String),
  family: Schema.optional(Schema.String),
  release_date: Schema.optional(Schema.String),
  attachment: Schema.optional(Schema.Boolean),
  reasoning: Schema.optional(Schema.Boolean),
  temperature: Schema.optional(Schema.Boolean),
  tool_call: Schema.optional(Schema.Boolean),
  cost: Schema.optional(
    Schema.Struct({
      input: Schema.Number,
      output: Schema.Number,
    }),
  ),
  limit: Schema.optional(
    Schema.Struct({
      context: Schema.Number,
      output: Schema.Number,
    }),
  ),
  modalities: Schema.optional(
    Schema.Struct({
      input: Schema.Array(Schema.String),
      output: Schema.Array(Schema.String),
    }),
  ),
})

export type KiloModel = Schema.Schema.Type<typeof KiloModel>

export const KiloModelsResponse = Schema.Struct({
  data: Schema.optional(Schema.Array(KiloModel)),
})

export type KiloModelsResponse = Schema.Schema.Type<typeof KiloModelsResponse>
