// Buckets posts by the hour they were taken (0-23), so the timeline can show
// one row per hour that actually has something in it.
export function groupPostsByHour(posts) {
  const buckets = new Map();
  for (const post of posts) {
    const hour = new Date(post.taken_at).getHours();
    if (!buckets.has(hour)) buckets.set(hour, []);
    buckets.get(hour).push(post);
  }
  return [...buckets.entries()].sort((a, b) => a[0] - b[0]);
}

export function formatHourLabel(hour) {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", hour12: true });
}

export function todayAsDateInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}
