export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse space-y-6">
        {/* ヒーロー */}
        <div className="h-32 bg-bg-card rounded-card_lg" />
        {/* カードグリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-bg-card rounded-card" />
          ))}
        </div>
        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-bg-card rounded-card" />
          <div className="h-64 bg-bg-card rounded-card" />
        </div>
      </div>
    </div>
  );
}
