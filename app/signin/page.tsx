"use client"; // Add this directive at the top

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '400px',
  margin: '50px auto',
  marginTop: '250px', // Center the form horizontally and add margin on top and bottom
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#f9f9f9',
};

const inputStyle: React.CSSProperties = {
  marginBottom: '15px',
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  fontSize: '16px',
};

const buttonStyle: React.CSSProperties = {
  padding: '10px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#0070f3',
  color: '#fff',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
};

const buttonHoverStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#005bb5',
};

const headingStyle: React.CSSProperties = {
  textAlign: 'center', // Center the heading
  fontWeight: 'bold',  // Make the heading bold
  marginBottom: '20px',
};

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset error message on form submit
    setErrorMessage('');

    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const result = await response.json();

      // Redirect based on userType
      if (result.userType === 'faculty') {
        router.push('/faculty-dashboard');
      }else {
        
        const membershipResponse = await fetch('/api/groups/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: result.email }),
        });
        if (membershipResponse.ok) {
          const membershipResult = await membershipResponse.json();
          if (membershipResult.isGroupMember) {
            router.push('/'); // Redirect to home if user is a group leader or member
          } else {
            router.push('/group'); // Otherwise redirect to group
          }
        } else {
          setErrorMessage('Failed to verify group membership.');
        }
        
      }
    } else {
      const result = await response.json();
      setErrorMessage(result.message || 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h1 style={headingStyle}>Sign In</h1>

      {errorMessage && (
        <p style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
          {errorMessage}
        </p>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={inputStyle}
      />
      <button
        type="submit"
        style={buttonStyle}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor)}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor)}
      >
        Sign In
      </button>

      <br />
      <p style={{ textAlign: 'center', fontSize: '16px' }}>
        Don't have an account?{" "}
        <Link href="/signup" style={{ color: '#0070f3', textDecoration: 'underline' }}>
          Create one
        </Link>
      </p>
    </form>
  );
};

export default SignIn;
