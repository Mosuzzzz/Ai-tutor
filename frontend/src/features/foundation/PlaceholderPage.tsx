import { Card } from "../../components/ui/Card";
import type { PlaceholderModule } from "./types";

type PlaceholderPageProps = {
  module: PlaceholderModule;
};

export const PlaceholderPage = ({ module }: PlaceholderPageProps) => {
  const Icon = module.icon;

  return (
    <div className="space-y-6">
      <section
        aria-labelledby={`${module.key}-placeholder-title`}
        className="rounded-xl bg-surface-container-low px-6 py-8 md:px-8"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-on-primary">
              <Icon aria-hidden="true" className="h-6 w-6" />
            </div>
            <h2
              className="text-headline-lg-mobile font-bold text-on-surface md:text-headline-lg"
              id={`${module.key}-placeholder-title`}
            >
              {module.title}
            </h2>
            <p className="mt-3 text-body-lg text-on-surface-variant">{module.description}</p>
          </div>
          <div className="rounded-lg bg-surface-container-lowest px-5 py-4 shadow-ambient">
            <p className="text-label-sm uppercase text-on-surface-variant">Foundation status</p>
            <p className="mt-1 text-headline-md font-bold text-primary">{module.statusLabel}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {module.readinessItems.map((item) => (
          <Card key={item} className="min-h-32">
            <p className="text-body-md font-semibold text-on-surface">{item}</p>
            <p className="mt-2 text-body-md text-on-surface-variant">{module.handoffNote}</p>
          </Card>
        ))}
      </section>
    </div>
  );
};
