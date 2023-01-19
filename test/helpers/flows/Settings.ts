import { GeneralSettingsScreen } from '../settings/GeneralSettingsScreen';
import { PermissionControlSettingsScreen } from '../settings/PermissionControlSettingsScreen';
import { SettingsMenuScreen } from '../settings/SettingsMenuScreen';
import { TopMenu } from '../TopMenu';

export const Settings = {
  setSessionTimeout: async (name: string) => {
    // refresh timeout by focus window
    await browser.execute(() => {
      window.focus();
    });

    await TopMenu.settingsButton.click();
    await SettingsMenuScreen.generalSectionLink.click();
    await GeneralSettingsScreen.setSessionTimeoutByName(name);
  },

  setMinSessionTimeout: async () => {
    await Settings.setSessionTimeout('Browser timeout');
  },

  clearCustomList: async () => {
    await TopMenu.settingsButton.click();
    await SettingsMenuScreen.permissionsSectionLink.click();

    const permissions = await PermissionControlSettingsScreen.permissionItems;
    for (const permission of permissions) {
      await permission.detailsIcon.click();
      await PermissionControlSettingsScreen.permissionDetailsModal.deleteButton.click();
    }
  },
};
