// Copyright (c) 2026 zoop. See LICENSE.

let canvas, ctx, particles = [], splashes = [], mode = 'cloudy', w = 0, h = 0

export function initBackground() {
  canvas = document.createElement('canvas')
  canvas.className = 'bg-canvas'
  document.body.prepend(canvas)
  ctx = canvas.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
  loop()
}

function resize() {
  w = canvas.width = window.innerWidth
  h = canvas.height = window.innerHeight
  buildParticles()
}

const COUNTS = {
  rain: 130,
  drizzle: 70,
  snow: 100,
  storm: 90,
  cloudy: 8,
  fog: 5,
  'partly-day': 6,
  'partly-night': 6,
  'clear-day': 0,
  'clear-night': 90,
}

function buildParticles() {
  const count = COUNTS[mode] ?? 0
  particles = []
  splashes = []
  const isCloud = mode === 'cloudy' || mode.startsWith('partly')
  const isFog = mode === 'fog'
  const isSnow = mode === 'snow'
  const isStorm = mode === 'storm'
  const isStars = mode === 'clear-night'

  for (let i = 0; i < count; i++) {
    if (isStars) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.7,
        r: 0.6 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 1.2,
      })
    } else if (isCloud) {
      const layer = i % 3
      particles.push({
        x: Math.random() * w,
        y: h * 0.05 + Math.random() * h * 0.4,
        r: (40 + layer * 35) + Math.random() * 90,
        speed: (3 + layer * 5) + Math.random() * 6,
        opacity: (0.04 + layer * 0.02) + Math.random() * 0.05,
        layer,
      })
    } else if (isFog) {
      particles.push({
        x: Math.random() * w,
        y: h * 0.3 + Math.random() * h * 0.6,
        r: 100 + Math.random() * 180,
        speed: 4 + Math.random() * 8,
        opacity: 0.05 + Math.random() * 0.06,
      })
    } else if (isSnow) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.5 + Math.random() * 2.5,
        speed: 20 + Math.random() * 40,
        drift: (Math.random() - 0.5) * 30,
        phase: Math.random() * Math.PI * 2,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 2,
      })
    } else {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        len: isStorm ? 18 + Math.random() * 14 : 10 + Math.random() * 10,
        speed: (isStorm ? 700 : 450) + Math.random() * 300,
        opacity: 0.25 + Math.random() * 0.35,
      })
    }
  }
}

let lastT = performance.now()
let lightning = 0
let sunAngle = 0
let moonGlowPhase = 0

function loop() {
  const now = performance.now()
  const dt = Math.min((now - lastT) / 1000, 0.05)
  lastT = now
  draw(dt)
  requestAnimationFrame(loop)
}

function draw(dt) {
  ctx.clearRect(0, 0, w, h)
  const isCloud = mode === 'cloudy' || mode.startsWith('partly')
  const isFog = mode === 'fog'
  const isSnow = mode === 'snow'
  const isStorm = mode === 'storm'
  const isRain = mode === 'rain' || mode === 'drizzle' || isStorm
  const isStars = mode === 'clear-night'
  const isSun = mode === 'clear-day'

  if (isSun) {
    const cx = w * 0.78
    const cy = h * 0.16
    const radius = Math.min(w, h) * 0.22
    sunAngle += dt * 0.05
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
    glow.addColorStop(0, 'rgba(255, 230, 160, 0.35)')
    glow.addColorStop(1, 'rgba(255, 230, 160, 0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(255, 240, 200, 0.25)'
    ctx.lineWidth = 2
    for (let i = 0; i < 10; i++) {
      const a = sunAngle + (i / 10) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * radius * 0.55, cy + Math.sin(a) * radius * 0.55)
      ctx.lineTo(cx + Math.cos(a) * radius * 0.85, cy + Math.sin(a) * radius * 0.85)
      ctx.stroke()
    }
  } else if (isStars) {
    moonGlowPhase += dt * 0.3
    const mx = w * 0.22
    const my = h * 0.14
    const mr = Math.min(w, h) * 0.07
    const moonGlow = ctx.createRadialGradient(mx, my, 0, mx, my, mr * 3)
    moonGlow.addColorStop(0, 'rgba(220, 225, 255, 0.18)')
    moonGlow.addColorStop(1, 'rgba(220, 225, 255, 0)')
    ctx.fillStyle = moonGlow
    ctx.beginPath()
    ctx.arc(mx, my, mr * 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalAlpha = 0.9 + Math.sin(moonGlowPhase) * 0.05
    ctx.fillStyle = '#e8ecff'
    ctx.beginPath()
    ctx.arc(mx, my, mr, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.globalAlpha = 1
    ctx.beginPath()
    ctx.arc(mx + mr * 0.45, my - mr * 0.15, mr * 0.85, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'

    ctx.fillStyle = '#ffffff'
    for (const p of particles) {
      p.phase += dt * p.speed
      ctx.globalAlpha = 0.4 + Math.sin(p.phase) * 0.35
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  } else if (isCloud || isFog) {
    ctx.fillStyle = '#ffffff'
    for (const p of particles) {
      p.x += p.speed * dt
      if (p.x - p.r > w) p.x = -p.r
      ctx.globalAlpha = p.opacity
      ctx.beginPath()
      ctx.ellipse(p.x, p.y, p.r, p.r * (isFog ? 0.32 : 0.45), 0, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  } else if (isSnow) {
    ctx.fillStyle = '#ffffff'
    for (const p of particles) {
      p.y += p.speed * dt
      p.phase += dt
      p.spin += p.spinSpeed * dt
      if (p.y > h) {
        p.y = -10
        p.x = Math.random() * w
      }
      const dx = Math.sin(p.phase) * p.drift
      ctx.globalAlpha = 0.7
      ctx.save()
      ctx.translate(p.x + dx, p.y)
      ctx.rotate(p.spin)
      ctx.beginPath()
      ctx.arc(0, 0, p.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
    ctx.globalAlpha = 1
  } else if (isRain) {
    ctx.strokeStyle = '#bcdcff'
    ctx.lineCap = 'round'
    for (const p of particles) {
      p.y += p.speed * dt
      if (p.y > h) {
        p.y = -p.len
        p.x = Math.random() * w
        if (Math.random() < 0.5) {
          splashes.push({ x: p.x, y: h - 4, r: 1, opacity: 0.5 })
        }
      }
      ctx.globalAlpha = p.opacity
      ctx.lineWidth = isStorm ? 2 : 1.4
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x - (isStorm ? 6 : 3), p.y + p.len)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    ctx.strokeStyle = '#cfe8ff'
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i]
      s.r += dt * 40
      s.opacity -= dt * 2.2
      if (s.opacity <= 0) {
        splashes.splice(i, 1)
        continue
      }
      ctx.globalAlpha = s.opacity
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.ellipse(s.x, s.y, s.r, s.r * 0.35, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    if (isStorm) {
      lightning -= dt
      if (lightning <= 0 && Math.random() < 0.004) {
        lightning = 0.12
      }
      if (lightning > 0) {
        ctx.globalAlpha = Math.min(lightning * 2, 0.35)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
        ctx.globalAlpha = 1
      }
    }
  }
}

export function setBackgroundCondition(iconKey) {
  let key = iconKey
  if (COUNTS[key] === undefined) key = 'cloudy'
  if (key === mode) return
  mode = key
  if (canvas) buildParticles()
}
