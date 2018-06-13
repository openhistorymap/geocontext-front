import { LayersModule } from './layers.module';

describe('LayersModule', () => {
  let layersModule: LayersModule;

  beforeEach(() => {
    layersModule = new LayersModule();
  });

  it('should create an instance', () => {
    expect(layersModule).toBeTruthy();
  });
});
