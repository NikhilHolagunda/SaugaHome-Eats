// OrderStatusTimeline.jsx — US-11: visual progress tracker for an order.
// Shows Placed -> Accepted -> Preparing -> Out for Delivery -> Delivered.
// If the order was Declined, shows a distinct terminal state instead of the timeline.

const STAGES = ['Placed', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];

export default function OrderStatusTimeline({ status }) {
  if (status === 'Declined') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
        <p className="text-red-700 font-semibold">This order was declined by the seller.</p>
      </div>
    );
  }

  const currentIndex = STAGES.indexOf(status);
  const isFinalStage = currentIndex === STAGES.length - 1; // true once status === 'Delivered'

  return (
    <div className="w-full">
      {/* Desktop: horizontal timeline */}
      <div className="hidden md:flex items-center">
        {STAGES.map((stage, i) => {
          // A stage is "done" if it's before the current one, OR it IS the
          // current one but there's no next stage to move to (Delivered has
          // no "in progress" state — reaching it means it's complete).
          const done = i < currentIndex || (i === currentIndex && isFinalStage);
          const current = i === currentIndex && !isFinalStage;
          const upcoming = i > currentIndex;
          return (
            <div key={stage} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={[
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0',
                    done && 'bg-coral border-coral text-white',
                    current && 'bg-white border-coral text-coral',
                    upcoming && 'bg-white border-border text-text-muted',
                  ].filter(Boolean).join(' ')}
                >
                  {done ? '✓' : i + 1}
                </div>
                <span
                  className={[
                    'text-xs font-medium text-center w-24',
                    done || current ? 'text-navy' : 'text-text-muted',
                  ].join(' ')}
                >
                  {stage}
                  {current && (
                    <span className="block mt-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
                    </span>
                  )}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-6 ${i < currentIndex ? 'bg-coral' : 'bg-border'}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical timeline */}
      <div className="flex md:hidden flex-col gap-0">
        {STAGES.map((stage, i) => {
          const done = i < currentIndex || (i === currentIndex && isFinalStage);
          const current = i === currentIndex && !isFinalStage;
          const upcoming = i > currentIndex;
          return (
            <div key={stage} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0',
                    done && 'bg-coral border-coral text-white',
                    current && 'bg-white border-coral text-coral',
                    upcoming && 'bg-white border-border text-text-muted',
                  ].filter(Boolean).join(' ')}
                >
                  {done ? '✓' : i + 1}
                </div>
                {i < STAGES.length - 1 && (
                  <div className={`w-0.5 flex-1 min-h-6 ${i < currentIndex ? 'bg-coral' : 'bg-border'}`} />
                )}
              </div>
              <div className="pb-6">
                <p className={`text-sm font-medium ${done || current ? 'text-navy' : 'text-text-muted'}`}>
                  {stage}
                </p>
                {current && <p className="text-xs text-coral mt-0.5">Current status</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}