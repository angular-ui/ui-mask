describe('user input', function() {
  it('should remove characters properly when backspacing', function() {
    browser.get('demo/index.html');

    var definitionElement = element(by.id('definition'));
    definitionElement.sendKeys('QT****');

    var maskedElement = element(by.id('masked'));
    maskedElement.sendKeys('1234');
    expect(maskedElement.getAttribute('value')).toBe('QT1234');
    maskedElement.sendKeys(protractor.Key.BACK_SPACE);
    expect(maskedElement.getAttribute('value')).toBe('QT123_');

    definitionElement.clear();
    definitionElement.sendKeys('QT**BC**');
    maskedElement.click();
    maskedElement.sendKeys('1234');
    expect(maskedElement.getAttribute('value')).toBe('QT12BC34');
    maskedElement.sendKeys(protractor.Key.BACK_SPACE);
    expect(maskedElement.getAttribute('value')).toBe('QT12BC3_');
    maskedElement.sendKeys(protractor.Key.BACK_SPACE);
    maskedElement.sendKeys(protractor.Key.BACK_SPACE);
    expect(maskedElement.getAttribute('value')).toBe('QT1_BC__');
  });
});
