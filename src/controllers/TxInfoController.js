export class TxInfoController {
  constructor(options = {}) {
    this.getNode = options.getNode;
    this.getNetwork = options.getNetwork;
  }

  async txInfo(txId) {
    const API_BASE = this.getNode();
    const url = new URL(`transactions/info/${txId}`, API_BASE).toString();

    let resp = await fetch(url);
    switch (resp.status) {
      case 200:
        return resp
          .text()
          .then(text =>
            JSON.parse(
              text.replace(/(".+?"[ \t\n]*:[ \t\n]*)(\d{15,})/gm, '$1"$2"')
            )
          );
      case 400:
        const error = await resp.json();
        throw new Error(
          `Could not find info for tx with id: ${txId}. ${error.message}`
        );
      default:
        throw new Error(await resp.text());
    }
  }

  async txHistory(address, limit = 100) {
    const url = new URL(
      `transactions/address/${address}/limit/${limit}`,
      this.getNode()
    ).toString();

    let resp = await fetch(url, {
      headers: { accept: 'application/json; large-significand-format=string' },
    });

    switch (resp.status) {
      case 200:
        return resp.json().then(arr => arr[0]);
      case 400:
        const error = await resp.json();
        throw new Error(error.message);
      default:
        throw new Error(await resp.text());
    }
  }

  async aliasByAddress(address) {
    const url = new URL(
      `alias/by-address/${address}`,
      this.getNode()
    ).toString();

    let resp = await fetch(url);

    switch (resp.status) {
      case 200:
        return resp.json();
      case 400:
        const error = await resp.json();
        throw new Error(error.message);
      default:
        throw new Error(await resp.text());
    }
  }
}
