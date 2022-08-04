declare const __DEV__: boolean;

declare module "*.vue" {
  // eslint-disable-next-line
  const component: any;
  export default component;
}
