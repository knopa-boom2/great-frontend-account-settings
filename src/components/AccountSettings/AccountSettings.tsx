import { AccountForm } from '../index.ts';

import '../../css/global.css';
import './styles/AccountSettings.css';

export const AccountSettings = () => {
  return (
    <div className='container'>
      <div className='account-settings'>
        <div className='account-settings__headings'>
          <h2>Manage Your Account</h2>
          <span>
            Update your account details below for a tailored experience on our
            platform.
          </span>
        </div>
        <AccountForm />
      </div>
    </div>
  );
};
