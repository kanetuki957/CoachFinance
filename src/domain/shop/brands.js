import pocoLogo from '../../rogo/POCO-logo.png';

// ブランド追加時はロゴを import し、この配列へ追加するだけで画面側で再利用できます。
export const BRANDS = [
  {
    id: 'poco',
    name: 'POCO',
    logo: pocoLogo,
    priceTier: 'low',
    tagline: '手頃な価格で、暮らしをもっと楽しく。',
  },
];

export const getBrandById = (brandId) => BRANDS.find((brand) => brand.id === brandId) ?? null;
