import { HomeScreen } from '../HomeScreen';
import { OtherAccountsScreen } from '../OtherAccountsScreen';

export const PopupHome = {
  addAccount: async () => {
    await HomeScreen.otherAccountsButton.click();
    await OtherAccountsScreen.addAccountButton.click();
  },

  getActiveAccountName: async () => {
    const accountName = HomeScreen.activeAccountName;
    await accountName.waitForDisplayed();
    return await accountName.getText();
  },
};
