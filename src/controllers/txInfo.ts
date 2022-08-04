import { NetworkController } from './network';

export class TxInfoController {
  private getNode;

  constructor(options: { getNode: NetworkController['getNode'] }) {
    this.getNode = options.getNode;
  }

  async txInfo(txId: string) {
    const API_BASE = this.getNode();
    const url = new URL(`transactions/info/${txId}`, API_BASE).toString();

    const resp = await fetch(url);
    switch (resp.status) {
      case 200:
        return resp
          .text()
          .then(text =>
            JSON.parse(
              text.replace(/(".+?"[ \t\n]*:[ \t\n]*)(\d{15,})/gm, '$1"$2"')
            )
          );
      case 400: {
        const error = await resp.json();
        throw new Error(
          `Could not find info for tx with id: ${txId}. ${error.message}`
        );
      }
      default:
        throw new Error(await resp.text());
    }
  }
}
