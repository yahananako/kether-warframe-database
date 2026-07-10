import { fetchSheetRows } from "../../../lib/sheets";
import DatabaseOverviewPage from "../../../components/DatabaseOverviewPage";
import HomeMenuFloating from "../../../components/HomeMenuFloating";

export default async function OverviewPage() {
  const { config, rows, error } = await fetchSheetRows("overview");

  return (
    <main className="min-h-screen bg-[#f6f3ff] text-slate-950">
      <HomeMenuFloating />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DatabaseOverviewPage
          rows={rows}
          title={config.title}
          subtitle={config.subtitle}
          error={error}
        />
      </div>
    </main>
  );
}
