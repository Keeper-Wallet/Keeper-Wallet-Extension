export const MessagesScreen = {
  get root() {
    return $(
      "[class*='messageList@'], [class*='root@messagesAndNotifications']",
    );
  },

  get messages() {
    return this.root.$$("[class*='messageItemInner@']");
  },

  get messagesCards() {
    return this.root.$$("[class*='cardItem@']");
  },

  get closeButton() {
    return this.root.findByText$('Close');
  },

  get clearAllButton() {
    return this.root.findByText$('Clear All');
  },
};
