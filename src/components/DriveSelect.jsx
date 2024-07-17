import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import GroupCard from './GroupCard.jsx';
import { useIsAuthenticated } from "@azure/msal-react";

import { fetchUserGroups } from '../graph.js';

const DriveSelect = ({ accessToken, setSelectedDriveId }) => {
    const [userGroups, setUserGroups] = useState(null);
    const [selected, setSelected] = useState(null); // State to handle selected group and drive

    const displayGroups = async () => {
        console.log("FETCHING GROUPS FOR USER")
        fetchUserGroups(accessToken)
            .then((response) => {
                setUserGroups(response.value);
                console.log("User's groups: ", userGroups);
            });
    };

    useEffect(() => {
        displayGroups();
    }, []);

    return (
        <div>
            
            {selected ? (
                <div className="border-4 border-gray-50 p-5 rounded-xl text-2xl">
                    {/* {console.log(selected)} */}
                    {/* <h4>Selected Group: {selected.group}</h4> */}
                    {console.log(selected.group)}
                    <div>Group: {selected.group.displayName}</div>
                    <div>Description: {selected.group.description}</div>
                    {/* <h4>Selected Drive ID: {selected.driveId}</h4> */}
                </div>
            ) : (
                userGroups ? (
                    
                    <div className="space-y-4">
                    <h3 className="text-xl font-bold mb-4">Groups</h3>
                    <div className="overflow-y-auto max-h-96">
                        {userGroups.slice(1).map(item => (
                            <div key={item.id} className="bg-white p-2">
                                <GroupCard
                                    key={item.id}
                                    accessToken={accessToken}
                                    item={item}
                                    setSelectedDriveId={setSelectedDriveId}
                                    setSelected={setSelected}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                    <p>Loading...</p>
                )
            )}
        </div>
    )
}

export default DriveSelect;

