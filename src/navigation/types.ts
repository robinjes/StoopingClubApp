export type ProductDetailParams = {
  productId: string;
  productName: string;
};

export type GridStackParamList = {
  Grid: undefined;
  ProductDetail: ProductDetailParams;
};

export type CollectionsStackParamList = {
  Collections: undefined;
  ProductDetail: ProductDetailParams;
};

export type StrollStackParamList = {
  Stroll: undefined;
  ProductDetail: ProductDetailParams;
};

export type RootTabParamList = {
  GridTab: undefined;
  CollectionsTab: undefined;
  StrollTab: undefined;
};
