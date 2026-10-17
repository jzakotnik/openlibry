/**
 * Fourier epicycles: turns a set of closed contours into a single closed pen
 * path (contours joined by pen-up jumps), runs a plain DFT over it and returns
 * the circles sorted by size. Summing the first M circles at time t ∈ [0,1)
 * gives the pen position; `down[i]` says whether the pen touches the paper at
 * sample i (false while jumping between contours).
 *
 * A plain DFT is plenty for ~2000 samples, so no FFT library is needed.
 */

export interface EpicycleCircle {
  f: number; // signed frequency (rotations per cycle)
  re: number;
  im: number;
  amp: number;
}

export interface EpicycleModel {
  circles: EpicycleCircle[];
  down: boolean[];
  samples: number;
}

/** [x, y, radius] of each circle centre chain; the last entry is the pen tip. */
export type EpicycleChain = Array<[number, number, number]>;

export function buildEpicycles(
  contours: number[][][],
  samples = 2048,
): EpicycleModel {
  // one closed polyline: [x, y, contourId]
  const poly: Array<[number, number, number]> = [];
  contours.forEach((c, id) => {
    c.forEach((p) => poly.push([p[0], p[1], id]));
    poly.push([c[0][0], c[0][1], id]); // close the contour
  });

  const segLen: number[] = [];
  const segDown: boolean[] = [];
  let total = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segLen.push(l);
    segDown.push(a[2] === b[2] && i !== poly.length - 1);
    total += l;
  }

  // resample at equal arc length
  const pts: Array<[number, number]> = [];
  const down: boolean[] = [];
  let seg = 0;
  let acc = 0;
  for (let n = 0; n < samples; n++) {
    const d = (total * n) / samples;
    while (acc + segLen[seg] < d) {
      acc += segLen[seg];
      seg++;
    }
    const a = poly[seg];
    const b = poly[(seg + 1) % poly.length];
    const u = segLen[seg] ? (d - acc) / segLen[seg] : 0;
    pts.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
    down.push(segDown[seg]);
  }

  // DFT with a twiddle table
  const cosT = new Float64Array(samples);
  const sinT = new Float64Array(samples);
  for (let i = 0; i < samples; i++) {
    cosT[i] = Math.cos((-2 * Math.PI * i) / samples);
    sinT[i] = Math.sin((-2 * Math.PI * i) / samples);
  }
  const circles: EpicycleCircle[] = [];
  for (let k = 0; k < samples; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < samples; n++) {
      const w = (k * n) % samples;
      re += pts[n][0] * cosT[w] - pts[n][1] * sinT[w];
      im += pts[n][0] * sinT[w] + pts[n][1] * cosT[w];
    }
    re /= samples;
    im /= samples;
    circles.push({
      f: k < samples / 2 ? k : k - samples,
      re,
      im,
      amp: Math.hypot(re, im),
    });
  }
  circles.sort((a, b) => b.amp - a.amp);

  return { circles, down, samples };
}

/** Centres of the first `m` circles at time t, ending with the pen tip. */
export function epicycleChain(
  model: EpicycleModel,
  t: number,
  m: number,
): EpicycleChain {
  let x = 0;
  let y = 0;
  const chain: EpicycleChain = [[0, 0, 0]];
  const count = Math.min(m, model.circles.length);
  for (let j = 0; j < count; j++) {
    const c = model.circles[j];
    const a = 2 * Math.PI * c.f * t;
    const co = Math.cos(a);
    const si = Math.sin(a);
    x += c.re * co - c.im * si;
    y += c.re * si + c.im * co;
    chain.push([x, y, c.amp]);
  }
  return chain;
}

/** Whether the pen is on the paper at time t. */
export function penDown(model: EpicycleModel, t: number): boolean {
  return model.down[Math.min(model.samples - 1, Math.floor(t * model.samples))];
}
