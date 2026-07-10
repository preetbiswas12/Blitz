import React from "react"
import { Icon } from "./Icon"

interface LegionCodeIconProps {
  size?: string
}

export function LegionCodeIcon({ size = "1.2em" }: LegionCodeIconProps) {
  return <Icon src="/docs/img/kilo-v1.svg" srcDark="/docs/img/kilo-v1-white.svg" alt="Legion Code Icon" size={size} />
}
