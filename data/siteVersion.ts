import { version as websiteVersion } from "../package.json";

export const KETHER_APP_VERSION_NUMBER = websiteVersion;
export const KETHER_BOT_VERSION_NUMBER = "3.5.12";

export const KETHER_APP_VERSION = `V${KETHER_APP_VERSION_NUMBER}`;
export const KETHER_BOT_VERSION = `V${KETHER_BOT_VERSION_NUMBER}`;
export const KETHER_VERSION_LABEL = `${KETHER_APP_VERSION} + BOT ${KETHER_BOT_VERSION}`;
