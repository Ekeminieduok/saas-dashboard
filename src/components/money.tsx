function formatKobo(amountKobo: number) {
  const naira = amountKobo / 100;
  const [whole, cents] = naira.toFixed(2).split(".");
  const wholeFormatted = Number(whole).toLocaleString("en-NG");
  return { wholeFormatted, cents };
}

export function Money({ amountKobo }: { amountKobo: number }) {
  const { wholeFormatted, cents } = formatKobo(amountKobo);
  return (
    <span className="money">
      ₦{wholeFormatted}
      <span className="cents">.{cents}</span>
    </span>
  );
}
