# Optional Gemini chatbot backend (Cloudflare Workers)

The portfolio is a static GitHub Pages site, so it cannot securely store a provider API key. The chatbot remains fully usable with its local portfolio-grounded fallback until this Worker is deployed and configured. Do not put `GEMINI_API_KEY` in any public repository file.

## Free-tier / cost note

Google's Gemini API pricing page currently lists a free tier for some models and usage types, but model eligibility, request limits, data-use terms, and availability can change by account/region. Check the live [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) and [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) before enabling it. Keep this project on a free-tier eligible model and do not enable billing if zero spend is a hard requirement. Free-tier prompts may be used to improve Google products according to the provider's current terms; review those terms before sending visitor messages.

Cloudflare Workers has a free plan with published daily request limits; see [Workers pricing/limits](https://developers.cloudflare.com/workers/platform/limits/). The in-memory rate limiter in this example is best-effort per isolate, not a globally strict abuse-prevention system. For a public high-traffic deployment, use a Durable Object-based limiter.

## Setup

1. Create a Cloudflare Worker and deploy `worker.js` (ES module format).
2. In Worker Settings → Variables and Secrets, add:
   - `GEMINI_API_KEY` as a **Secret** created in Google AI Studio.
   - `ALLOWED_ORIGIN` as `https://saikat-71.github.io` (origin only, no trailing slash).
   - `PORTFOLIO_DATA_URL` as `https://saikat-71.github.io/data/portfolio.json`.
3. If your GitHub Pages custom domain changes, update `ALLOWED_ORIGIN` and ensure the website's origin matches exactly.
4. In `site-common.js`, set the `CHAT_API_ENDPOINT` constant near the top to your deployed Worker URL. This endpoint URL is public; the API key must remain a Worker secret.
5. Test from the deployed website's browser devtools. If the Worker or Gemini quota fails, the client uses its local portfolio-derived answer instead.

## Security / limitations

- The Worker fetches the live public portfolio JSON itself rather than trusting visitor-supplied knowledge.
- Request size is constrained by the question length; output is limited and shown using `textContent`, not HTML.
- Timeout, origin checking, input validation and best-effort rate limiting are included.
- Do not log visitor questions or add analytics around them without a privacy review.
- This backend has **not** been live-tested with your credentials or deployed to your Cloudflare account. Until configured and `PORTFOLIO_CHAT_API_URL` is set, the site uses its local fallback and should not be described as genuinely AI-powered.
