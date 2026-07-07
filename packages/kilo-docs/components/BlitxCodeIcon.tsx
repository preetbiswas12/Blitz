import React from "react"
import { Icon } from "./Icon"

interface BlitxCodeIconProps {
  size?: string
}

export function BlitxCodeIcon({ size = "1.2em" }: BlitxCodeIconProps) {
  return <Icon src="/docs/img/kilo-v1.svg" srcDark="/docs/img/kilo-v1-white.svg" alt="Blitx Code Icon" size={size} />
}
