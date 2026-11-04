// Validación del catálogo aprobado. Fuente: dosquillas_catalogo_fotos_originales.html
// Ejecutar: node --test tests/catalogo.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {Script} from 'node:vm';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'index.html'),'utf8');
const products=[
  {
    "id": "evolucion-quillas",
    "main": "images/714e131dd4aa4c4c.webp",
    "gallery": [],
    "colors": [],
    "price": 3000
  },
  {
    "id": "evolucion-clasico",
    "main": "images/14c1e6f1b77d5a6f.webp",
    "gallery": [],
    "colors": [],
    "price": 2000
  },
  {
    "id": "longboards-vintage",
    "main": "images/b3e60ecafe9cfd4e.webp",
    "gallery": [],
    "colors": [],
    "price": 500
  },
  {
    "id": "cuadro-10-tablas",
    "main": "images/1e4cf311e9f3497c.webp",
    "gallery": [],
    "colors": [],
    "price": 400
  },
  {
    "id": "cuadro-5-tablas",
    "main": "images/f4002650f6b53324.webp",
    "gallery": [],
    "colors": [],
    "price": 220
  },
  {
    "id": "perchero",
    "main": "images/1fb4dc40bc71f8ff.webp",
    "gallery": [],
    "colors": [],
    "price": 180
  },
  {
    "id": "cuadro-marco-madera",
    "main": "images/31af9cdc45f0c031.webp",
    "gallery": [],
    "colors": [],
    "price": 200
  },
  {
    "id": "cuadro-marco-reciclado",
    "main": "images/bf846eed6fba0a10.webp",
    "gallery": [],
    "colors": [],
    "price": 150
  },
  {
    "id": "destapador",
    "main": "images/cf8b27d0a33ad210.jpg",
    "gallery": [],
    "colors": [
      "Sin preferencia",
      "Rojo",
      "Verde",
      "Madera prensada"
    ],
    "price": 100
  },
  {
    "id": "cuadro-con-perchas",
    "main": "images/6a11b24c5bd78c56.webp",
    "gallery": [
      "images/6a11b24c5bd78c56.webp",
      "images/5d71ef4c738c5a8b.webp",
      "images/189392a4a1ce74c4.webp"
    ],
    "colors": [],
    "price": 150
  },
  {
    "id": "percheros-chicos",
    "main": "images/fd7f4771523010ce.webp",
    "gallery": [
      "images/fd7f4771523010ce.webp",
      "images/d86cc977c1d9fcbf.webp"
    ],
    "colors": [],
    "price": 120
  },
  {
    "id": "portallaves",
    "main": "images/3ee8d592870ad968.webp",
    "gallery": [
      "images/3ee8d592870ad968.webp",
      "images/6009a8c5555e8425.webp",
      "images/589881e5d83d17e4.webp"
    ],
    "colors": [],
    "price": 80
  },
  {
    "id": "cuadro-tabla-reciclada",
    "main": "images/5abd1d911dcf1c05.jpg",
    "gallery": [
      "images/5abd1d911dcf1c05.jpg",
      "images/ea96c51dface0326.jpg",
      "images/d80e3de4a1e69517.jpg"
    ],
    "colors": [],
    "price": 180
  },
  {
    "id": "estantes-flotantes",
    "main": "images/6d943e397bbafdb6.jpg",
    "gallery": [],
    "colors": [],
    "price": 250
  },
  {
    "id": "posacelular",
    "main": "images/1d1c096705bde9e8.webp",
    "gallery": [
      "images/1d1c096705bde9e8.webp",
      "images/ac342dff5ce59208.jpg",
      "images/ee5b983eccf7a011.jpg"
    ],
    "colors": [],
    "price": 400
  },
  {
    "id": "perchero-fish",
    "main": "images/31f6eb0db22a573b.webp",
    "gallery": [],
    "colors": [
      "Sin preferencia",
      "Rojo",
      "Azul",
      "Negro"
    ],
    "price": 200
  }
];
const cards=[...html.matchAll(/<article class="card\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)];
const cardsById=new Map(cards.map(([,id,body])=>[id,body]));

test('mantiene exactamente los 16 productos originales y sus identificadores',()=>{
  assert.equal(cards.length,products.length);
  assert.deepEqual(new Set(cardsById.keys()),new Set(products.map(p=>p.id)));
});

for(const product of products){
  test('catálogo aprobado: '+product.id,()=>{
    const body=cardsById.get(product.id);
    assert.ok(body,'Falta tarjeta del producto');
    const main=body.match(/class="product-visual"[\s\S]*?<img[^>]*\bsrc="([^"]+)"/)?.[1];
    assert.equal(main,product.main,'Se cambió la fotografía principal');
    const gallery=[...body.matchAll(/class="original-photo-option[^"]*"[^>]*>[\s\S]*?<img[^>]*\bsrc="([^"]+)"/g)].map(m=>m[1]);
    assert.deepEqual(gallery,product.gallery,'Se modificó una galería aprobada');
    const colors=[...body.matchAll(/\bdata-color="([^"]+)"/g)].map(m=>m[1]);
    assert.deepEqual(colors,product.colors,'Se cambiaron las variantes disponibles');
    const price=body.match(/class="price">R\$ ([\d.]+)/)?.[1];
    assert.equal(price,product.price.toLocaleString('pt-BR'),'Se modificó un precio');
    assert.ok(existsSync(resolve(root,product.main)),'Falta archivo de la foto principal');
    for(const path of gallery) assert.ok(existsSync(resolve(root,path)),'Falta fotografía original: '+path);
  });
}

test('las 27 fotografías referenciadas existen en images/',()=>{
  const images=new Set([...html.matchAll(/\b(?:src)="(images\/[^"]+\.(?:webp|jpe?g|png))"/g)].map(m=>m[1]));
  assert.equal(images.size,27);
  for(const path of images)assert.ok(existsSync(resolve(root,path)),'Falta imagen: '+path);
});

test('los precios y colores usados por el carrito coinciden con la ficha visible',()=>{
  const raw=html.match(/const products=(\\[[\\s\\S]*?\\]);\\s*const phone=/)?.[1];
  assert.ok(raw,'No se encontraron los datos del carrito');
  const inCart=JSON.parse(raw);
  assert.equal(inCart.length,products.length);
  for(const p of products){
    const item=inCart.find(i=>i.id===p.id);
    assert.ok(item,'Falta producto del carrito: '+p.id);
    assert.equal(item.price,p.price,'Precio incorrecto en el carrito: '+p.id);
    assert.deepEqual(item.colors,p.colors.filter(x=>x!=='Sin preferencia'),'Colores incorrectos en el carrito: '+p.id);
  }
});

test('el JavaScript integrado tiene sintaxis válida',()=>{
  for(const match of html.matchAll(/<script([^>]*)>([\\s\\S]*?)<\\/script>/g)){
    if(/application\\/ld\\+json/.test(match[1]))continue;
    new Script(match[2],{filename:'index.html (script integrado)'});
  }
});

test('se guarda la fotografía elegida y se incorpora a la consulta',()=>{
  assert.match(html,/dosquillas-selected-photos-v1/);
  assert.match(html,/aria-pressed/);
  assert.match(html,/Foto seleccionada:/);
  assert.match(html,/productURL\(id\)/);
});
