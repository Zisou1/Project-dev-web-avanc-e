import React from 'react';

const DeliveriesPage = () => {
  return (
    <div className="deliveries-page">
      <h1>Deliveries Page</h1>
      <p>This is a simple test page for deliveries.</p>
      
      <div className="test-content">
        <h2>Test Content</h2>
        <ul>
          <li>Item 1: Test delivery item</li>
          <li>Item 2: Another test item</li>
          <li>Item 3: Final test item</li>
        </ul>
        
        <button onClick={() => alert('Test button clicked!')}>
          Test Button
        </button>
      </div>
    </div>
  );
};

export default DeliveriesPage;