import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';

import { fetchDriveItems } from '../graph.js';
import RecursiveComponent from './RecursiveComponent';

/**
 * Renders the File Browser drive component with a sign in or sign out button depending on whether or not a user is authenticated
 * @param props
 */
const FileBrowser = ({ accessToken, driveId }) => {
    const [driveItems, setDriveItems] = useState(null);

    const RequestDriveData = async () => {
        fetchDriveItems(accessToken, driveId.driveId)
        .then((response) => {
            setDriveItems(response.value);
        })
    };

  return (
    <div>
      {driveItems ? (
        <div className="p-20">
          <div>
            <h3>Files</h3>
            {driveItems.map(item => {
            //   console.log('Mapping item:', item);
              return (
                <div key={item.id}>
                  <RecursiveComponent
                    accessToken={accessToken}
                    driveId={driveId}
                    item={item}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : driveId && (
        <>
          {/* {console.log("driveItems is falsy:", driveItems)} */}
          <Button variant="secondary" onClick={RequestDriveData} className="mt-5">
            Browse Drive Data
          </Button>
        </>
      )}
    </div>
  )
}

export default FileBrowser
