import {
  prepare,
  prepareWithSegments,
  layout,
  layoutWithLines,
  layoutNextLine,
  walkLineRanges,
  type PreparedText,
  type PreparedTextWithSegments,
  type LayoutCursor,
  type LayoutLine,
} from '@chenglou/pretext'

export const FONT_HEADING = '"Playfair Display", Georgia, serif'
export const FONT_BODY = 'Inter, system-ui, sans-serif'
export const FONT_ITALIC = 'italic "Playfair Display", Georgia, serif'

export const HEADING_LINE_HEIGHT = 1.15
export const BODY_LINE_HEIGHT = 1.65
export const LABEL_LINE_HEIGHT = 1.4

export type FontSpec = {
  font: string
  lineHeight: number
}

export const headingFont = (size: number): FontSpec => ({
  font: `${size}px ${FONT_HEADING}`,
  lineHeight: Math.round(size * HEADING_LINE_HEIGHT),
})

export const bodyFont = (size: number): FontSpec => ({
  font: `${size}px ${FONT_BODY}`,
  lineHeight: Math.round(size * BODY_LINE_HEIGHT),
})

export const italicFont = (size: number): FontSpec => ({
  font: `${size}px ${FONT_ITALIC}`,
  lineHeight: Math.round(size * HEADING_LINE_HEIGHT),
})

const prepareCache = new Map<string, PreparedTextWithSegments>()
const prepareOpaqueCache = new Map<string, PreparedText>()

function cacheKey(text: string, font: string): string {
  return `${font}::${text}`
}

export function getPreparedWithSegments(text: string, font: string): PreparedTextWithSegments {
  const key = cacheKey(text, font)
  const cached = prepareCache.get(key)
  if (cached !== undefined) return cached
  const prepared = prepareWithSegments(text, font)
  prepareCache.set(key, prepared)
  return prepared
}

export function getPrepared(text: string, font: string): PreparedText {
  const key = cacheKey(text, font)
  const cached = prepareOpaqueCache.get(key)
  if (cached !== undefined) return cached
  const prepared = prepare(text, font)
  prepareOpaqueCache.set(key, prepared)
  return prepared
}

export function measureTextHeight(
  text: string,
  maxWidth: number,
  font: string,
  lineHeight: number,
): number {
  const prepared = getPrepared(text, font)
  const { height } = layout(prepared, maxWidth, lineHeight)
  return height
}

export function measureLineCount(
  text: string,
  maxWidth: number,
  font: string,
): number {
  const prepared = getPreparedWithSegments(text, font)
  let count = 0
  walkLineRanges(prepared, maxWidth, () => { count++ })
  return count
}

export function layoutTextLines(
  text: string,
  maxWidth: number,
  font: string,
  lineHeight: number,
): LayoutLine[] {
  const prepared = getPreparedWithSegments(text, font)
  const { lines } = layoutWithLines(prepared, maxWidth, lineHeight)
  return lines
}

export function measureNaturalWidth(text: string, font: string): number {
  const prepared = getPreparedWithSegments(text, font)
  let max = 0
  walkLineRanges(prepared, 100000, (line) => { if (line.width > max) max = line.width })
  return max
}

export function fitHeadlineFontSize(
  text: string,
  maxWidth: number,
  minSize: number,
  maxSize: number,
  fontFamily: string = FONT_HEADING,
  lineHeightRatio: number = HEADING_LINE_HEIGHT,
): number {
  let low = minSize
  let high = maxSize
  let best = minSize

  while (low <= high) {
    const size = Math.floor((low + high) / 2)
    const font = `700 ${size}px ${fontFamily}`
    const prepared = getPreparedWithSegments(text, font)
    let breaksInsideWord = false
    walkLineRanges(prepared, maxWidth, (line) => {
      if (line.end.graphemeIndex !== 0) breaksInsideWord = true
    })
    if (!breaksInsideWord) {
      best = size
      low = size + 1
    } else {
      high = size - 1
    }
  }

  return best
}

export function fitFontSizeToLineCount(
  text: string,
  maxWidth: number,
  maxLines: number,
  minSize: number,
  maxSize: number,
  fontFamily: string = FONT_BODY,
  lineHeightRatio: number = BODY_LINE_HEIGHT,
): number {
  let low = minSize
  let high = maxSize
  let best = minSize

  while (low <= high) {
    const size = Math.floor((low + high) / 2)
    const font = `${size}px ${fontFamily}`
    const prepared = getPreparedWithSegments(text, font)
    let lineCount = 0
    walkLineRanges(prepared, maxWidth, () => { lineCount++ })
    if (lineCount <= maxLines) {
      best = size
      low = size + 1
    } else {
      high = size - 1
    }
  }

  return best
}

export function layoutAroundObstacles(
  text: string,
  font: string,
  lineHeight: number,
  containerWidth: number,
  containerHeight: number,
  obstacles: Array<{ x: number; y: number; width: number; height: number }>,
  offsetX: number = 0,
  offsetY: number = 0,
): Array<{ x: number; y: number; text: string; width: number }> {
  const prepared = getPreparedWithSegments(text, font)
  const lines: Array<{ x: number; y: number; text: string; width: number }> = []
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
  let lineTop = 0

  while (true) {
    if (lineTop + lineHeight > containerHeight) break

    const bandTop = lineTop
    const bandBottom = lineTop + lineHeight

    let availableLeft = offsetX
    let availableRight = offsetX + containerWidth

    for (const obs of obstacles) {
      if (bandBottom > obs.y && bandTop < obs.y + obs.height) {
        const obsLeft = obs.x
        const obsRight = obs.x + obs.width
        if (obsLeft > availableLeft && obsLeft < availableRight) {
          availableRight = obsLeft
        }
        if (obsRight > availableLeft && obsRight < availableRight) {
          availableLeft = obsRight
        }
      }
    }

    const slotWidth = availableRight - availableLeft
    if (slotWidth <= 0) {
      lineTop += lineHeight
      continue
    }

    const line = layoutNextLine(prepared, cursor, slotWidth)
    if (line === null) break

    lines.push({
      x: availableLeft,
      y: lineTop + offsetY,
      text: line.text,
      width: line.width,
    })

    cursor = line.end
    lineTop += lineHeight
  }

  return lines
}

export function clearPretextCache(): void {
  prepareCache.clear()
  prepareOpaqueCache.clear()
}
