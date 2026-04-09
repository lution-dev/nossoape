import { INVITE_CODE_CHARS, INVITE_CODE_LENGTH } from "./constants"

export function generateInviteCode(): string {
  let code = ""
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_CHARS[Math.floor(Math.random() * INVITE_CODE_CHARS.length)]
  }
  return code
}
