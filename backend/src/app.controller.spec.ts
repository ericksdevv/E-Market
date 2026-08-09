import { AppController } from './app.controller';

describe('AppController', () => {
  it('returns the API health status', () => {
    const controller = new AppController();

    expect(controller.getHealth()).toEqual({
      status: 'ok',
      service: 'e-market-api',
    });
  });
});
