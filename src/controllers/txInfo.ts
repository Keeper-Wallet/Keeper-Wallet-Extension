import { NetworkController } from './network';

type GetNode = NetworkController['getNode'];
type GetNetwork = NetworkController['getNetwork'];

export class TxInfoController {
  getNode: GetNode;
  getNetwork: GetNetwork;

  constructor(options: { getNode?: GetNode; getNetwork?: GetNetwork } = {}) {
    this.getNode = options.getNode;
    this.getNetwork = options.getNetwork;
  }

  async txInfo(txId) {
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
