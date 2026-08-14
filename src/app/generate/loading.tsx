export default function GenerateLoading() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <div className="h-4 w-24 rounded-full skeleton" />
      <div className="mt-4 h-12 w-80 rounded-2xl skeleton" />
      <div className="mt-8 h-[420px] rounded-[28px] skeleton" />
    </div>
  );
}
