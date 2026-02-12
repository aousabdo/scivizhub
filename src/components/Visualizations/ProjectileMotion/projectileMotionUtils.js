export const DEFAULT_PROJECTILE_PARAMS = {
  launchSpeed: 35,
  launchAngleDeg: 45,
  gravity: 9.81,
  initialHeight: 0,
  dragCoefficient: 0.06,
  windSpeed: 0,
};

export const roundTo = (value, decimals = 3) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const interpolateImpactPoint = (previous, next) => {
  if (previous.y <= 0) return previous;
  if (next.y >= 0) return next;

  const ratio = previous.y / (previous.y - next.y);
  return {
    t: previous.t + ratio * (next.t - previous.t),
    x: previous.x + ratio * (next.x - previous.x),
    y: 0,
    vx: previous.vx + ratio * (next.vx - previous.vx),
    vy: previous.vy + ratio * (next.vy - previous.vy),
    speed: previous.speed + ratio * (next.speed - previous.speed),
  };
};

export const simulateProjectile = ({
  launchSpeed,
  launchAngleDeg,
  gravity,
  initialHeight,
  dragCoefficient,
  windSpeed,
  dt = 0.02,
  maxTime = 60,
}) => {
  const safeGravity = Math.max(0.001, gravity);
  const safeDt = Math.max(0.001, dt);
  const maxSteps = Math.ceil(maxTime / safeDt);

  const angle = toRadians(launchAngleDeg);
  let vx = launchSpeed * Math.cos(angle);
  let vy = launchSpeed * Math.sin(angle);
  let x = 0;
  let y = initialHeight;
  let t = 0;

  const points = [];
  let impactDetected = false;

  for (let step = 0; step <= maxSteps; step += 1) {
    const currentSpeed = Math.hypot(vx, vy);
    const currentPoint = { t, x, y, vx, vy, speed: currentSpeed };
    points.push(currentPoint);

    if (step > 0 && y <= 0) {
      impactDetected = true;
      break;
    }

    const relativeVx = vx - windSpeed;
    const relativeVy = vy;

    const ax = -dragCoefficient * relativeVx;
    const ay = -safeGravity - dragCoefficient * relativeVy;

    const nextVx = vx + ax * safeDt;
    const nextVy = vy + ay * safeDt;
    const nextX = x + nextVx * safeDt;
    const nextY = y + nextVy * safeDt;
    const nextT = t + safeDt;

    if (nextY < 0) {
      const impactPoint = interpolateImpactPoint(currentPoint, {
        t: nextT,
        x: nextX,
        y: nextY,
        vx: nextVx,
        vy: nextVy,
        speed: Math.hypot(nextVx, nextVy),
      });
      points.push(impactPoint);
      impactDetected = true;
      break;
    }

    vx = nextVx;
    vy = nextVy;
    x = nextX;
    y = nextY;
    t = nextT;
  }

  const lastPoint = points[points.length - 1];
  const maxHeight = points.reduce((maxY, point) => Math.max(maxY, point.y), -Infinity);

  return {
    points,
    impactDetected,
    metrics: {
      timeOfFlight: lastPoint.t,
      range: lastPoint.x,
      maxHeight,
      impactSpeed: Math.hypot(lastPoint.vx, lastPoint.vy),
    },
  };
};

export const solveNoDragMetrics = ({ launchSpeed, launchAngleDeg, gravity, initialHeight }) => {
  const safeGravity = Math.max(0.001, gravity);
  const angle = toRadians(launchAngleDeg);
  const vx = launchSpeed * Math.cos(angle);
  const vy = launchSpeed * Math.sin(angle);
  const discriminant = vy * vy + 2 * safeGravity * initialHeight;

  if (discriminant < 0) {
    return null;
  }

  const timeOfFlight = (vy + Math.sqrt(discriminant)) / safeGravity;
  const range = vx * timeOfFlight;
  const maxHeight = initialHeight + (vy > 0 ? (vy * vy) / (2 * safeGravity) : 0);
  const impactVy = vy - safeGravity * timeOfFlight;
  const impactSpeed = Math.hypot(vx, impactVy);

  return {
    timeOfFlight,
    range,
    maxHeight,
    impactSpeed,
  };
};

export const buildSvgPath = (points, xToPx, yToPx) => {
  if (!points.length) return '';
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xToPx(point.x)} ${yToPx(point.y)}`)
    .join(' ');
};
