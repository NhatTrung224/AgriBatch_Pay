import { PlaceholderSurface } from "@/components/placeholder-surface";

export default function EventsPlaceholderPage() {
  return (
    <PlaceholderSurface
      title="Realtime contract and app events land here."
      description="This surface will host the SSE connection state, audit timeline, and wallet interaction stream once the event API layer is in place."
      eyebrow="Events"
    />
  );
}
