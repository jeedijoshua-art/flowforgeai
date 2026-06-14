import { useEffect, useRef } from 'react'
import type { FC } from 'react'

interface LPCanvasBackgroundProps {
  theme: 'dark' | 'light' | 'system'
}

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  baseX: number
  baseY: number
  baseZ: number
  color: string
  projX: number
  projY: number
  projSize: number
  alpha: number
}

export const LPCanvasBackground: FC<LPCanvasBackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000, active: false })
  const rotRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    // Handle Resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Detect light or dark mode
    const isDarkTheme = () => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      return theme === 'dark'
    }

    // Initialize Particles in a 3D Sphere/Box structure
    const particleCount = 120
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      // Uniform distribution in 3D box
      const x = (Math.random() - 0.5) * 500
      const y = (Math.random() - 0.5) * 500
      const z = (Math.random() - 0.5) * 500

      // Theme-appropriate colors
      const isDark = isDarkTheme()
      const color = isDark
        ? Math.random() > 0.4
          ? 'rgba(168, 85, 247, 1)'  // Purple / Violet
          : 'rgba(34, 197, 94, 1)'   // Emerald Green
        : Math.random() > 0.4
          ? 'rgba(99, 102, 241, 1)'  // Indigo
          : 'rgba(124, 58, 237, 1)'  // Violet

      particles.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        vz: (Math.random() - 0.5) * 0.8,
        baseX: x,
        baseY: y,
        baseZ: z,
        color,
        projX: 0,
        projY: 0,
        projSize: 0,
        alpha: 0
      })
    }
    particlesRef.current = particles

    // Mouse Tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      mouseRef.current.active = true
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }

    // Click Impulse / Explosion
    const handleMouseClick = (e: MouseEvent) => {
      const clickX = e.clientX
      const clickY = e.clientY
      const impulseStrength = 18

      particlesRef.current.forEach((p) => {
        const dx = p.projX - clickX
        const dy = p.projY - clickY
        const d2d = Math.hypot(dx, dy)

        if (d2d < 300) {
          const factor = (300 - d2d) / 300
          // Push velocities in 3D
          p.vx += (dx / (d2d || 1)) * impulseStrength * factor * (1 + Math.random() * 0.5)
          p.vy += (dy / (d2d || 1)) * impulseStrength * factor * (1 + Math.random() * 0.5)
          p.vz += (Math.random() - 0.5) * impulseStrength * factor
        }
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('click', handleMouseClick)

    // Rotation & Render Loop
    const focalLength = 380
    let time = 0

    const render = () => {
      time += 0.002
      ctx.clearRect(0, 0, width, height)

      const isDark = isDarkTheme()
      const centerX = width / 2
      const centerY = height / 2

      // Calculate Target Rotations (Parallax + Auto Rotation)
      let targetRotX = Math.sin(time * 0.5) * 0.15
      let targetRotY = time * 0.3

      if (mouseRef.current.active) {
        // Subtle offset based on mouse position
        const offsetX = (mouseRef.current.y / height - 0.5) * 0.4
        const offsetY = (mouseRef.current.x / width - 0.5) * 0.4
        targetRotX += offsetX
        targetRotY += offsetY
      }

      // Smooth interpolation for camera orientation
      rotRef.current.x += (targetRotX - rotRef.current.x) * 0.05
      rotRef.current.y += (targetRotY - rotRef.current.y) * 0.05

      const cosX = Math.cos(rotRef.current.x)
      const sinX = Math.sin(rotRef.current.x)
      const cosY = Math.cos(rotRef.current.y)
      const sinY = Math.sin(rotRef.current.y)

      // 1. Update positions & project to 2D
      particles.forEach((p) => {
        // Constant organic movement velocity
        p.x += p.vx
        p.y += p.vy
        p.z += p.vz

        // Drag/friction to decelerate click explosions back to base speed
        p.vx += ( (Math.random() - 0.5) * 0.1 - p.vx ) * 0.03
        p.vy += ( (Math.random() - 0.5) * 0.1 - p.vy ) * 0.03
        p.vz += ( (Math.random() - 0.5) * 0.1 - p.vz ) * 0.03

        // Keep inside 3D boundaries (wrap smoothly)
        const boxSize = 250
        if (p.x > boxSize) p.x = -boxSize
        if (p.x < -boxSize) p.x = boxSize
        if (p.y > boxSize) p.y = -boxSize
        if (p.y < -boxSize) p.y = boxSize
        if (p.z > boxSize) p.z = -boxSize
        if (p.z < -boxSize) p.z = boxSize

        // 3D Rotations
        // Rotate Y
        const x1 = p.x * cosY - p.z * sinY
        const z1 = p.x * sinY + p.z * cosY

        // Rotate X
        const y2 = p.y * cosX - z1 * sinX
        const z2 = p.y * sinX + z1 * cosX

        // Projected Z (perspective offset)
        const depth = z2 + 400

        if (depth > 0) {
          p.projX = centerX + (x1 * focalLength) / depth
          p.projY = centerY + (y2 * focalLength) / depth
          p.projSize = Math.max(0.5, (focalLength / depth) * 1.8)
          // Opacity based on depth
          p.alpha = Math.min(1, Math.max(0.08, 1 - (depth - 150) / 500))
        } else {
          p.projX = -9999
          p.projY = -9999
        }

        // 2. Interactive fluid push away from mouse
        if (mouseRef.current.active && depth > 0) {
          const dx = p.projX - mouseRef.current.x
          const dy = p.projY - mouseRef.current.y
          const d2d = Math.hypot(dx, dy)

          if (d2d < 180) {
            const pushForce = (180 - d2d) * 0.04
            p.vx += (dx / (d2d || 1)) * pushForce * 0.03
            p.vy += (dy / (d2d || 1)) * pushForce * 0.03
          }
        }
      })

      // 2. Draw connections (lines) between close particles
      const isLowSpec = width < 768
      const maxDistance = isLowSpec ? 65 : 85

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        if (p1.projX < 0 || p1.projX > width || p1.projY < 0 || p1.projY > height) continue

        // Connect to nearest neighbor particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          if (p2.projX < 0 || p2.projX > width || p2.projY < 0 || p2.projY > height) continue

          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z)
          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.22 * Math.min(p1.alpha, p2.alpha)
            ctx.beginPath()
            ctx.strokeStyle = isDark
              ? `rgba(168, 85, 247, ${lineAlpha})` // Violet glow
              : `rgba(99, 102, 241, ${lineAlpha})` // Indigo glow
            ctx.lineWidth = 0.5
            ctx.moveTo(p1.projX, p1.projY)
            ctx.lineTo(p2.projX, p2.projY)
            ctx.stroke()
          }
        }

        // Draw connections to mouse cursor
        if (mouseRef.current.active) {
          const mDist = Math.hypot(p1.projX - mouseRef.current.x, p1.projY - mouseRef.current.y)
          if (mDist < 120) {
            const mouseLineAlpha = (1 - mDist / 120) * 0.28 * p1.alpha
            ctx.beginPath()
            ctx.strokeStyle = isDark
              ? `rgba(34, 197, 94, ${mouseLineAlpha})` // Green interactive connection
              : `rgba(124, 58, 237, ${mouseLineAlpha})` // Violet interactive connection
            ctx.lineWidth = 0.75
            ctx.moveTo(p1.projX, p1.projY)
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y)
            ctx.stroke()
          }
        }
      }

      // 3. Draw particles
      particles.forEach((p) => {
        if (p.projX < 0 || p.projX > width || p.projY < 0 || p.projY > height) return

        ctx.beginPath()
        ctx.arc(p.projX, p.projY, p.projSize, 0, Math.PI * 2)

        // Modify color base opacity
        const colorWithAlpha = p.color.replace('1)', `${p.alpha})`)
        ctx.fillStyle = colorWithAlpha
        ctx.shadowBlur = isDark ? p.projSize * 2 : 0
        ctx.shadowColor = p.color
        ctx.fill()
        ctx.shadowBlur = 0 // reset shadow
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('click', handleMouseClick)
      cancelAnimationFrame(animationFrameId)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block'
      }}
    />
  )
}
