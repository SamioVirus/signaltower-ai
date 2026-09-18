import { Link, useLocation } from "react-router-dom";

import { NAV_ITEMS } from "@/components/navigation";
import { Page } from "@/components/ui/PageHeader";

export const NotFoundPage = () => {
  const { pathname } = useLocation();

  return (
    <Page>
      <div className="mx-auto max-w-2xl py-12 text-center">
        <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-accent">
          404
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary">
          No such page
        </h1>
        <p className="mt-3 text-sm leading-6 text-secondary">
          Nothing is served at{" "}
          <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-xs text-primary">
            {pathname}
          </code>
          . It may have been a link to an initiative that does not exist in the
          synthetic portfolio.
        </p>

        <ul className="mt-8 grid gap-2 text-left sm:grid-cols-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="flex items-start gap-3 rounded-lg border border-subtle bg-surface p-3 transition hover:border-strong"
              >
                <item.icon
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <span>
                  <span className="block text-sm font-medium text-primary">
                    {item.label}
                  </span>
                  <span className="block text-xs text-muted">
                    {item.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );
};
