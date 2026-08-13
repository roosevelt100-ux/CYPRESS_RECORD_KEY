// Mock upload function to accept PUT requests and return a simulated public URL
// This is only for local testing with `netlify dev` when real S3 isn't configured.

exports.handler = async function(event) {
  try {
    if(event.httpMethod !== 'PUT'){
      return { statusCode:405, body: 'Method Not Allowed' };
    }
    const key = event.queryStringParameters && event.queryStringParameters.key;
    // In a real setup we'd stream the body to S3. For mock, we just acknowledge.
    console.log('Mock upload received for key:', key, 'size:', event.body ? event.body.length : 0);
    const publicUrl = `https://example.com/mock-uploads/${key}`;
    return { statusCode:200, body: JSON.stringify({ success:true, url: publicUrl, key }) };
  } catch(err){
    console.error(err);
    return { statusCode:500, body: JSON.stringify({ error: err.message }) };
  }
};
