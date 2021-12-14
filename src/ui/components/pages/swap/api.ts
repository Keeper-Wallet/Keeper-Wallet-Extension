export async function fetchGetMoney({
  fromAmount,
  fromBalance,
  toBalance,
}: {
  fromAmount: string;
  fromBalance: string;
  toBalance: string;
}) {
  const json = await fetch(
    `https://flat.swop.fi/get-money/${fromBalance}/${toBalance}/${fromAmount}`
  ).then(
    res =>
      res.json() as Promise<{
        data: { money: string };
        params: { payMoney: string };
      }>
  );

  return json.data.money;
}
