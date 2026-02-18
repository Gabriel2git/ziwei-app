const http = require('http');

function testBackend() {
  console.log('Testing backend server...');
  
  const postData = JSON.stringify({
    birthday: '2000-8-16',
    hourIndex: 2,
    gender: 'male',
    targetYear: 2026
  });
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/ziwei',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Backend response received!');
      
      try {
        const parsedData = JSON.parse(data);
        
        if (parsedData.astrolabe) {
          console.log('\n📋 Astrolabe data:');
          console.log('Palaces count:', parsedData.astrolabe.palaces.length);
          
          console.log('\n🌟 Star information per palace:');
          parsedData.astrolabe.palaces.forEach((palace, index) => {
            console.log(`\n${index + 1}. ${palace.name}宫:`);
            console.log(`   主星: ${palace.majorStars ? palace.majorStars.map(s => s.name).join(', ') : '无'}`);
            console.log(`   辅星: ${palace.minorStars ? palace.minorStars.map(s => s.name).join(', ') : '无'}`);
            console.log(`   小星: ${palace.adjectiveStars ? palace.adjectiveStars.map(s => s.name).join(', ') : '无'}`);
          });
          
          // Check if any palace has minor stars or adjective stars
          const hasMinorStars = parsedData.astrolabe.palaces.some(palace => 
            palace.minorStars && palace.minorStars.length > 0
          );
          
          const hasAdjectiveStars = parsedData.astrolabe.palaces.some(palace => 
            palace.adjectiveStars && palace.adjectiveStars.length > 0
          );
          
          console.log('\n📊 Summary:');
          console.log(`Has minor stars: ${hasMinorStars}`);
          console.log(`Has adjective stars: ${hasAdjectiveStars}`);
          
          if (!hasMinorStars && !hasAdjectiveStars) {
            console.log('\n❌ ERROR: No minor stars or adjective stars found!');
          } else {
            console.log('\n✅ SUCCESS: Minor stars and/or adjective stars found!');
          }
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error.message);
        console.error('Raw response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Error testing backend:', error.message);
  });
  
  req.write(postData);
  req.end();
}

testBackend();
