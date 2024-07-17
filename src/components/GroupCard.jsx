import React, { useState } from 'react';
import { fetchGroupDrives } from '../graph.js';

const GroupCard = ({ accessToken, item, setSelectedDriveId, setSelected }) => {

    const [isExpanded, setIsExpanded] = useState(false);
    const [children, setChildren] = useState(null);

    function handleSubmit(e) {
        e.preventDefault();
        // Read the form data
        console.log("Submission detected");
        const form = e.target;
        console.log(form);
        const selectedDriveId = form.selectedDrive.value;
        setSelected({ driveId: selectedDriveId, group: item });
        setSelectedDriveId({ driveId: selectedDriveId, group: item });
        console.log("Group item:", item);
        console.log(selectedDriveId);
        // TODO - fade grou
    }

    const handleExpand = async () => {
        if (!isExpanded) {
            // Logic to get selected group ID, pass to below func
            console.log("FETCHING GROUP DRIVES");
            const data = await fetchGroupDrives(accessToken, item.id);
            setChildren(data.value);
            console.log("Children fetched:", data.value);
        }
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="border rounded-md">
            <div className="p-3">
                <button
                    onClick={handleExpand}
                    className="text-blue-600 hover:underline flex items-center"
                >
                    <span className={`mr-2 ${isExpanded ? 'rotate-90' : ''} transition-transform`}>▶</span>
                    {item.displayName}
                </button>
            </div>
            {isExpanded && children && (
                <form method="post" onSubmit={handleSubmit}>
                    <label>
                        <div className="pb-4">
                        <select
                            name="selectedDrive"
                            multiple={false}
                        >
                            {children.map(child => (
                                <option className="p-10" value={child.id}>{child.name}</option>
                            ))}
                        </select>
                        </div>
                    </label>
                    <button className="bg-gray-500 text-white p-1 rounded-md ml-2" type="submit">Select Drive</button>
                </form>
            )}
        </div>
    )
}

export default GroupCard
