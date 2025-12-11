/* eslint-disable */
const fs = require('fs');

const carDetails = JSON.parse(fs.readFileSync('mock-data/car-details.json', 'utf8'));
const carFeatures = JSON.parse(fs.readFileSync('mock-data/car-features.json', 'utf8'));

const associations = [];

carDetails.forEach(car => {
  // Randomly select 0 to 3 features for each car
  const numFeatures = Math.floor(Math.random() * 4); // 0, 1, 2, or 3
  const shuffledFeatures = carFeatures.sort(() => 0.5 - Math.random());
  const selectedFeatures = shuffledFeatures.slice(0, numFeatures);

  selectedFeatures.forEach(feature => {
    associations.push({
      carDetailId: car.id,
      featureId: feature.id
    });
  });
});

fs.writeFileSync('mock-data/car-detail-features.json', JSON.stringify(associations, null, '\t'));
