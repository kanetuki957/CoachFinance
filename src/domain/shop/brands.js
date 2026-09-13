import pocoLogo from '../../rogo/POCO-logo.png';
import pocoHero from '../../Publicity/POCO/POCO_Publicity.png';

// Add a brand here and it is automatically shown in the selection screen.
export const BRANDS = [
  {
    id: 'poco',
    name: 'POCO',
    logo: pocoLogo,
    heroImage: pocoHero,
    tagline: '毎日の暮らしを、もっと楽しく。',
    minPrice: 100,
    maxPrice: 1000,
    status: 'available',
  },
  {
    id: 'nesta', name: 'NESTA', logo: null, heroImage: null,
    tagline: 'ちょっといい暮らしを。', minPrice: 800, maxPrice: 3000, status: 'coming-soon',
  },
  {
    id: 'velora', name: 'VELORA', logo: null, heroImage: null,
    tagline: '日常を、上質な空間へ。', minPrice: 3000, maxPrice: 10000, status: 'coming-soon',
  },
];

export const getBrandById = (brandId) => BRANDS.find((brand) => brand.id === brandId) ?? null;
