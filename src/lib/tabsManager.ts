import * as browser from 'extensionizer';

type Tab = {
  active: boolean;
  id: number;
  url: string;
  autoDiscardable: boolean;
};

export class TabsManager {
  private _tabs: { [tabName: string]: Tab } = {};

  async getOrCreate(url: string, key: string) {
    const currentTab = this._tabs[key];
    const tabProps = { active: true } as Tab;
    if (url != currentTab?.url) {
      tabProps.url = url;
    }

    return new Promise((resolve, reject) => {
      try {
        browser.tabs.get(currentTab?.id, tab => {
          if (!tab) {
            reject(new Error("Tab doesn't exists"));
          }
        });
        browser.tabs.update(currentTab.id, tabProps, () => resolve());
      } catch (err) {
        reject(err);
      }
    }).catch(() =>
      browser.tabs.create({ url: url }, tab => {
        this._tabs[key] = { ...tab, url };
      })
    );
  }
}
