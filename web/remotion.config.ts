import path from "path";
import { Config } from "@remotion/cli/config";
import { TsconfigPathsPlugin } from "enhanced-resolve";

Config.overrideWebpackConfig((currentConfiguration) => {
  const resolve = currentConfiguration.resolve ?? {};
  const plugins = resolve.plugins ?? [];

  return {
    ...currentConfiguration,
    resolve: {
      ...resolve,
      plugins: [
        ...plugins,
        new TsconfigPathsPlugin({
          configFile: path.resolve(process.cwd(), "tsconfig.json"),
        }),
      ],
    },
  };
});
