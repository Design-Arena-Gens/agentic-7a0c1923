'use client'

import { useEffect, useRef, useState } from 'react'

interface Star {
  x: number
  y: number
  z: number
  size: number
  color: string
  speed: number
  angle: number
  radius: number
  baseRadius: number
}

export default function Galaxy() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isMouseDown, setIsMouseDown] = useState(false)
  const starsRef = useRef<Star[]>([])
  const animationRef = useRef<number>()
  const rotationRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize stars
    const numStars = 3000
    const stars: Star[] = []
    const colors = ['#ffffff', '#ffe4b5', '#ffd700', '#87ceeb', '#ff69b4', '#9370db']

    for (let i = 0; i < numStars; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 300 + 50
      const armOffset = Math.floor(Math.random() * 5)
      const armAngle = angle + (armOffset * Math.PI * 2) / 5

      stars.push({
        x: 0,
        y: 0,
        z: Math.random() * 1000 - 500,
        size: Math.random() * 2 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 0.0005 + 0.0002,
        angle: armAngle,
        radius: radius,
        baseRadius: radius
      })
    }
    starsRef.current = stars

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Update and draw stars
      stars.forEach(star => {
        // Rotate in galaxy spiral
        star.angle += star.speed

        // Add some wobble to radius
        const wobble = Math.sin(star.angle * 3) * 10
        star.radius = star.baseRadius + wobble

        // Calculate 3D position
        const x = Math.cos(star.angle) * star.radius
        const y = Math.sin(star.angle) * star.radius
        const z = star.z + Math.sin(star.angle * 2) * 50

        // Apply rotation based on mouse
        const rotX = rotationRef.current.x
        const rotY = rotationRef.current.y

        // Rotate around Y axis
        const cosY = Math.cos(rotY)
        const sinY = Math.sin(rotY)
        const x1 = x * cosY - z * sinY
        const z1 = x * sinY + z * cosY

        // Rotate around X axis
        const cosX = Math.cos(rotX)
        const sinX = Math.sin(rotX)
        const y1 = y * cosX - z1 * sinX
        const z2 = y * sinX + z1 * cosX

        // Perspective projection
        const scale = 500 / (500 + z2)
        const projX = x1 * scale + centerX
        const projY = y1 * scale + centerY

        // Draw star
        if (z2 > -500 && scale > 0) {
          const size = star.size * scale
          const opacity = Math.min(1, scale)

          ctx.beginPath()
          ctx.arc(projX, projY, size, 0, Math.PI * 2)
          ctx.fillStyle = star.color + Math.floor(opacity * 255).toString(16).padStart(2, '0')
          ctx.fill()

          // Add glow for larger stars
          if (size > 1) {
            ctx.beginPath()
            const gradient = ctx.createRadialGradient(projX, projY, 0, projX, projY, size * 3)
            gradient.addColorStop(0, star.color + '40')
            gradient.addColorStop(1, star.color + '00')
            ctx.fillStyle = gradient
            ctx.arc(projX, projY, size * 3, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      })

      // Draw central glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
      gradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.1)')
      gradient.addColorStop(1, 'rgba(138, 43, 226, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Handle mouse interaction
  useEffect(() => {
    if (isMouseDown) {
      rotationRef.current.x = (mousePos.y - window.innerHeight / 2) * 0.002
      rotationRef.current.y = (mousePos.x - window.innerWidth / 2) * 0.002
    }
  }, [mousePos, isMouseDown])

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseDown = () => {
    setIsMouseDown(true)
  }

  const handleMouseUp = () => {
    setIsMouseDown(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isMouseDown ? 'grabbing' : 'grab' }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: 'white',
          fontFamily: 'monospace',
          fontSize: '14px',
          textShadow: '0 0 10px rgba(0,0,0,0.8)',
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        <div>Interactive Galaxy</div>
        <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
          Click and drag to rotate
        </div>
      </div>
    </div>
  )
}
