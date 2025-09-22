import { LocalAuthGuard } from './local_auth.guard';

describe('LocalAuthGuard', () => {
  it('should be defined', () => {
    expect(new LocalAuthGuard()).toBeDefined();
  });
});
