describe('Example', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have welcome screen', async () => {
    await waitFor(element(by.id('welcomeLabel'))).toExist().withTimeout(10000);
    await expect(element(by.id('welcomeLabel'))).toBeVisible();
    await element(by.id('signInButton')).tap();
    await expect(element(by.id('recoverPhrase'))).toBeVisible();
  });
});
