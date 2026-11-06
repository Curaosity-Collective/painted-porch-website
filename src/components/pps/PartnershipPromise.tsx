import { PARTNERSHIP_PROMISE } from "@/data/partnershipPromise";

export default function PartnershipPromise() {
  return (
    <section className="py-8 bg-white">
      <div className="container max-w-3xl mx-auto px-6">
        <div className="p-6 bg-lime/10 border border-lime/30 rounded-lg">
          <p className="text-body text-lime font-semibold mb-2">{PARTNERSHIP_PROMISE.title}</p>
          <p className="text-body -sm text-foreground">{PARTNERSHIP_PROMISE.body}</p>
        </div>
      </div>
    </section>
  );
}
