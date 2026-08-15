export async function startCheckout(plan: "plus" | "studio") {
  const response = await fetch("/api/billing/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = (await response.json()) as { checkout_url?: string; error?: string };
  if (response.status === 401) {
    window.location.href = `/login?next=/pricing`;
    return;
  }
  if (!response.ok || !data.checkout_url) {
    throw new Error(data.error || "Could not start checkout.");
  }
  window.location.href = data.checkout_url;
}

export async function openBillingPortal() {
  const response = await fetch("/api/billing/portal");
  const data = (await response.json()) as { portal_url?: string; error?: string };
  if (!response.ok || !data.portal_url) {
    throw new Error(data.error || "Could not open the billing portal.");
  }
  window.location.href = data.portal_url;
}
