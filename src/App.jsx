import React, { useState, useEffect } from 'react';
import { PageLayout } from './components/PageLayout';
import { loginRequest } from './authConfig';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal, useIsAuthenticated } from '@azure/msal-react';
import './styles/App.css';

import FileBrowser from './components/FileBrowser';
import DriveSelect from './components/DriveSelect';

const ProfileContent = () => {
    const { instance, accounts } = useMsal();
    const [graphToken, setGraphToken] = useState(null);
    const [selectedDriveId, setSelectedDriveId] = useState(null);

    const fetchGraphToken = () => {
        instance
            .acquireTokenSilent({
                ...loginRequest,
                account: accounts[0],
            })
            .then((response) => {
                setGraphToken(response.accessToken);
            });
    };

    // fetch graph token on webpage redner
    useEffect(() => {
        fetchGraphToken();
    }, []);

    return (
        <>
            <h5 className="text-2xl p-10 mt-10">Welcome, {accounts[0].name}!</h5>
            <br />
            {graphToken && (
                <div className="pl-20 pr-20">
                    <DriveSelect accessToken={graphToken} setSelectedDriveId={setSelectedDriveId}/>
                    <FileBrowser accessToken={graphToken} driveId={selectedDriveId} />
                </div>
            )}

        </>
    );
};

const MainContent = () => {
    return (
        <div className="App">
            <AuthenticatedTemplate>
                <ProfileContent />
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <h5>
                    <center>
                        Please sign-in to see your profile information.
                    </center>
                </h5>
            </UnauthenticatedTemplate>
        </div>
    );
};

export default function App() {
    const isAuthenticated = useIsAuthenticated();
    return (
        <PageLayout>
            <center>
                <MainContent />
            </center>
        </PageLayout>
    );
}
