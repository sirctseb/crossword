import { FirebaseSettings } from "./FirebaseSettings";

export class Settings {
  public firebase: FirebaseSettings = new FirebaseSettings();

  private constructor() {}

  private static singletonInstance: Settings;

  static populateSettings(): Settings {
    if (this.singletonInstance) {
      return this.singletonInstance;
    }

    const settings = new Settings();

    return (this.singletonInstance = settings);
  }
}

export const settings = Settings.populateSettings();
