import { graphConfig } from "./authConfig";

/**
 * Attaches a given access token to a MS Graph API call. Returns information about the user
 * @param accessToken 
 */
export async function callMsGraph(accessToken) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(graphConfig.graphMeEndpoint, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}

/**
 * Attaches a given access token to a MS Graph API call. Returns information about the user
 * @param accessToken 
 */
export async function callMsGraphSite(accessToken) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(graphConfig.graphSiteEndpoint, options)
        .then(response => response.json())
        .then(data => {
            console.log(data); // Log the response data
        })
        .catch(error => console.log(error));
}

// DRIVE ITEM ENDPOINT API CALLS TO MSFT GRAPH

/**
 * This endpoint returns user's most recent file. IE returns 'test.docx'
 * @param accessToken 
 */
export async function fetchRecentFiles(accessToken) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(graphConfig.graphDriveEndpoint, options)
        .then(response => response.json())
        .then(data => {
            console.log(data); // Log the response data
        })
        .catch(error => console.log(error));
}

/**
 * Attaches a given access token to a MS Graph API call. 
 * Returns information about a drive items children
 * @param accessToken 
 */
export async function fetchDriveItems(accessToken, driveId, itemId = 'root') {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;
  
    headers.append("Authorization", bearer);
  
    const options = {
      method: "GET",
      headers: headers
    };
  
    const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/children`;
    console.log("FETCHING URL: ", url);

    return fetch(url, options)
      .then(response => response.json())
      .catch(error => console.log(error));
}

/**
 * Attaches a given access token to a MS Graph API call. 
 * Returns information about the user's associated groups
 * @param accessToken 
 */
export async function fetchUserGroups(accessToken) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    // Endpoint for fetching user's groups - public and private
    const url = "https://graph.microsoft.com/v1.0/me/memberOf"
    console.log("FETCHING URL: ", url);
    
    return fetch(url, options)
      .then(response => response.json())
      .catch(error => console.log(error));
}

/**
 * Attaches a given access token to a MS Graph API call. 
 * Fetch the drives associated with a particular group (in case there may be more than one beyond the root)
 * @param accessToken 
 * @param groupId
 */
export async function fetchGroupDrives(accessToken, groupId) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    // Endpoint for fetching user's groups - public and private
    const url = `https://graph.microsoft.com/v1.0/groups/${groupId}/drives`;
    console.log("FETCHING URL: ", url);
    
    return fetch(url, options)
      .then(response => response.json())
      .catch(error => console.log(error));
}

/**
 * Attaches a given access token to a MS Graph API call. 
 * Fetch the permissions for a given file in a given drive.
 * @param driveId
 * @param itemId 
 */
export async function fetchFilePermissions(accessToken, driveId, itemId) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;
    console.log(driveId);

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    // Endpoint for fetching user's groups - public and private
    const url = `https://graph.microsoft.com/v1.0/drives/${driveId.driveId}/items/${itemId}/permissions`;
    console.log("FETCHING URL PERMS: ", url);
    
    return fetch(url, options)
      .then(response => response.json())
      .catch(error => console.log(error));
}

export async function fetchFilePermissionsAlt(accessToken, driveId, itemId) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;
    console.log(driveId);

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    // Endpoint for fetching user's groups - public and private
    const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/permissions`;
    console.log("FETCHING URL PERMS: ", url);
    
    return fetch(url, options)
      .then(response => response.json())
      .catch(error => console.log(error));
}

// add file perm POST /drives/{drive-id}/items/{item-id}/invite

/**
 * Attaches a given access token to a MS Graph API call. 
 * Post additional permissions for a given file in a given drive.
 * NOTE THAT EXISTING PERMS WILL NOT BE AFFECTED.
 * 
 * @param permissionsData
 * @param userEmail
 * @param itemId 
 */
// graph.js
export async function postFilePermissions(accessToken, driveId, itemId, userEmail) {
    const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/invite`;
    const body = {
        "recipients": [
            {
                "email": userEmail
            }
        ],
        "message": "You are receiving this as you have requested access to this file.",
        "requireSignIn": true,
        "sendInvitation": true,
        "roles": ["write"]
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(body)
    };

    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${errorData.error.message}`);
    }
    return response;
}


// delete file perm POST

/**
 * Attaches a given access token to a MS Graph API call. 
 * Deletes the permissions for a given file in a given drive.
 * DOES NOT TOUCH GROUP PERMISSIONS.
 * 
 * @param driveId
 * @param itemId 
 * @param permissionId
 */
export async function deleteFilePermission(accessToken, driveId, itemId, permissionId) {
    const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/permissions/${permissionId}`;

    const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error deleting permission: ${errorData.error.message}`);
    }
    return response;
}


/**
 * Attaches a given access token to a MS Graph API call. 
 * Fetch the active user email for file permission management.
 * @param accessToken
 */
export async function getUserEmail(accessToken) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    const url = "https://graph.microsoft.com/v1.0/me";

    try {
        const response = await fetch(url, options);
        const profile = await response.json();
        return profile.mail || profile.userPrincipalName;
    } catch (error) {
        console.error(error);
    }
}

// Fetch group profile picture

// 

