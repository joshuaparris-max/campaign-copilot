const FULL_VAULT_URL = 'https://ai-dungeon-master-azure.vercel.app/reference';

const QUICK_RULES = [
  ['Attack vs AC', 'Attack total equal to AC hits.'],
  ['Alert — current 5.5e', 'Add Proficiency Bonus to Initiative; after rolling, you can swap your result with one willing ally if neither is Incapacitated. It is not “roll twice”.'],
  ['Alert — 2014', '+5 Initiative, cannot be surprised while conscious, and unseen attackers do not gain advantage merely for being unseen.'],
  ['Sorcery Points — current', 'Sorcerer 6 can regain up to 3 spent Sorcery Points on a Short Rest via Sorcerous Restoration, once per Long Rest.'],
  ['Sorcery Points — 2014', 'Level-6 Sorcerer normally regains spent Sorcery Points on a Long Rest, not a Short Rest.'],
  ['Knock', 'The secured object must be visible; the lock mechanism itself need not be. One lock/bolt-style obstruction at a time; the spell makes a loud knock.'],
  ['Transmuted Spell', 'Can swap acid/cold/fire/lightning/poison/thunder. It cannot turn a spell into Radiant damage.'],
] as const;

export function RulesReferencePanel() {
  return (
    <section className="rounded-lg border border-emerald-800 bg-gray-800 p-5" aria-labelledby="rules-reference-title">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Edition-aware reference</p>
          <h2 id="rules-reference-title" className="mt-1 text-2xl font-bold text-gray-100">Rules & Character Vault</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-300">
            Consolidated from the campaign notes and D&D chats. Keep strict 2014 campaigns separate from the current 2024 rules used in 2026 (5.5e).
          </p>
        </div>
        <a
          className="shrink-0 rounded-md border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-950"
          href={FULL_VAULT_URL}
          target="_blank"
          rel="noreferrer"
        >
          Open full vault ↗
        </a>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <h3 className="font-semibold text-gray-100">Bram Oakmoss</h3>
          <p className="mt-1 text-sm text-gray-400">Firbolg · Druid 6 · Circle of Spores</p>
          <dl className="mt-3 grid grid-cols-4 gap-2 text-center text-sm">
            <div className="rounded bg-gray-800 p-2"><dt className="text-xs text-gray-500">AC</dt><dd className="font-bold text-gray-100">16</dd></div>
            <div className="rounded bg-gray-800 p-2"><dt className="text-xs text-gray-500">HP</dt><dd className="font-bold text-gray-100">45</dd></div>
            <div className="rounded bg-gray-800 p-2"><dt className="text-xs text-gray-500">DC</dt><dd className="font-bold text-gray-100">14</dd></div>
            <div className="rounded bg-gray-800 p-2"><dt className="text-xs text-gray-500">Spell</dt><dd className="font-bold text-gray-100">+6</dd></div>
          </dl>
          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm leading-6 text-gray-300">
            <li><strong>2014 Wild Shape:</strong> CR 1/2, swim allowed, no fly until level 8, form must be a Beast Bram has seen.</li>
            <li><strong>Current Wild Shape:</strong> six known forms at level 6, CR 1/2, no Fly Speed; do not treat it as unlimited seen-Beast access.</li>
            <li><strong>Spores:</strong> Halo of Spores 1d6 on recovered sheet, Symbiotic Entity records 24 temp HP, Fungal Infestation is active; Spreading Spores is not yet.</li>
            <li><strong>Will-o’-Wisp:</strong> prefer Moonbeam over Beast-form attacks; avoid Call Lightning for that matchup.</li>
          </ul>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <h3 className="font-semibold text-gray-100">Fast rulings</h3>
          <div className="mt-3 space-y-3">
            {QUICK_RULES.map(([title, body]) => (
              <div key={title}>
                <div className="text-sm font-medium text-gray-200">{title}</div>
                <p className="mt-0.5 text-sm leading-5 text-gray-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-gray-700 bg-gray-900 p-4 text-sm leading-6 text-gray-300">
        <strong className="text-gray-100">Recovered campaign anchors:</strong>{' '}
        The Chronos Fracture and Storm King&apos;s Thunder / Alfie use strict 2014 5e. Chronos uses fixed HP, point buy, milestone advancement and scene-bound timeline shifts. Recovered SKT party: Alphie J. Roane, Wren and Dorrin Stonebrook. Pets of the Spider Queen is the level-4 prisoner one-shot featuring Sir Robert-Morgan the 4th, Katmur, Tyrion Lifesoul and Darius.
      </div>
    </section>
  );
}
