type CanvasItem = {
    id: number;
    type: "player" | "cone" | "ball";
    x: number;
    y: number;
    label?: string;
  };
  
  type ExerciseCanvasProps = {
    items?: CanvasItem[];
    title?: string;
    selectedItemId?: number | null;
    onSelectItem?: (id: number) => void;
    interactive?: boolean;
  };
  
  export default function ExerciseCanvas({
    items = [],
    title = "Visuell skisse",
    selectedItemId = null,
    onSelectItem,
    interactive = false,
  }: ExerciseCanvasProps) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-black/60">
            {interactive ? "Enkel editor v3" : "Skissevisning"}
          </span>
        </div>
  
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/10 bg-[#dbe7cf]">
          <div className="absolute inset-4 rounded-xl border-2 border-white/80">
            <div className="absolute left-1/2 top-0 h-full w-0 -translate-x-1/2 border-l-2 border-white/80" />
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80" />
            <div className="absolute left-0 top-1/2 h-32 w-16 -translate-y-1/2 border-y-2 border-r-2 border-white/80" />
            <div className="absolute right-0 top-1/2 h-32 w-16 -translate-y-1/2 border-y-2 border-l-2 border-white/80" />
          </div>
  
          {items.map((item) => {
            const isSelected = selectedItemId === item.id;
  
            if (!interactive) {
              return (
                <div
                  key={item.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                  }}
                >
                  {item.type === "player" && (
                    <div className="flex min-w-[36px] items-center justify-center rounded-full border-2 border-black/15 bg-blue-500 px-2 py-1 text-xs font-semibold text-white shadow-sm">
                      {item.label || "P"}
                    </div>
                  )}
  
                  {item.type === "cone" && (
                    <div className="h-4 w-4 rotate-45 rounded-[2px] bg-orange-500 shadow-sm" />
                  )}
  
                  {item.type === "ball" && (
                    <div className="h-4 w-4 rounded-full border border-black/20 bg-white shadow-sm" />
                  )}
                </div>
              );
            }
  
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem?.(item.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                }}
              >
                {item.type === "player" && (
                  <div
                    className={`flex min-w-[36px] items-center justify-center rounded-full border-2 px-2 py-1 text-xs font-semibold text-white shadow-sm transition ${
                      isSelected
                        ? "border-black bg-blue-700 ring-4 ring-blue-200"
                        : "border-black/15 bg-blue-500"
                    }`}
                  >
                    {item.label || "P"}
                  </div>
                )}
  
                {item.type === "cone" && (
                  <div
                    className={`h-4 w-4 rotate-45 rounded-[2px] shadow-sm transition ${
                      isSelected
                        ? "bg-orange-600 ring-4 ring-orange-200"
                        : "bg-orange-500"
                    }`}
                  />
                )}
  
                {item.type === "ball" && (
                  <div
                    className={`h-4 w-4 rounded-full border shadow-sm transition ${
                      isSelected
                        ? "border-black bg-black ring-4 ring-black/10"
                        : "border-black/20 bg-white"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
  
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-black/60">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
            Spillere: {items.filter((item) => item.type === "player").length}
          </span>
          <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">
            Kjegler: {items.filter((item) => item.type === "cone").length}
          </span>
          <span className="rounded-full bg-black/5 px-3 py-1 text-black/70">
            Baller: {items.filter((item) => item.type === "ball").length}
          </span>
        </div>
      </div>
    );
  }