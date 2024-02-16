import { key } from "@sirctseb/typed-config";

export class FirebaseSettings {
  @key("firebase.apiKey")
  public apiKey!: string;

  @key("firebase.authDomain")
  public authDomain!: string;

  @key("firebase.databaseURL")
  public databaseURL!: string;

  @key("firebase.projectId")
  public projectId!: string;

  @key("firebase.storageBucket")
  public storageBucket!: string;

  @key("firebase.messagingSenderId")
  public messagingSenderId!: string;
}
