

function toPercent(points) {
  return points.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(', ')
}

const EPS = 1e-4

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const add = (a, b) => [a[0] + b[0], a[1] + b[1]]
const mul = (a, s) => [a[0] * s, a[1] * s]
const div = (a, s) => [a[0] / s, a[1] / s]
const len = (a) => Math.hypot(a[0], a[1])
const norm = (a) => div(a, len(a))
const dot = (a, b) => a[0] * b[0] + a[1] * b[1]
const rot90 = (a) => [-a[1], a[0]]
const lerp = (a, b, t) => a + (b - a) * t
const lerpPt = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]

function circularArc(c, p0, p1) {
  const d0 = norm(sub(p0, c))
  const d1 = norm(sub(p1, c))
  const r0 = rot90(d0)
  const r1 = rot90(d1)
  const clockwise = dot(r0, sub(p1, c)) >= 0
  const cosa = dot(d0, d1)
  if (cosa > 0.999) return [p0, lerpPt(p0, p1, 1 / 3), lerpPt(p0, p1, 2 / 3), p1]
  const k =
    ((len(sub(p0, c)) * 4) / 3) *
    ((Math.sqrt(2 * (1 - cosa)) - Math.sqrt(1 - cosa * cosa)) / (1 - cosa)) *
    (clockwise ? 1 : -1)
  return [p0, add(p0, mul(r0, k)), sub(p1, mul(r1, k)), p1]
}

function lineIntersection(p0, d0, p1, d1) {
  const rd1 = rot90(d1)
  const den = dot(d0, rd1)
  if (Math.abs(den) < EPS) return null
  const num = dot(sub(p1, p0), rd1)
  if (Math.abs(den) < EPS * Math.abs(num)) return null
  return add(p0, mul(d0, num / den))
}

function flankingCurve(roundCut, smooth, corner, sideStart, circleX, otherCircleX, center, r) {
  const dir = norm(sub(sideStart, corner))
  const curveStart = add(corner, mul(dir, roundCut * (1 + smooth)))
  const p = lerpPt(circleX, lerpPt(circleX, otherCircleX, 0.5), smooth)
  const curveEnd = add(center, mul(norm(sub(p, center)), r))
  const tangent = rot90(sub(curveEnd, center))
  const anchorEnd = lineIntersection(sideStart, dir, curveEnd, tangent) || circleX
  const anchorStart = div(add(curveStart, mul(anchorEnd, 2)), 3)
  return [curveStart, anchorStart, anchorEnd, curveEnd]
}

function corner(p0, p1, p2, radius, smoothing) {
  const v01 = sub(p0, p1)
  const v21 = sub(p2, p1)
  const d01 = len(v01)
  const d21 = len(v21)
  if (d01 < EPS || d21 < EPS) return { expectedRoundCut: 0, expectedCut: 0, getCubics: () => [[p1, p1, p1, p1]] }
  const d1 = div(v01, d01)
  const d2 = div(v21, d21)
  const cosAngle = dot(d1, d2)
  const sinAngle = Math.sqrt(Math.max(0, 1 - cosAngle * cosAngle))
  const expectedRoundCut = sinAngle > 1e-3 ? (radius * (cosAngle + 1)) / sinAngle : 0
  const expectedCut = (1 + smoothing) * expectedRoundCut

  function actualSmoothing(allowedCut) {
    if (allowedCut > expectedCut) return smoothing
    if (allowedCut > expectedRoundCut)
      return (smoothing * (allowedCut - expectedRoundCut)) / (expectedCut - expectedRoundCut)
    return 0
  }

  function getCubics(allowedCut0, allowedCut1 = allowedCut0) {
    const allowedCut = Math.min(allowedCut0, allowedCut1)
    if (expectedRoundCut < EPS || allowedCut < EPS || radius < EPS) return [[p1, p1, p1, p1]]
    const actualRoundCut = Math.min(allowedCut, expectedRoundCut)
    const s0 = actualSmoothing(allowedCut0)
    const s1 = actualSmoothing(allowedCut1)
    const actualR = (radius * actualRoundCut) / expectedRoundCut
    const centerDist = Math.sqrt(actualR * actualR + actualRoundCut * actualRoundCut)
    const center = add(p1, mul(norm(div(add(d1, d2), 2)), centerDist))
    const x0 = add(p1, mul(d1, actualRoundCut))
    const x2 = add(p1, mul(d2, actualRoundCut))
    const flank0 = flankingCurve(actualRoundCut, s0, p1, p0, x0, x2, center, actualR)
    const flank2raw = flankingCurve(actualRoundCut, s1, p1, p2, x2, x0, center, actualR)
    const flank2 = [flank2raw[3], flank2raw[2], flank2raw[1], flank2raw[0]]
    const arc = circularArc(center, flank0[3], flank2[0])
    return [flank0, arc, flank2]
  }

  return { expectedRoundCut, expectedCut, getCubics }
}

