import { extension } from 'lib/extension';
import LocalStore from 'lib/localStore';
import ObservableStore from 'obs-store';

export interface Tab {
  active: boolean;
  id: number;
  url: string;
  autoDiscardable: boolean;
}

export class TabsManager {
  private store;

  constructor({ localStore }: { localStore: LocalStore }) {
    this.store = new ObservableStore(localStore.getInitState({ tabs: {} }));
    localStore.subscribe(this.store);
  }

  async getOrCreate(url: string, key: string) {
    const { tabs } = this.store.getState();

    const currentTab = tabs[key];
    const tabProps = { active: true } as Tab;
    if (url != currentTab?.url) {
      tabProps.url = url;
    }

    return new Promise<void>((resolve, reject) => {
      try {
        extension.tabs.get(currentTab?.id, (tab: Tab) => {
          if (!tab) {
            reject(new Error("Tab doesn't exists"));
          }
        });
        extension.tabs.update(currentTab.id, tabProps, () => resolve());
      } catch (err) {
        reject(err);
      }
    }).catch(() =>
      extension.tabs.create({ url: url }, (tab: Tab) => {
        this.store.updateState({ tabs: { ...tabs, [key]: { ...tab, url } } });
      })
    );
  }
}
