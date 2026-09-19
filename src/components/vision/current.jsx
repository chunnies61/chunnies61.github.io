import { AddParty, PartiesTable } from "./parts";

/* The parties block the proposals share: add a party, the lookup, the
   table. (The Current state variant itself is the Loan Request App's EMEA
   flow — see VisionPrototype.) */

export function PartiesBlock({ deal, update, addParty }) {
  return (
    <>
      <AddParty parties={deal.parties} onAdd={addParty} loading={deal.loading} />
      {deal.loading && (
        <p className="lra-loading" role="status">
          <span className="lra-spinner" aria-hidden="true" />
          Loading client details…
        </p>
      )}
      {deal.parties.length > 0 && (
        <PartiesTable parties={deal.parties} onChange={(parties) => update({ parties })} />
      )}
    </>
  );
}
