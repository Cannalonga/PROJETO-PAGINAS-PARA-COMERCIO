// Script para criar página VIP
// Execute com: node scripts/create-vip.js

const http = require('http');

const data = JSON.stringify({
  secret: 'vitrinafast-admin-2024',
  slug: 'demo',
  storeName: 'Demo VitrinaFast',
  email: 'demo@vitrinafast.com',
  pageTitle: 'Demo VitrinaFast',
  pageDescription: 'Uma demonstração incrível da plataforma VitrinaFast - Crie sua vitrine digital profissional!',
  phone: '11999999999',
  whatsapp: '11999999999',
  address: 'Av. Paulista, 1000',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01310-100',
  instagram: '@vitrinafast',
  facebook: 'vitrinafast',
  businessHours: 'Seg-Sex: 9h-18h',
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/admin/vip',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📦 Status:', res.statusCode);
    console.log('📄 Resposta:', JSON.parse(body));
    
    if (res.statusCode === 200) {
      const result = JSON.parse(body);
      console.log('\n✅ Página VIP criada com sucesso!');
      console.log('🔗 Acesse:', result.urls?.public);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erro:', e.message);
});

req.write(data);
req.end();

console.log('🚀 Criando página VIP...');
