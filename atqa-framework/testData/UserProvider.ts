import { EmailUser } from '../interfaces/EmailUser.interface';

import { emailUsers } from './emailUsers';

export class UserProvider {
  private getUsers = [...emailUsers];

  getUser = (userType: string): EmailUser => {
    const targetUser = this.getUsers.find((user) => user.type === userType);
    if (targetUser === undefined) {
      throw new Error(`The user "${userType}" is undefined`);
    }
    return targetUser;
  };

  getTestNetUser = (): EmailUser => {
    return this.getUser('TESTNET_USER');
  };

  getMainNetUser = (): EmailUser => {
    return this.getUser('MAINNET_USER');
  };
}
