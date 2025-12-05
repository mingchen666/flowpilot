const fetch = require('node-fetch');

const testValidation = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/model-validation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseUrl: "https://www.linkflow.run/v1",
        apiKey: "sk-7oflvgMRXPZe0skck0qIqsFuDSvOBKiMqqGiC0Sx9gzAsALh",
        modelId: "claude-sonnet-4-5-20250929",
      }),
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testValidation();
