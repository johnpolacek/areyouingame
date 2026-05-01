import buildVersion from "@/build-version.json";

export type BuildVersion = typeof buildVersion;

export const BUILD_VERSION: BuildVersion = buildVersion;
export const BUILD_VERSION_LABEL = buildVersion.label;
