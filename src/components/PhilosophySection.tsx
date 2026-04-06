'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import {
  bodyFont,
  headingFont,
  layoutAroundObstacles,
  measureTextHeight,
  fitHeadlineFontSize,
  FONT_HEADING,
} from '@/lib/pretext'
import {
  useContainerWidth,
  useFontLoaded,
} from '@/hooks/usePretextLayout'

export default function PhilosophySection() {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)
  const containerWidth = useContainerWidth(containerRef)
  const fontLoaded = useFontLoaded()
  const isInView = useInView(containerRef, { once: true, amount: 0.3 })

  const [headingFontSize, setHeadingFontSize] = useState(48)
  const [textLines, setTextLines] = useState<Array<{ x: number; y: number; text: string; width: number }>>([])
  const [textHeight, setTextHeight] = useState(0)

  const computeLayout = useCallback(() => {
    if (!containerWidth || !fontLoaded || !textContainerRef.current) return

    const padding = 32
    const availableWidth = containerWidth - padding * 2
    const isMobile = containerWidth < 768
    const isTablet = containerWidth >= 768 && containerWidth < 1024

    const headingEl = headingRef.current
    if (headingEl) {
      const size = fitHeadlineFontSize(
        `${t.philosophy.title_line1} ${t.philosophy.title_line2}`,
        availableWidth,
        isMobile ? 28 : isTablet ? 36 : 48,
        isMobile ? 48 : isTablet ? 64 : 80,
        FONT_HEADING,
      )
      setHeadingFontSize(size)
    }

    const bodySpec = bodyFont(isMobile ? 16 : 18)
    const lineHeight = bodySpec.lineHeight

    if (isMobile) {
      const lines = layoutAroundObstacles(
        t.philosophy.desc,
        bodySpec.font,
        lineHeight,
        availableWidth,
        2000,
        [],
        padding,
        0,
      )
      setTextLines(lines)
      setTextHeight(lines.length * lineHeight)
    } else {
      const imageWidth = isTablet ? 200 : 280
      const imageHeight = isTablet ? 200 : 280
      const imageX = availableWidth - imageWidth + padding
      const imageY = 40

      const obstacles = [
        { x: imageX, y: imageY, width: imageWidth, height: imageHeight },
      ]

      const lines = layoutAroundObstacles(
        t.philosophy.desc,
        bodySpec.font,
        lineHeight,
        availableWidth,
        2000,
        obstacles,
        padding,
        0,
      )
      setTextLines(lines)
      setTextHeight(lines.length * lineHeight)
    }
  }, [containerWidth, fontLoaded, t.philosophy.desc, t.philosophy.title_line1, t.philosophy.title_line2])

  useEffect(() => {
    computeLayout()
  }, [computeLayout])

  useEffect(() => {
    if (isInView) computeLayout()
  }, [isInView, computeLayout])

  return (
    <section ref={containerRef} className="min-h-screen flex items-center justify-center bg-obsidian text-white relative z-10 px-4 py-20">
      <div className="max-w-5xl w-full">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-gold-light tracking-[0.3em] uppercase text-xs mb-8 text-center"
        >
          {t.philosophy.label}
        </motion.p>

        <motion.h2
          ref={headingRef}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-8 leading-tight text-center"
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: `${headingFontSize}px`,
          }}
        >
          {t.philosophy.title_line1}
          <br />
          <span className="italic text-gold-light">{t.philosophy.title_line2}</span>
        </motion.h2>

        <div
          ref={textContainerRef}
          className="relative"
          style={{ minHeight: `${textHeight || 120}px` }}
        >
          {containerWidth >= 768 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="absolute right-0 top-10 w-64 h-64 md:w-72 md:h-72 rounded-sm overflow-hidden border border-white/5"
              style={{ zIndex: 1 }}
            >
              <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold-dark/10 flex items-center justify-center">
                <span className="text-6xl md:text-8xl opacity-30">💎</span>
              </div>
            </motion.div>
          )}

          {textLines.map((line, index) => (
            <motion.span
              key={`${line.x}-${line.y}-${index}`}
              initial={{ opacity: 0, x: line.x < containerWidth / 2 ? -20 : 20 }}
              animate={isInView ? { opacity: 1, x: line.x } : {}}
              transition={{ duration: 0.5, delay: Math.min(index * 0.02, 0.5) }}
              className="absolute whitespace-pre-wrap"
              style={{
                left: `${line.x}px`,
                top: `${line.y}px`,
                fontFamily: 'var(--font-inter)',
                fontSize: containerWidth < 768 ? '16px' : '18px',
                lineHeight: `${bodyFont(containerWidth < 768 ? 16 : 18).lineHeight}px`,
                color: 'rgb(156, 163, 175)',
                maxWidth: `${line.width}px`,
              }}
            >
              {line.text}
            </motion.span>
          ))}

          {containerWidth < 768 && textLines.length === 0 && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-gray-400 font-sans text-lg leading-relaxed text-center max-w-3xl mx-auto"
            >
              {t.philosophy.desc}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  )
}