function sampleCubic(c, steps, out) {
  for (let s = 1; s <= steps; s++) {
    const t = s / steps
    const mt = 1 - t
    const a = mt * mt * mt
    const b = 3 * mt * mt * t
    const cc = 3 * mt * t * t
    const d = t * t * t
    out.push([
      a * c[0][0] + b * c[1][0] + cc * c[2][0] + d * c[3][0],
      a * c[0][1] + b * c[1][1] + cc * c[2][1] + d * c[3][1],
    ])
  }
}

function roundedPolygonPoints(vertices, radii, smoothings, steps) {
  const n = vertices.length
  const corners = vertices.map((p1, i) =>
    corner(vertices[(i - 1 + n) % n], p1, vertices[(i + 1) % n], radii[i], smoothings[i])
  )
  const cutAdjusts = vertices.map((_, ix) => {
    const next = (ix + 1) % n
    const erc = corners[ix].expectedRoundCut + corners[next].expectedRoundCut
    const ec = corners[ix].expectedCut + corners[next].expectedCut
    const sideSize = len(sub(vertices[ix], vertices[next]))
    if (erc > sideSize) return [sideSize / erc, 0]
    if (ec > sideSize) return [1, (sideSize - erc) / (ec - erc)]
    return [1, 1]
  })
  const points = []
  for (let i = 0; i < n; i++) {
    const allowed = [0, 1].map((delta) => {
      const [roundCutRatio, cutRatio] = cutAdjusts[(i + n - 1 + delta) % n]
      return (
        corners[i].expectedRoundCut * roundCutRatio +
        (corners[i].expectedCut - corners[i].expectedRoundCut) * cutRatio
      )
    })
    const cubics = corners[i].getCubics(allowed[0], allowed[1])
    points.push(cubics[0][0])
    for (const c of cubics) sampleCubic(c, steps, points)
  }
  return points
}

function regularPolygonVertices(sides, r, cx = 50, cy = 50) {
  const vertices = []
  for (let i = 0; i < sides; i++) {
    const angle = (2 * Math.PI * i) / sides - Math.PI / 2
    vertices.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
  }
  return vertices
}

function starVertices(bumps, outerR, innerR, cx = 50, cy = 50) {
  const vertices = []
  for (let i = 0; i < bumps; i++) {
    const outerAngle = (Math.PI * 2 * i) / bumps - Math.PI / 2
    vertices.push([cx + outerR * Math.cos(outerAngle), cy + outerR * Math.sin(outerAngle)])
    const innerAngle = (Math.PI * (2 * i + 1)) / bumps - Math.PI / 2
    vertices.push([cx + innerR * Math.cos(innerAngle), cy + innerR * Math.sin(innerAngle)])
  }
  return vertices
}

export function scallopedClipPath(bumps = 12, outerR = 50, innerR = 42) {
  const vertices = starVertices(bumps, outerR, innerR)
  const radius = outerR * 0.5
  const points = roundedPolygonPoints(
    vertices,
    vertices.map(() => radius),
    vertices.map(() => 0),
    8
  )
  return `polygon(${toPercent(points)})`
}

export function burstClipPath(points = 10, outerR = 50, innerR = 28) {
  const vertices = starVertices(points, outerR, innerR)
  const radius = outerR * 0.045
  const pts = roundedPolygonPoints(
    vertices,
    vertices.map(() => radius),
    vertices.map(() => 0.6),
    6
  )
  return `polygon(${toPercent(pts)})`
}

export function roundedPolygonClipPath(sides = 3, roundAmt = 0.28, r = 44, steps = 6) {
  const vertices = regularPolygonVertices(sides, r)
  const radius = roundAmt * r
  const points = roundedPolygonPoints(
    vertices,
    vertices.map(() => radius),
    vertices.map(() => 0),
    steps
  )
  return `polygon(${toPercent(points)})`
}
