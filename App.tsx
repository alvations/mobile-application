import AppNavigation from "./src/navigation";
import * as Sentry from "sentry-expo";
import Storybook from "./storybook";
import { IS_STORYBOOK_VIEW } from "./src/config";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    // enableInExpoDevelopment: true,
    debug: __DEV__
  });
  // Sentry.setRelease(Constants.manifest.revisionId!);
}

export default IS_STORYBOOK_VIEW ? Storybook : AppNavigation;
