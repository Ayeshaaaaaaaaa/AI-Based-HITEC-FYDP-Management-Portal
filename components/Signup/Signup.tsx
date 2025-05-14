"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {  useEffect } from 'react';

const SignUp = () => {
    const [userType, setUserType] = useState('student');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('student');
    const [emailError, setEmailError] = useState('');
    const [isSpecialRequestAllowed, setIsSpecialRequestAllowed] = useState(false);
    const [batch, setBatch] = useState('');
    const [dept, setDept] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [formValid, setFormValid] = useState(false); // New state for form validity
    

    const router = useRouter();
    const handleTabChange = (tab) => {
        setActiveTab(tab);
      };
    
    const validateEmail =  (email) => {
        const studentPattern = /^[0-9]{2}-[A-Za-z]{2}-[0-9]{3}@student\.hitecuni\.edu\.pk$/; // Student pattern
        //const facultyPattern = /^[A-Za-z0-9._%+-]+@hitecuni\.edu\.pk$/; // Faculty pattern
        const facultyPattern = /^[0-9]{2}-[A-Za-z]{2}-[0-9]{3}@student\.hitecuni\.edu\.pk$/; // Faculty pattern
        const currentYear = new Date().getFullYear();
        const allowedYear = (currentYear - 3) % 100; // Get the last two digits of the allowed year (e.g., 2021 -> 21)
        // const eligibleYear = (currentYear - 4) % 100; // 4 years or older batches
        const eligibleYear = (currentYear - 3) % 100; // 4 years or older batches
        const studentYear = email.slice(0, 2); 
        const dept = email.slice(3, 5); // Extract department
        const rollNo = email.slice(6, 9); // Extract roll number

        if (activeTab === 'student') {
          if (!studentPattern.test(email)) {
            return 'Only Final Year Students can login, Use Offical Email ID';
          }
      
          setBatch(studentYear);
          setDept(dept);
          setRollNo(rollNo);
          
          if (parseInt(studentYear) !== allowedYear) {
            return `Only students from batch ${allowedYear} can log in.`;
          }
        } else if (activeTab === 'faculty' && !facultyPattern.test(email)) {
          return 'Invalid faculty email format, Use Offical Email Id';
        }else if (activeTab === 'request' ) {
            const lowerLimit = (currentYear - 10) % 100;
            if (!studentPattern.test(email)) {
                return 'Invalid email format for students. Use Official Student Email ID.';
              }
            if (parseInt(studentYear) <= eligibleYear && parseInt(studentYear) >= lowerLimit) {
                setBatch(studentYear);
                setDept(dept);
                setRollNo(rollNo);
                setIsSpecialRequestAllowed(true); 
                return '';
            } 
            else {
                setIsSpecialRequestAllowed(false); // Disallow special request otherwise
                return 'Only students from batches earlier than the current final year can send a special request.';
            }
            
        }
        return ''; // No error if the pattern and year match
      };
      const handleEmailChange = async (e) => {
        const inputEmail = e.target.value;
        setEmail(inputEmail);
    
        // Validate the email based on the active tab (role)
        const validationError = validateEmail(inputEmail); // Validate the email
        setEmailError(validationError); // Set the error message, if any
        if (!validationError) {
            const emailExists = await checkEmailExists(inputEmail);
            if (emailExists) {
                setEmailError('Account already exists with this email.');
            } else {
                setEmailError(''); // Clear the error if the email is valid and doesn't exist
            }
        }
      };
      const checkEmailExists = async (email) => {
        const response = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        return data.exists;
    };

    
      
      const handlePasswordChange = (e) => {
        const inputPassword = e.target.value;
        setPassword(inputPassword);
      
        if (inputPassword.length < 6) {
          setPasswordError('Password must be at least 6 characters long');
        } else {
          setPasswordError(''); // Clear the error if the password is valid
        }
      };
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const response = await fetch('/api/signups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userType,
                username,
                email,
                password,
                dept,
                batch,
                rollNo
            }),
        });

        if (response.ok) {
            alert('Verification email sent. Please check your inbox.');
             
        } else {
            alert('Failed to send sign-up request.');
        }
    };
    useEffect(() => {
        // Reset email, password, and error states when switching tabs
        setEmail('');
        setPassword('');
        setEmailError('');
        setPasswordError('');
        
        }, [activeTab]);

    useEffect(() => {
        // Validate the form and set formValid state
        const isValid = username && email && password && !emailError && !passwordError;
        setFormValid(isValid);
    }, [username, email, password, emailError, passwordError]);
    return (
        <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
            <div className="container">
                <div className="-mx-4 flex flex-wrap">
                    <div className="w-full px-4">
                        <div className="shadow-three mx-auto max-w-[500px] rounded bg-white px-6 py-10 dark:bg-dark sm:p-[60px]">
                            <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                                Create your account
                            </h3>
                            <br />
                            <div className="flex justify-center mb-6">
                            <button
                            className={`${
                                activeTab === 'student'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500'
                            } mx-2 px-4 py-2 border-b-2 transition-colors duration-300`}
                            onClick={(e) => {
                                
                                setActiveTab('student');
                                e.preventDefault();
                                setUserType('student');  // Set the user type here
                            }}
                            >
                            Student
                            </button>
                            <button
                            className={`${
                                activeTab === 'faculty'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500'
                            } mx-2 px-4 py-2 border-b-2 transition-colors duration-300`}
                            
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveTab('faculty');
                                setUserType('faculty');  // Set the user type here
                            }}
                            >
                            Faculty
                            </button>
                            
                            <button
                            className={`${
                                activeTab === 'request'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500'
                            } mx-2 px-4 py-2 border-b-2 transition-colors duration-300`}
                           
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveTab('request');
                                setUserType('request');  // Set the user type here
                            }}
                            >
                            Send Request
                            </button>
                        </div>

                        

                
              
                            
                            <div className="mb-8 flex items-center justify-center">
                                <span className="hidden h-[1px] w-full max-w-[60px] bg-body-color/50 sm:block"></span>
                                <p className="w-full px-5 text-center text-base font-medium text-body-color">
                                     register with your email
                                </p>
                                <span className="hidden h-[1px] w-full max-w-[60px] bg-body-color/50 sm:block"></span>
                            </div>
                            <form onSubmit={handleSubmit} style={{ /* Your form styles */ }}>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Full Name"
                                    className="border-stroke dark:text-body-color-dark dark:shadow-two mb-6 flex w-full items-center justify-center rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-transparent dark:bg-[#2C303B] dark:hover:border-primary dark:hover:bg-primary/5 dark:hover:text-primary dark:hover:shadow-none"
                                    required
                                />
                                <input
                                    type="email"
                                    value={email}
                                    
                                    onChange={handleEmailChange}
                                    placeholder="Email"
                                    className="border-stroke dark:text-body-color-dark dark:shadow-two mb-6 flex w-full items-center justify-center rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-transparent dark:bg-[#2C303B] dark:hover:border-primary dark:hover:bg-primary/5 dark:hover:text-primary dark:hover:shadow-none"
                                    required
                                />
                                {emailError && <p className="text-red-500">{emailError}</p>} 
                                <input
                                    type="password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    placeholder="Password"
                                    className="border-stroke dark:text-body-color-dark dark:shadow-two mb-6 flex w-full items-center justify-center rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-transparent dark:bg-[#2C303B] dark:hover:border-primary dark:hover:bg-primary/5 dark:hover:text-primary dark:hover:shadow-none"
                                    required
                                />
                                {passwordError && <p className="text-red-500">{passwordError}</p>} {/* Error message */}
                                

                                           
                                <button
                                    type="submit"
                                    disabled={!formValid}
                                    //className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded"
                                    className={`${
                                        !formValid
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-primary hover:bg-primary-dark'
                                    } text-white font-bold py-2 px-4 rounded transition duration-300 `}
                                 >
                                    Sign Up
                                </button>
                                <br/><br/>
                <p className="text-center text-base font-medium text-body-color">
                Already using Project Sphere?{" "}
                <Link href="/signin" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SignUp;
