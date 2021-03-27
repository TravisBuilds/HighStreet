import React, {useContext} from 'react'
import {UserProvider} from "../contexts/UserProvider"; 

export const Profile = () => {

    const userAccount = useContext(UserProvider.context); 
    return (
        <div>
            My Eth address = {userAccount} 
        </div>
    )
}
