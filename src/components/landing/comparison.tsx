const rows = [
  ["Private key location", "This browser", "Your terminal", "Their servers"],
  ["Needs an account to issue", "No", "No", "Usually"],
  ["Readable UI", "Yes", "No", "Sometimes"],
  ["Can the vendor leak your key?", "No", "No", "Yes"],
  ["PFX / CSR / mTLS", "Yes", "If you know how", "Varies"],
];

export function Comparison() {
  return (
    <section className="border-t border-line py-20">
      <div className="mx-auto max-w-6xl px-5">
        <p className="eyebrow">Compared</p>
        <h2 className="display mt-3 max-w-xl text-4xl sm:text-5xl">
          The privacy of OpenSSL. The manners of a product.
        </h2>
        <div className="mt-10 overflow-hidden rounded-3xl border border-line">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-bg-muted text-muted">
                <tr>
                  <th className="px-5 py-4 font-medium"> </th>
                  <th className="px-5 py-4 font-medium text-wax">Signet</th>
                  <th className="px-5 py-4 font-medium">OpenSSL CLI</th>
                  <th className="px-5 py-4 font-medium">Cloud generators</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row[0]} className="border-t border-line">
                    {row.map((cell, i) => (
                      <td
                        key={`${row[0]}-${i}`}
                        className={`px-5 py-4 ${i === 0 ? "text-muted" : ""} ${i === 1 ? "font-medium" : ""}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
