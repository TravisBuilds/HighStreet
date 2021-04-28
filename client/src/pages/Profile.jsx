import React, { useContext } from 'react';
import UserProvider from '../contexts/UserProvider';

const Profile = () => {
  const userAccount = useContext(UserProvider.context);
  return (
    <div>
      My Eth address = {userAccount}
    </div>
  );
};

export default Profile;
