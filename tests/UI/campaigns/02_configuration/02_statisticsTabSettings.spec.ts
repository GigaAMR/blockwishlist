import {
  // Import utils
  testContext,
  // Import BO pages
  boDashboardPage,
  boLoginPage,
  boModuleManagerPage,
  // Import FO pages
  foCategoryPage,
  foHomePage,
  foLoginPage,
  // Import modules
  modBlockwishlistBoMain,
  modBlockwishlistBoStatistics,
  // Import data
  dataCustomers,
  dataModules,
} from '@prestashop-core/ui-testing';

import { test, expect, Page, BrowserContext } from '@playwright/test';

const baseContext: string = 'modules_blockwishlist_configuration_statisticsTabSettings';

test.describe('Wishlist module - Statistics tab settings', () => {
  let browserContext: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    browserContext = await browser.newContext();
    page = await browserContext.newPage();
  });
  test.afterAll(async () => {
    await page.close();
  });

  test('should login in BO', async () => {
    await testContext.addContextItem(test.info(), 'testIdentifier', 'loginBO', baseContext);

    await boLoginPage.goTo(page, global.BO.URL);
    await boLoginPage.successLogin(page, global.BO.EMAIL, global.BO.PASSWD);

    const pageTitle = await boDashboardPage.getPageTitle(page);
    expect(pageTitle).toContain(boDashboardPage.pageTitle);
  });

  test('should go to \'Modules > Module Manager\' page', async () => {
    await testContext.addContextItem(test.info(), 'testIdentifier', 'goToModuleManagerPage', baseContext);

    await boDashboardPage.goToSubMenu(
      page,
      boDashboardPage.modulesParentLink,
      boDashboardPage.moduleManagerLink,
    );
    await boModuleManagerPage.closeSfToolBar(page);

    const pageTitle = await boModuleManagerPage.getPageTitle(page);
    expect(pageTitle).toContain(boModuleManagerPage.pageTitle);
  });


  test(`should search the module ${dataModules.blockwishlist.name}`, async () => {
    await testContext.addContextItem(test.info(), 'testIdentifier', 'searchModule', baseContext);

    const isModuleVisible = await boModuleManagerPage.searchModule(page, dataModules.blockwishlist);
    expect(isModuleVisible).toEqual(true);
  });

  test(`should go to the configuration page of the module '${dataModules.blockwishlist.name}'`, async () => {
    await testContext.addContextItem(test.info(), 'testIdentifier', 'goToConfigurationPage', baseContext);

    await boModuleManagerPage.goToConfigurationPage(page, dataModules.blockwishlist.tag);

    const pageTitle = await modBlockwishlistBoMain.getPageTitle(page);
    expect(pageTitle).toEqual(modBlockwishlistBoMain.pageTitle);

    const isConfigurationTabActive = await modBlockwishlistBoMain.isTabActive(page, 'Configuration');
    expect(isConfigurationTabActive).toEqual(true);

    const isStatisticsTabActive = await modBlockwishlistBoMain.isTabActive(page, 'Statistics');
    expect(isStatisticsTabActive).toEqual(false);
  });
  
  test('should go on Statistics Tab', async () => {
    await testContext.addContextItem(test.info(), 'testIdentifier', 'goToStatisticsTab', baseContext);

    await modBlockwishlistBoMain.goToStatisticsTab(page);

    const pageTitle = await modBlockwishlistBoStatistics.getPageTitle(page);
    expect(pageTitle).toEqual(modBlockwishlistBoStatistics.pageTitle);

    const noRecordsFoundText = await modBlockwishlistBoStatistics.getTextForEmptyTable(page);
    expect(noRecordsFoundText).toContain('warning No records found');
  });

  test('should go to the FO', async () => {
    await testContext.addContextItem(test.info(), 'testIdentifier', 'goToFO', baseContext);

    page = await modBlockwishlistBoStatistics.viewMyShop(page);
    await foHomePage.changeLanguage(page, 'en');

    const isHomePage = await foHomePage.isHomePage(page);
    expect(isHomePage).toEqual(true);
  });

  test('should go to login page', async () => {
    await testContext.addContextItem(test.info(), 'testIdentifier', 'goToLoginPage', baseContext);

    await foHomePage.goToLoginPage(page);

    const pageTitle = await foLoginPage.getPageTitle(page);
    expect(pageTitle, 'Fail to open FO login page').toContain(foLoginPage.pageTitle);
  });

  test('should sign in with default customer', async () => {
    await testContext.addContextItem(test.info(), 'testIdentifier', 'sighInFo', baseContext);

    await foLoginPage.customerLogin(page, dataCustomers.johnDoe);

    const isCustomerConnected = await foLoginPage.isCustomerConnected(page);
    expect(isCustomerConnected, 'Customer is not connected').toEqual(true);
  });

  test('should go to all products page', async () => {
    await testContext.addContextItem(test.info(), 'testIdentifier', 'goToAllProducts', baseContext);

    await foHomePage.goToAllProductsPage(page);

    const isCategoryPageVisible = await foCategoryPage.isCategoryPage(page);
    expect(isCategoryPageVisible).toEqual(true);
  });

    for (let idxProduct: number = 1; idxProduct <= 3; idxProduct++) {
      // eslint-disable-next-line no-loop-func
      test(`should add product #${idxProduct} to wishlist`, async () => {
        await testContext.addContextItem(test.info(), 'testIdentifier', `addToFavorite${idxProduct}`, baseContext);

        const textResult = await foCategoryPage.addToWishList(page, idxProduct);
        expect(textResult).toEqual(foCategoryPage.messageAddedToWishlist);

        const isAddedToWishlist = await foCategoryPage.isAddedToWishlist(page, idxProduct);
        expect(isAddedToWishlist).toEqual(true);
      });
    }

  test('should logout', async () => {
    await testContext.addContextItem(test.info(), 'testIdentifier', 'foLogout', baseContext);

    await foCategoryPage.logout(page);

    const isCustomerConnected = await foHomePage.isCustomerConnected(page);
    expect(isCustomerConnected).toEqual(false);
  });
  
  test('should go to BO', async () => {
    await testContext.addContextItem(test.info(), 'testIdentifier', 'goToBoBack', baseContext);

    page = await foHomePage.closePage(browserContext, page, 0);

    const pageTitle = await modBlockwishlistBoStatistics.getPageTitle(page);
    expect(pageTitle).toContain(modBlockwishlistBoStatistics.pageTitle);
  });

  // @todo : https://github.com/PrestaShop/PrestaShop/issues/33374
  test('should click on the refresh button', async () => {
    await testContext.addContextItem(test.info(), 'testIdentifier', 'clickOnRefreshButton', baseContext);

    test.skip(true, 'https://github.com/PrestaShop/PrestaShop/issues/33374');

    await modBlockwishlistBoStatistics.refreshStatistics(page);

    // Check statistics
    const pageTitle = await modBlockwishlistBoStatistics.getPageTitle(page);
    expect(pageTitle).toContain(modBlockwishlistBoStatistics.pageTitle);
  });
});
