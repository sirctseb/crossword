import { nested, loadConfigurationSync } from "@sirctseb/typed-config";
import Config from "config";

import { FirebaseSettings } from "./FirebaseSettings";

export class Settings {
  @nested(FirebaseSettings)
  public firebase!: FirebaseSettings;

  private constructor() {}

  private static singletonInstance: Settings;

  static populateSettings(): Settings {
    if (this.singletonInstance) {
      return this.singletonInstance;
    }

    const settings = new Settings();
    loadConfigurationSync(settings, Config);
    return (this.singletonInstance = settings);
  }
}
