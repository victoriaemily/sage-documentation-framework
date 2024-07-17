import React, { useState, useEffect } from 'react';
import { fetchDriveItems, fetchFilePermissions, fetchFilePermissionsAlt, getUserEmail, postFilePermissions, deleteFilePermission } from '../graph.js';
import { BsFiletypeXlsx, BsFiletypeDocx, BsFiletypePptx } from "react-icons/bs";
import { CiFileOn, CiEdit, CiLock, CiFolderOn } from "react-icons/ci";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { FaFolder } from "react-icons/fa";

const RecursiveComponent = ({ accessToken, driveId, item }) => {
    const [children, setChildren] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasWritePermission, setHasWritePermission] = useState(null);
    const [showPopup, setShowPopup] = useState(null);
    const [showUpdatePopup, setShowUpdatePopup] = useState(null);
    const [refresh, setRefresh] = useState(false);

    const handleExpand = async () => {
        if (item.folder) {
            if (!isExpanded) {
                const data = await fetchDriveItems(accessToken, driveId.driveId, item.id);
                setChildren(data.value);
                console.log("Children fetched:", data.value);
            }
            setIsExpanded(!isExpanded);
        }
    };

    const submitUpdate = async () => {
        try {
            console.log("Attempting to submit update to file...");
            await deleteIndividualWritePermissions();
            setShowUpdatePopup(false);
            setRefresh(!refresh);
        } catch (error) {
            console.error("Error updating access", error);
            alert(`An unexpected error occurred: ${error.message}`);
        }
    };

    const deleteIndividualWritePermissions = async () => {
        try {
            console.log("Trying to delete individual write perms...");
            console.log("User Drive ID: ", driveId)
            const permissionsResponse = await fetchFilePermissionsAlt(accessToken, driveId.driveId, item.id);
            const permissions = permissionsResponse.value;
            
            for (const permission of permissions) {
                if (permission.roles.includes('write') && permission.grantedTo && permission.grantedTo.user) {
                    await deleteFilePermission(accessToken, driveId.driveId, item.id, permission.id);
                    console.log(`Deleted write permission for user: ${permission.grantedTo.user.email}`);
                }
            }
        } catch (error) {
            console.error('Error deleting individual write permissions:', error);
        }
    };

    const requestAccess = async () => {
        try {
            console.log("User is requesting access...");
            const response = await postFilePermissions(accessToken, driveId.driveId, item.id, "victoria.c6140@gmail.com");
            
            if (response.ok) {
                console.log("Access requested successfully.");
                setRefresh(true);
                setShowPopup(false);
            } else {
                const errorData = await response.json();
                console.error("Error requesting access:", errorData);
                alert(`Error requesting access: ${errorData.error.message}`);
            }
        } catch (error) {
            console.error("Error requesting access:", error);
            alert(`An unexpected error occurred: ${error.message}`);
        }
    };
    
    useEffect(() => {
        const checkPermission = async () => {
            const hasPermission = await checkUserWritePermission(accessToken, driveId, item.id);
            setHasWritePermission(hasPermission);
            console.log(`User has write permission for item ${item.name}:`, hasPermission);
        };
        checkPermission();
    }, [accessToken, driveId, item.id, refresh]); // Re-run effect when refresh changes

    async function checkUserWritePermission(accessToken, driveId, itemId) {
        try {
            const permissionsResponse = await fetchFilePermissions(accessToken, driveId, itemId);
            // const userEmail = await getUserEmail(accessToken);
            const userEmail = 'victoria.c6140@gmail.com'; // Hardcoded email for testing
    
            const permissions = permissionsResponse.value;
    
            const hasWritePermission = permissions.some(permission => {
                if (permission.roles.includes('write')) {
                    if (permission.grantedToIdentitiesV2) {
                        return permission.grantedToIdentitiesV2.some(identity => 
                            identity.user && identity.user.email === userEmail);
                    }
    
                    if (permission.grantedToIdentities) {
                        return permission.grantedToIdentities.some(identity => 
                            identity.user && identity.user.email === userEmail);
                    }
    
                    if (permission.grantedTo && permission.grantedTo.user && permission.grantedTo.user.email === userEmail) {
                        return true;
                    }
    
                    if (permission.grantedToV2 && permission.grantedToV2.group && permission.grantedToV2.group.email === userEmail) {
                        return true;
                    }
                }
                return false;
            });
    
            return hasWritePermission;
        } catch (error) {
            console.error('Error checking user write permission:', error);
            return false;
        }
    }

    return (
        <div className="pl-4 border-l border-gray-300">
            <div className="flex items-center justify-between mb-2 hover:bg-gray-100">
                {item.folder ? (
                    <button
                        onClick={handleExpand}
                        className="text-blue-600 hover:underline flex items-center"
                    >
                        <span className={`mr-2 ${isExpanded ? 'rotate-90' : ''} transition-transform`}>▶</span>
                        <FaFolder className ="text-3xl mr-4 ml-2"/>
                        {item.name}
                    </button>
                ) : (
                    // drive item is not a folder, render as a file
                    <div className="flex items-center w-full bg-gray-50 p-1">
                        <div className="flex items-center text-gray-600 p-2 rounded-lg">
                            <div className="mr-2">
                                {
                                    {
                                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': <BsFiletypeDocx className="text-4xl" />,
                                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': <BsFiletypeXlsx className="text-4xl" />,
                                        'application/vnd.openxmlformats-officedocument.presentationml.presentation': <BsFiletypePptx className="text-4xl" />
                                    }[item.file.mimeType] || <div><CiFileOn className="text-4xl"/></div>
                                }
                            </div>
                            <span>{item.name}</span>
                        </div>
                        <div className="ml-auto flex items-center">
                            <a href={item.webUrl} className="text-blue-600 hover:underline mr-4 text-3xl">
                                <MdOutlineRemoveRedEye/>
                            </a>
                            {hasWritePermission !== null && (
                                <>
                                    {hasWritePermission ? (
                                        <div className="flex items-center">
                                            <button className="bg-green-500 text-white rounded-lg px-4 py-2 mr-2" onClick={() => setShowUpdatePopup(true)}>Submit Update</button>
                                        </div>
                                    ) : (
                                        <button className="text-white bg-blue-500 rounded-lg px-4 py-2" onClick={() => setShowPopup(true)}>Request Access</button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {isExpanded && children && (
                <div className="pl-4">
                    {children.map(child => (
                        <RecursiveComponent
                            key={child.id}
                            accessToken={accessToken}
                            driveId={driveId}
                            item={child}
                        />
                    ))}
                </div>
            )}
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="bg-white p-4 rounded shadow-lg">
                        <h2 className="text-lg font-bold mb-2">Request Access</h2>
                        <p className="mb-4">You do not have permission to access this file. Do you want to request access?</p>
                        <button
                            onClick={requestAccess}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Request Access
                        </button>
                        <button
                            onClick={() => setShowPopup(false)}
                            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            {showUpdatePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="bg-white p-4 rounded shadow-lg">
                        <h2 className="text-lg font-bold mb-2">Submit Update</h2>
                        <p className="mb-4">After clicking confirm, you will not be able to make any further changes unless you re-request this file again. Proceed?</p>
                        <button
                            onClick={submitUpdate}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Submit Update
                        </button>
                        <button
                            onClick={() => setShowUpdatePopup(false)}
                            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecursiveComponent;
