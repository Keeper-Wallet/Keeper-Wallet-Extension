import ObservableStore from 'obs-store';
import Browser from 'webextension-polyfill';

import { type ExtensionStorage } from '../storage/storage';

export class TabsManager {
  #store;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    this.#store = new ObservableStore(
      extensionStorage.getInitState({ tabs: {} }),
    );

    extensionStorage.subscribe(this.#store);
  }

  async getOrCreate(url: string, key: string) {
    const { tabs } = this.#store.getState();
    const currentTab = tabs[key];

    let existingTab: Browser.Tabs.Tab | null;

    try {
      existingTab =
        currentTab?.id == null ? null : await Browser.tabs.get(currentTab.id);
    } catch {
      existingTab = null;
    }

    if (existingTab) {
      const updateProperties: Browser.Tabs.UpdateUpdatePropertiesType = {
        active: true,
      };

      if (url !== existingTab.url) {
        updateProperties.url = url;
      }

      await Browser.tabs.update(existingTab.id, updateProperties);
    } else {
      const newTab = await Browser.tabs.create({ url });
      this.#store.updateState({ tabs: { ...tabs, [key]: { ...newTab, url } } });
    }
  }

  async closeCurrentTab() {
    const [tab] = await Browser.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });

    if (tab?.id) {
      await Browser.tabs.remove([tab.id]);
    }
  }
}
