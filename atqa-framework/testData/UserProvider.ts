import { EmailUser } from '../interfaces/EmailUser.interface';

import { emailUsers } from './emailUsers';

export class UserProvider {
  private getUsers = [...emailUsers];

  getUser = (userType: string): EmailUser => {
    const fundedUser = this.getUsers.find(user => user.type === userType);
    if (fundedUser === undefined) {
      throw new Error(`The user "${userType}" is undefined`);
    }
    return fundedUser;
  };

  getTestNetUser = (): EmailUser => {
    return this.getUser('TESTNET_USER');
  };

  getMainNetUser = (): EmailUser => {
    return this.getUser('MAINNET_USER');
  };
}
