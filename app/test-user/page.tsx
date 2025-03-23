
'use client';

import { useEffect } from 'react';

export default function TestUserPage() {
  useEffect(() => {
    async function createUser() {
      const response = await fetch('/api/test-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkUserId: 'test-clerk-id-123',
          email: 'testuser@example.com',
          name: 'Test User',
          username: 'testuser',
          imageUrl: 'https://example.com/avatar.png',
          ethnicity: 'Asian',
          phoneNumber: '1234567890',
          referrer: ['Referral Source'],
        }),
      });

      const data = await response.json();
      console.log('User created:', data);
    }

    createUser();
  }, []);

  return (
    <div>
      <h1>Test User Creation</h1>
      <p>Check the browser console for the result.</p>
    </div>
  );
}
