import Category_List from './pages/category_list';
import ProductPage from './pages/ProductPage.jsx';

export const CATEGORY_LIST_ROUTE = '/';
export const AROMA_ROUTE = '/category/1';
export const FORHAIR_ROUTE = '/category/2';
export const FORHOME_ROUTE = '/category/3';
export const FORFACE_ROUTE = '/category/4';
export const FORBODY_ROUTE = '/category/5';
export const SOAP_ROUTE = '/category/6';
export const SEASON_ROUTE = '/category/7';
export const FORBATHSHOWER_ROUTE = '/category/8';
export const BASKET_ROUTE = '/basket';

export const authRoutes = [];

export const publicRoutes = [
  {
    path: CATEGORY_LIST_ROUTE,
    component: Category_List,
  },
  {
    path: '/category/:id',
    component: ProductPage,
  },
];
