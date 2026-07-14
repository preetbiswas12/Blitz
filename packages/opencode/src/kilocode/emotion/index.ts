// kilocode_change - new file
// Emotion detection module for user input
// Uses keyword/pattern matching to detect emotional signals in text

export type Emotion =
  | "frustration"
  | "anger"
  | "sadness"
  | "happiness"
  | "gratitude"
  | "fear"
  | "confusion"
  | "urgency"
  | "excitement"
  | "neutral"

interface EmotionPattern {
  emotion: Emotion
  keywords: RegExp[]
  weight: number
}

const patterns: EmotionPattern[] = [
  {
    emotion: "frustration",
    keywords: [
      /\bfrustrat(ed|ing)\b/i,
      /\bstuck\b/i,
      /\bcan'?t\s+(figure|fix|solve|make|get)/i,
      /\b(doesn'?t|doesn|didnt|doesn't)\s+work\b/i,
      /\b(broken|not\s+working|won'?t)\b/i,
      /\bagain\b.*\b(fail|error|broken|wrong)/i,
      /\b(fail|error|broken)\b.*\bagain\b/i,
      /\bover\s+and\s+over\b/i,
      /\bkeeps?\s+(crashing|failing|breaking)/i,
      /\bwhy\b.*\b(not|doesn't|won't|can't)/i,
      /\bthis\s+(is\s+)?(stupid|useless|broken|nonsense)/i,
      /\bdriv(e|ing)\s+me\s+(crazy|insane|nuts|up\s+the\s+wall)/i,
      /\bgodd?amn/i,
      /\bwtf\b/i,
      /\bfor\s+fuck/i,
      /\bfml\b/i,
    ],
    weight: 1.5,
  },
  {
    emotion: "anger",
    keywords: [
      /\bangr(y|ily|iest)\b/i,
      /\bfurious\b/i,
      /\bpiss(ed|ing)\s*(off)?\b/i,
      /\bhate\s+(this|that|it|you)/i,
      /\bidiot(ic)?\b/i,
      /\bstupid\b/i,
      /\bdamn(it|)\b/i,
      /\btrash(ey)?\b/i,
      /\bterrible\b/i,
      /\bawful\b/i,
      /\bhorrible\b/i,
      /\bworst\b/i,
      /\bgarbage\b/i,
      /\bbugg?y\b/i,
    ],
    weight: 2.0,
  },
  {
    emotion: "sadness",
    keywords: [
      /\bsad(ly)?\b/i,
      /\bdepressed?\b/i,
      /\bunhappy\b/i,
      /\bmiserable\b/i,
      /\bcry(ing)?\b/i,
      /\btear(s|ful)\b/i,
      /\bheartbroken\b/i,
      /\bdisappointed\b/i,
      /\blet\s+me\s+down\b/i,
      /\bfeel(ing)?\s+(bad|down|low|empty|hopeless)/i,
      /\bgive\s+up\b/i,
      /\bwhat'?s\s+the\s+point\b/i,
      /\bno\s+point\b/i,
      /\buseless\b/i,
      /\bworthless\b/i,
    ],
    weight: 1.5,
  },
  {
    emotion: "happiness",
    keywords: [
      /\bhapp(y|ier|ily)\b/i,
      /\bexcited\b/i,
      /\bamazing\b/i,
      /\bawesome\b/i,
      /\bbrilliant\b/i,
      /\bperfect\b/i,
      /\blove\s+(this|that|it|you)\b/i,
      /\bfantastic\b/i,
      /\bwonderful\b/i,
      /\bincredible\b/i,
      /\bthank(s|you)\b/i,
      /\byay\b/i,
      /\bwoohoo\b/i,
      /\bfinally\b.*\b(worked|fixed|found|solved)/i,
      /\b(worked|fixed|found|solved)\b.*\bfinally\b/i,
      /\bnailed\s+it\b/i,
    ],
    weight: 1.0,
  },
  {
    emotion: "gratitude",
    keywords: [
      /\bthank(s|you)\b/i,
      /\bappreciate(d|)\b/i,
      /\bgrateful\b/i,
      /\bsaved\s+me\b/i,
      /\bhelp(ful|ed)?\b/i,
      /\bgreat\s+job\b/i,
      /\bnice\s+work\b/i,
      /\bwell\s+done\b/i,
      /\bprops\b/i,
      /\bkudos\b/i,
    ],
    weight: 1.0,
  },
  {
    emotion: "fear",
    keywords: [
      /\bafraid\b/i,
      /\bscared\b/i,
      /\bworried\b/i,
      /\bnervous\b/i,
      /\bpanic(king)?\b/i,
      /\bscared\b/i,
      /\bfrightened\b/i,
      /\bterrified\b/i,
      /\bconcern(ed)?\b/i,
      /\brisk\b.*\b(high|big|large|serious|major)/i,
      /\b(losing|lost)\s+(data|work|everything)/i,
      /\bcorrupt(ed)?\b/i,
      /\bdisaster\b/i,
    ],
    weight: 1.2,
  },
  {
    emotion: "confusion",
    keywords: [
      /\bconfus(ed|ing)\b/i,
      /\bperplexed\b/i,
      /\bbaffl(ed|ing)\b/i,
      /\bdon'?t\s+understand\b/i,
      /\bno\s+idea\b/i,
      /\bwhat\s+do\s+(you|i)\b/i,
      /\bhow\s+(do|does|can|should)\b/i,
      /\bexplain\b/i,
      /\bunclear\b/i,
      /\bpuzzl(ed|ing)\b/i,
      /\bmakes?\s+no\s+sense\b/i,
      /\bdoesn'?t\s+make\s+sense\b/i,
      /\bhuh\??\b/i,
    ],
    weight: 1.0,
  },
  {
    emotion: "urgency",
    keywords: [
      /\burgent\b/i,
      /\basap\b/i,
      /\bimmediately\b/i,
      /\bright\s+now\b/i,
      /\bneed\s+this\s+(done|fixed|now)/i,
      /\bdue\s+(today|soon|now)/i,
      /\bdeadline\b/i,
      /\bhurry\b/i,
      /\bquick(ly)?\b/i,
      /\bfast\b/i,
      /\bcritical\b/i,
      /\bemergency\b/i,
      /\bblock(ed)?\b/i,
      /\bcan'?t\s+proceed\b/i,
      /\b(production|prod)\s+(is\s+)?(down|broken|failing)/i,
    ],
    weight: 1.3,
  },
  {
    emotion: "excitement",
    keywords: [
      /\bexcited\b/i,
      /\bcan'?t\s+wait\b/i,
      /\blooking\s+forward\b/i,
      /\bsick\b/i,
      /\bfire\b/i,
      /\blit\b/i,
      /\bhell\s+yeah\b/i,
      /\byeah\b.*\bye(ah|h)\b/i,
      /\blet'?s\s+go\b/i,
      /\bthis\s+is\s+going\s+to\s+be\b/i,
    ],
    weight: 1.2,
  },
]

export interface DetectedEmotion {
  emotion: Emotion
  confidence: number
}

export function detectEmotions(text: string): DetectedEmotion[] {
  if (!text || text.trim().length === 0) return []

  const results: Array<{ emotion: Emotion; score: number }> = []

  for (const pattern of patterns) {
    let score = 0
    for (const keyword of pattern.keywords) {
      if (keyword.test(text)) {
        score += pattern.weight
      }
    }
    if (score > 0) {
      results.push({ emotion: pattern.emotion, score })
    }
  }

  if (results.length === 0) return []

  const maxScore = Math.max(...results.map((r) => r.score))

  return results
    .map((r) => ({
      emotion: r.emotion,
      confidence: Math.min(r.score / maxScore, 1.0),
    }))
    .sort((a, b) => b.confidence - a.confidence)
}

export function formatEmotionContext(emotions: DetectedEmotion[]): string {
  if (emotions.length === 0) return ""

  const primary = emotions[0]
  const secondary = emotions.length > 1 ? emotions[1] : null

  const lines: string[] = []
  lines.push("# User Emotional State")
  lines.push("")
  lines.push(
    `The user appears to be expressing **${primary.emotion}**` +
      (primary.confidence < 0.7 ? " (low confidence)" : "") +
      ".",
  )

  if (secondary && secondary.confidence > 0.5) {
    lines.push(`There are also traces of **${secondary.emotion}** in their message.`)
  }

  lines.push("")

  switch (primary.emotion) {
    case "frustration":
      lines.push(
        "The user is frustrated. Acknowledge their frustration directly. Focus on solutions.",
        "Do not be dismissive or overly cheerful. Be concise and action-oriented.",
        "Validate that the problem is real, then fix it.",
      )
      break
    case "anger":
      lines.push(
        "The user is angry. Stay calm and professional. Do not be defensive.",
        "Acknowledge the issue, take ownership if appropriate, and provide a clear fix.",
        "Do not use humor or lighten the tone.",
      )
      break
    case "sadness":
      lines.push(
        "The user is feeling down or disappointed. Be empathetic but not patronizing.",
        "Acknowledge their feelings briefly, then focus on what can be done.",
        "Avoid toxic positivity or dismissing their concerns.",
      )
      break
    case "happiness":
      lines.push(
        "The user is happy or satisfied. Match their positive energy briefly.",
        "Acknowledge the success, then continue being helpful.",
        "Do not overdo it — stay focused on the task.",
      )
      break
    case "gratitude":
      lines.push(
        "The user is expressing gratitude. Accept it briefly and naturally.",
        "Do not be overly modest or dismissive. A simple acknowledgment is fine.",
      )
      break
    case "fear":
      lines.push(
        "The user is worried or scared. Reassure them with facts and expertise.",
        "Explain what is happening and what the actual risk is.",
        "Be specific and clear — vague reassurance is not helpful.",
      )
      break
    case "confusion":
      lines.push(
        "The user is confused. Explain things more clearly.",
        "Use simpler language, provide examples, and break things into steps.",
        "Check for understanding without being condescending.",
      )
      break
    case "urgency":
      lines.push(
        "The user is in a hurry or under time pressure.",
        "Prioritize speed. Give the most important answer first.",
        "Skip unnecessary explanations unless they ask.",
      )
      break
    case "excitement":
      lines.push(
        "The user is excited. Match their energy briefly.",
        "Be enthusiastic about what they're building or discovering.",
        "Channel their excitement into productive next steps.",
      )
      break
    default:
      break
  }

  return lines.join("\n")
}
