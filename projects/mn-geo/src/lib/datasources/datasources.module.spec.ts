import { DatasourcesModule } from './datasources.module';

describe('DatasourcesModule', () => {
  let datasourcesModule: DatasourcesModule;

  beforeEach(() => {
    datasourcesModule = new DatasourcesModule();
  });

  it('should create an instance', () => {
    expect(datasourcesModule).toBeTruthy();
  });
});
