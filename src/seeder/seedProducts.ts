import { faker } from '@faker-js/faker';
import slugify from 'slugify';
import { Brand } from '../app/modules/brand/brand.model';
import { Category } from '../app/modules/category/category.model';
import { Product } from '../app/modules/product/product.model';

const seedProductsByCategory = async () => {
	try {
		// 1. Fetch all existing categories
		// 1. Fetch Categories and Brands simultaneously
		const [categories, brands] = await Promise.all([
			Category.find(),
			Brand.find({ isActive: true }), // Only use active brands
		]);

		const shopId = '6974f13aea397475873f1cc2';

		if (categories.length === 0 || brands.length === 0) {
			console.log('Missing data. Please seed Categories and Brands first!');
			return;
		}

		const allProducts = [];

		// 2. Loop through each category
		for (const category of categories) {
			console.log(`Generating 10 products for: ${category.name}`);

			for (let i = 0; i < 10; i++) {
				// Pick a random brand from your fetched brands list
				const randomBrand = brands[Math.floor(Math.random() * brands.length)];

				const name = `${category.name} ${faker.commerce.productName()}`;
				const price = parseFloat(faker.commerce.price({ min: 50, max: 2000 }));

				allProducts.push({
					name: name,
					slug: slugify(name, { lower: true, strict: true }),
					description: faker.commerce.productDescription(),
					price: price,
					stock: faker.number.int({ min: 10, max: 100 }),
					weight: faker.number.float({ min: 0.5, max: 15, fractionDigits: 1 }),
					offerPrice: price * 0.9,
					category: category._id,
					imageUrls: [faker.image.urlPicsumPhotos(), faker.image.urlPicsumPhotos()],
					isActive: true,
					quantity: faker.number.int({ min: 1, max: 5 }),
					shop: shopId,
					// Map the brand data from the actual Brand document
					brand: {
						_id: randomBrand._id,
						name: randomBrand.name,
					},
					averageRating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
					ratingCount: faker.number.int({ min: 0, max: 500 }),
					availableColors: [faker.color.human(), faker.color.human()],
					specification: {
						material: faker.commerce.productMaterial(),
						manufacturer: randomBrand.name, // Use the real brand name here too
						warranty: '1 Year',
					},
					keyFeatures: [
						faker.commerce.productAdjective(),
						faker.commerce.productAdjective(),
						faker.commerce.productAdjective(),
					],
					reviews: [],
				});
			}
		}

		// 3. Insert into database
		// await Product.insertMany(allProducts);

		// 3. Bulk insert for performance
		await Product.insertMany(allProducts);
		console.log(`Successfully seeded ${allProducts.length} products! 🌱`);
	} catch (error) {
		console.error('Error seeding products:', error);
	}
};

export default seedProductsByCategory;
