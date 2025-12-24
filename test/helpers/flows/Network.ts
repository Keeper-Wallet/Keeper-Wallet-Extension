import { NetworksMenu } from '../NetworksMenu';
import { SettingsMenuScreen } from '../settings/SettingsMenuScreen';
import { TopMenu } from '../TopMenu';

export const Network = {
  switchTo: async (network: string) => {
    const currentNetwork = await NetworksMenu.networkMenuButton.getText();
    if (currentNetwork === network) return;
    await NetworksMenu.networkMenuButton.click();
    await browser.pause(300);
    const networkLink = await NetworksMenu.networkByName(network);
    await networkLink.waitForDisplayed();
    await networkLink.click();
  },

  checkNetwork: async (network: string) => {
    const networkMenuButton = NetworksMenu.networkMenuButton;
    await networkMenuButton.waitForDisplayed();
    await expect(networkMenuButton).toHaveText(network);
  },

  switchToAndCheck: async (network: string) => {
    const fullNetworkName = `Waves ${network}`;
    await Network.switchTo(fullNetworkName);
    await Network.checkNetwork(fullNetworkName);
  },

  enableTestNetworks: async () => {
    await TopMenu.settingsButton.click();
    await SettingsMenuScreen.networkSectionLink.click();

    // Wait for the page to load and preferences to be fetched
    await browser.pause(1000);

    // Find the checkbox input and check its current state
    const toggleInput = await $('input[type="checkbox"]');
    const isCurrentlyChecked = await toggleInput.isSelected();

    // Only click if not already checked (we want to enable test networks)
    if (!isCurrentlyChecked) {
      // Click the toggle container to toggle the checkbox
      const toggleSwitch = await $("[class*='toggleSwitch']");
      await toggleSwitch.click();
      await browser.pause(300);
    }

    const confirmButton = await $('button[type="submit"]');
    await confirmButton.click();

    // Wait for the state to be persisted to storage
    await browser.pause(1500);
  },
};
