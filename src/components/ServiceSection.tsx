'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import {
  bodyFont,
  layoutAroundObstacles,
  fitHeadlineFontSize,
  FONT_HEADING,
} from '@/lib/pretext'
import {
  useContainerWidth,
  useFontLoaded,
} from '@/hooks/usePretextLayout'

interface ServiceSectionProps {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  imageQuote: string
  imageSub: string
  emoji: string
  reverse?: boolean
}

export default function ServiceSection({
  title,
  description,
  imageSrc,
  imageAlt,
  imageQuote,
  imageSub,
  emoji,
  reverse = false,
}: ServiceSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const containerWidth = useContainerWidth(containerRef)
  const fontLoaded = useFontLoaded()
  const isInView = useInView(containerRef, { once: true, amount: 0.2 })

  const [titleFontSize, setTitleFontSize] = useState(40)
  const [textLines, setTextLines] = useState<Array<{ x: number; y: number; text: string; width: number }>>([])
  const [textHeight, setTextHeight] = useState(0)

  const isMobile = containerWidth < 768
  const isTablet = containerWidth >= 768 && containerWidth < 1024

  const computeLayout = useCallback(() => {
    if (!containerWidth || !fontLoaded) return

    const padding = 32
    const availableWidth = containerWidth - padding * 2

    const titleSize = fitHeadlineFontSize(
      title,
      isMobile ? availableWidth : availableWidth * 0.45,
      isMobile ? 28 : isTablet ? 32 : 36,
      isMobile ? 40 : isTablet ? 48 : 56,
      FONT_HEADING,
    )
    setTitleFontSize(titleSize)

    if (isMobile) {
      const bodySpec = bodyFont(16)
      const lines = layoutAroundObstacles(
        description,
        bodySpec.font,
        bodySpec.lineHeight,
        availableWidth,
        2000,
        [],
        padding,
        0,
      )
      setTextLines(lines)
      setTextHeight(lines.length * bodySpec.lineHeight)
    } else {
      const bodySpec = bodyFont(17)
      const textWidth = availableWidth * 0.45
      const imageWidth = availableWidth * 0.45
      const imageHeight = Math.min(imageWidth, 400)
      const imageX = reverse
        ? padding
        : availableWidth - imageWidth + padding
      const imageY = 60

      const obstacles = [
        { x: imageX, y: imageY, width: imageWidth, height: imageHeight },
      ]

      const lines = layoutAroundObstacles(
        description,
        bodySpec.font,
        bodySpec.lineHeight,
        availableWidth,
        2000,
        obstacles,
        padding,
        0,
      )
      setTextLines(lines)
      setTextHeight(lines.length * bodySpec.lineHeight)
    }
  }, [containerWidth, fontLoaded, title, description, isMobile, isTablet, reverse])

  useEffect(() => {
    computeLayout()
  }, [computeLayout])

  return (
    <section
      ref={containerRef}
      className="min-h-screen flex items-center bg-obsidian text-white relative z-10 px-4 py-16"
    >
      <div className="max-w-7xl mx-auto w-full">
        {isMobile ? (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="text-gold-light text-8xl font-serif opacity-20 mb-4">{emoji}</div>
              <h3
                className="mb-6"
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: `${titleFontSize}px`,
                }}
              >
                {title}
              </h3>
              <p className="text-gray-400 font-sans text-lg leading-relaxed mb-8">
                {description}
              </p>
              <div className="h-px w-24 bg-gradient-to-r from-gold to-transparent" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square relative overflow-hidden rounded-sm border border-white/5 group">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 to-transparent flex items-end justify-center pb-8">
                  <div className="text-center">
                    <p className="text-gold-light font-serif text-2xl italic mb-2">{imageQuote}</p>
                    <p className="text-gray-300 text-xs uppercase tracking-widest">{imageSub}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${reverse ? 'lg:grid-flow-dense' : ''}`}>
            <motion.div
              initial={{ opacity: 0, x: reverse ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className={reverse ? 'order-2' : ''}
            >
              <div className="text-gold-light text-8xl font-serif opacity-20 mb-4">{emoji}</div>
              <h3
                className="mb-6"
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: `${titleFontSize}px`,
                }}
              >
                {title}
              </h3>
              <div className="relative" style={{ minHeight: `${textHeight || 100}px` }}>
                {textLines.map((line, index) => (
                  <motion.span
                    key={`${line.x}-${line.y}-${index}`}
                    initial={{ opacity: 0, x: line.x < containerWidth / 2 ? -15 : 15 }}
                    animate={isInView ? { opacity: 1, x: line.x } : {}}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.015, 0.4) }}
                    className="absolute whitespace-pre-wrap"
                    style={{
                      left: `${line.x}px`,
                      top: `${line.y}px`,
                      fontFamily: 'var(--font-inter)',
                      fontSize: '17px',
                      lineHeight: `${bodyFont(17).lineHeight}px`,
                      color: 'rgb(156, 163, 175)',
                    }}
                  >
                    {line.text}
                  </motion.span>
                ))}
              </div>
              <div className="h-px w-24 bg-gradient-to-r from-gold to-transparent mt-8" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: reverse ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className={`relative ${reverse ? 'order-1' : ''}`}
            >
              <div className="aspect-square relative overflow-hidden rounded-sm border border-white/5 group">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 to-transparent flex items-end justify-center pb-8">
                  <div className="text-center">
                    <p className="text-gold-light font-serif text-2xl italic mb-2">{imageQuote}</p>
                    <p className="text-gray-300 text-xs uppercase tracking-widest">{imageSub}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  )
}
