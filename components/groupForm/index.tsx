'use client'
import { useState,useEffect } from 'react';
import styles from "../../styles/GroupForm.module.css";
import axios from 'axios';
import Cookies from 'js-cookie'; // You may need to install this package
//import jwtDecode from 'jwt-decode'; // Default import
import * as jwtDecode from 'jwt-decode';


interface DecodedToken {
    email: string; // Adjust according to your JWT structure
}
const GroupForm = () => {
    const [groupCode, setGroupCode] = useState('');
    const [isCreateDisabled, setCreateDisabled] = useState(false);
    const [leaderEmail, setLeaderEmail] = useState('');
    

    const handleJoinGroup = async () => {
        try {
            const response = await axios.post('/api/groups/join', {
                groupCode,
            });

            if (response.data.message === 'Successfully joined the group!') {
                alert("You have successfully joined the group!");
            } 
        } catch (error: any) {
            if (error.response) {
              if (error.response.status === 401) {
                console.error('Group already exists for this leader.');
                alert(error.response.data.message); // Show the message to the user
              }else if(error.response.status === 400){
                alert(error.response.data.message);
              }
              else if(error.response.status === 409){
                alert(error.response.data.message);
              }
              else if(error.response.status === 404){
                alert(error.response.data.message);
              }
              else if(error.response.status === 500){
                alert(error.response.data.message);
              }
               else {
                console.error('Error:', error.response.data.message);
                alert(error.response.data.message); // Show other error messages
              }
            } else {
              console.error('Error creating group:', error.message);
              alert('Failed to create group. Please try again later.');
            }
        }
    };

    const handleCreateGroup = async () => {
        
        try {
            const response = await axios.post('/api/groups/create');

            if (response.data.message === 'Group created successfully!') {

                alert("Group created successfully! see your email for group code");
            } else {
                setCreateDisabled(true); // Disable button if leader has an existing group
                alert("You have already created a group.");
            }
        } catch (error: any) {
            if (error.response) {
              if (error.response.status === 409) {
                console.error('Group already exists for this leader.');
                alert(error.response.data.message); // Show the message to the user
              } else {
                console.error('Error:', error.response.data.message);
                alert(error.response.data.message); // Show other error messages
              }
            } else {
              console.error('Error creating group:', error.message);
              alert('Failed to create group. Please try again later.');
            }
        }
    };

    return (
        <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
            <div className="container">
                <div className="-mx-4 flex flex-wrap items-center justify-between">
                    {/* Form Container */}
                    <div className="w-full lg:w-1/2 px-4">
                        <div className="shadow-three mx-auto max-w-[500px] rounded bg-white px-6 py-10 dark:bg-dark sm:p-[60px]">
                            <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                                Join or Create a Group
                            </h3>
                            <br />
                            <div className="mb-8 flex items-center justify-center">
                                <span className="hidden h-[1px] w-full max-w-[60px] bg-body-color/50 sm:block"></span>
                                <p className="w-full px-5 text-center text-base font-medium text-body-color">
                                     register your group
                                </p>
                                <span className="hidden h-[1px] w-full max-w-[60px] bg-body-color/50 sm:block"></span>
                            </div>
                            <input
                                type="text"
                                value={groupCode}
                                onChange={(e) => setGroupCode(e.target.value)}
                                placeholder="Enter Group Code"
                                className="border-stroke dark:text-body-color-dark dark:shadow-two mb-6 flex w-full items-center justify-center rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-transparent dark:bg-[#2C303B] dark:hover:border-primary dark:hover:bg-primary/5 dark:hover:text-primary dark:hover:shadow-none"
                            />
                            <button
                                onClick={handleJoinGroup}
                                className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded w-full"
                            >
                                Join Group
                            </button>
                            <hr className={styles.divider} />
                            <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                                Create a Group
                            </h3>
                            <div className="mb-8 ">
                                <p className="w-full px-5 text-center text-base font-medium text-body-color">
                                     After clicking Create Group, a unique code will be sent to your email. Share this code with your group members so they can join
                                </p>
                            </div>
                            <button
                                onClick={handleCreateGroup}
                                disabled={isCreateDisabled}
                                className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded w-full"
                            >
                                Create Group
                            </button>
                        </div>
                    </div>
                    {/* Image Container */}
                    <div className="w-full lg:w-1/2 px-4 flex justify-center">
                        <img 
                            src="/images/495623-PI3AWD-314.jpg" 
                            alt="Group Collaboration" 
                            className="max-w-full h-auto"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GroupForm;
