import type { Hooks, PluginInput } from "@legion/plugin"

export async function KilocodeAuthPlugin(_input: PluginInput): Promise<Hooks> {
  const prompts = [
    ...(!process.env.KILO_API_KEY
      ? [
          {
            type: "text" as const,
            key: "apiKey",
            message: "Enter your Kilocode API key", // kilocode_change
            placeholder: "e.g. kilo-...",
          },
        ]
      : []),
    ...(!process.env.KILO_ORG_ID
      ? [
          {
            type: "text" as const,
            key: "organizationId",
            message: "Enter your Kilo Organization ID (optional)",
            placeholder: "e.g. org_...",
          },
        ]
      : []),
  ]

  return {
    auth: {
      provider: "kilocode",
      methods: [
        {
          type: "api",
          label: "API key",
          prompts,
        },
      ],
    },
  }
}
