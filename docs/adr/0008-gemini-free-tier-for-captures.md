# Gemini free tier for receipts and text captures

Receipts and free-text messages are read by Google Gemini on its free tier, through TanStack AI. It handles reading the receipt and understanding it in one call, and costs nothing. The user accepted that Google may use free-tier data to improve its products. Free-tier limits are handled by keeping a capture, telling the member that the quota ran out, and retrying after the reset.

## Considered options

- **Cloudflare Workers AI.** Rejected: weaker at reading receipts.
- **OpenAI, or Gemini on a paid plan.** Rejected for now: they cost money. TanStack AI makes the provider swappable later.
