import { extension } from 'lib/extension';
import { ExtensionStorage } from '../storage/storage';
import ObservableStore from 'obs-store';

export class TabsManager {
  private store;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState({ tabs: {} })
    );
    extensionStorage.subscribe(this.store);
  }

  async getOrCreate(url: string, key: string) {
    const { tabs } = this.store.getState();

    const currentTab = tabs[key];
    const tabProps: chrome.tabs.UpdateProperties = { active: true };
    if (url != currentTab?.url) {
      tabProps.url = url;
    }

    return new Promise<void>((resolve, reject) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
        extension.tabs.get(currentTab?.id!, tab => {
          if (!tab) {
            reject(new Error("Tab doesn't exists"));
          }
        });
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        extension.tabs.update(currentTab!.id!, tabProps, () => resolve());
      } catch (err) {
        reject(err);
      }
    }).catch(() =>
      extension.tabs.create({ url: url }, tab => {
        this.store.updateState({ tabs: { ...tabs, [key]: { ...tab, url } } });
      })
    );
  }
}
