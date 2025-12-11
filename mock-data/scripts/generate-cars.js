/* eslint-disable */
const fs = require('fs');
const crypto = require('crypto');

const makes = JSON.parse(fs.readFileSync('mock-data/car-makes.json', 'utf8'));
const models = JSON.parse(fs.readFileSync('mock-data/car-models.json', 'utf8'));

const modelsByMake = {};
makes.forEach(make => {
  modelsByMake[make.id] = models.filter(m => m.carMakeId === make.id);
});

const existing = JSON.parse(fs.readFileSync('mock-data/car-details.json', 'utf8'));

for (let i = 0; i < 200; i++) {
  const make = makes[Math.floor(Math.random() * makes.length)];
  const makeModels = modelsByMake[make.id];
  const model = makeModels[Math.floor(Math.random() * makeModels.length)];
  const year = Math.floor(Math.random() * 31) + 1995; // 1995 to 2025
  const id = crypto.randomUUID();
  existing.push({
    id,
    carMakeId: make.id,
    carModelId: model.id,
    year
  });
}

fs.writeFileSync('mock-data/car-details.json', JSON.stringify(existing, null, '\t'));