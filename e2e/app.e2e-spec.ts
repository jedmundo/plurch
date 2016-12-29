import { PlurchPage } from './app.po';

describe('plurch App', function() {
  let page: PlurchPage;

  beforeEach(() => {
    page = new PlurchPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
