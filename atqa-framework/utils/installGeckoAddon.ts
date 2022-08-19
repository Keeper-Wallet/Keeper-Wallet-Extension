import fs from 'fs-extra';

const { I } = inject();

export const installAddOnHelper = async (
  extensionPath: string
): Promise<void> => {
  I.useWebDriverTo('Install Gecko AddOn', async ({ browser }) => {
    const extension = await fs.readFile(extensionPath);
    browser.installAddOn(extension.toString('base64'), true);
  });
};
