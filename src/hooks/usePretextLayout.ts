'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  measureTextHeight,
  measureLineCount,
  layoutTextLines,
  fitHeadlineFontSize,
  fitFontSizeToLineCount,
  layoutAroundObstacles,
  headingFont,
  bodyFont,
  italicFont,
  type FontSpec,
} from '@/lib/pretext'

export function usePretextHeight(
  text: string,
  maxWidth: number,
  fontSpec: FontSpec,
): number {
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!text || maxWidth <= 0) {
      setHeight(0)
      return
    }
    const h = measureTextHeight(text, maxWidth, fontSpec.font, fontSpec.lineHeight)
    setHeight(h)
  }, [text, maxWidth, fontSpec.font, fontSpec.lineHeight])

  return height
}

export function usePretextLineCount(
  text: string,
  maxWidth: number,
  font: string,
): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!text || maxWidth <= 0) {
      setCount(0)
      return
    }
    const c = measureLineCount(text, maxWidth, font)
    setCount(c)
  }, [text, maxWidth, font])

  return count
}

export function usePretextLines(
  text: string,
  maxWidth: number,
  fontSpec: FontSpec,
): Array<{ text: string; width: number }> {
  const [lines, setLines] = useState<Array<{ text: string; width: number }>>([])

  useEffect(() => {
    if (!text || maxWidth <= 0) {
      setLines([])
      return
    }
    const result = layoutTextLines(text, maxWidth, fontSpec.font, fontSpec.lineHeight)
    setLines(result.map((l) => ({ text: l.text, width: l.width })))
  }, [text, maxWidth, fontSpec.font, fontSpec.lineHeight])

  return lines
}

export function useFitFontSize(
  text: string,
  containerWidth: number,
  minSize: number,
  maxSize: number,
  fontFamily: string,
): number {
  const [fontSize, setFontSize] = useState(minSize)

  useEffect(() => {
    if (!text || containerWidth <= 0) {
      setFontSize(minSize)
      return
    }
    const size = fitHeadlineFontSize(text, containerWidth, minSize, maxSize, fontFamily)
    setFontSize(size)
  }, [text, containerWidth, minSize, maxSize, fontFamily])

  return fontSize
}

export function useFitFontSizeToLines(
  text: string,
  maxWidth: number,
  maxLines: number,
  minSize: number,
  maxSize: number,
  fontFamily: string,
): number {
  const [fontSize, setFontSize] = useState(minSize)

  useEffect(() => {
    if (!text || maxWidth <= 0) {
      setFontSize(minSize)
      return
    }
    const size = fitFontSizeToLineCount(text, maxWidth, maxLines, minSize, maxSize, fontFamily)
    setFontSize(size)
  }, [text, maxWidth, maxLines, minSize, maxSize, fontFamily])

  return fontSize
}

export function useLayoutAroundObstacles(
  text: string,
  fontSpec: FontSpec,
  containerWidth: number,
  containerHeight: number,
  obstacles: Array<{ x: number; y: number; width: number; height: number }>,
  offsetX: number = 0,
  offsetY: number = 0,
): Array<{ x: number; y: number; text: string; width: number }> {
  const [lines, setLines] = useState<Array<{ x: number; y: number; text: string; width: number }>>([])

  useEffect(() => {
    if (!text || containerWidth <= 0) {
      setLines([])
      return
    }
    const result = layoutAroundObstacles(
      text,
      fontSpec.font,
      fontSpec.lineHeight,
      containerWidth,
      containerHeight,
      obstacles,
      offsetX,
      offsetY,
    )
    setLines(result)
  }, [text, fontSpec.font, fontSpec.lineHeight, containerWidth, containerHeight, obstacles, offsetX, offsetY])

  return lines
}

export function useContainerWidth(ref: React.RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width)
      }
    })

    observer.observe(el)
    setWidth(el.clientWidth)

    return () => observer.disconnect()
  }, [ref])

  return width
}

export function useFontLoaded(): boolean {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    document.fonts.ready.then(() => setLoaded(true))
  }, [])

  return loaded
}
