const ecosystem = [
  "Next.js",
  "React",
  "Astro",
  "Solid",
  "Hono",
  "Elysia",
  "tRPC",
  "oRPC",
  "Drizzle",
  "Prisma",
  "Convex",
  "Better Auth",
] as const;

export default function SponsorsSection() {
  return (
    <section aria-labelledby="ecosystem-title" className="border-rule border-b">
      <div className="grid lg:grid-cols-12">
        <div className="border-rule p-5 sm:p-8 lg:col-span-4 lg:border-r lg:p-10">
          <p className="ui-kicker text-primary">Ecosystem / Bring your preferences</p>
          <h2 id="ecosystem-title" className="mt-4 text-3xl font-semibold tracking-tight">
            One generator.
            <br />
            Real choices.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:col-span-8 lg:grid-cols-4">
          {ecosystem.map((item, index) => (
            <div
              key={item}
              className="flex min-h-24 items-center justify-between border-rule p-5 not-last:border-b sm:border-r sm:[&:nth-last-child(-n+2)]:border-b-0 md:[&:nth-child(2n)]:border-r md:[&:nth-child(3n)]:border-r-0 md:[&:nth-last-child(-n+3)]:border-b-0 lg:[&:nth-child(3n)]:border-r lg:[&:nth-child(4n)]:border-r-0 lg:[&:nth-last-child(-n+4)]:border-b-0"
            >
              <span className="font-semibold">{item}</span>
              <span className="ui-kicker text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
