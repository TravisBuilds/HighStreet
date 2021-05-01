import React, { useContext } from 'react';
import AvatarGenerator from '../components/AvatarGenerator';
import UserProvider from '../contexts/UserProvider';

const Profile = () => {
  const userAccount = useContext(UserProvider.context);
  return (
    <div>
      My Eth address =
      {userAccount}

      <AvatarGenerator />
    </div>
  );
};

export default Profile;
