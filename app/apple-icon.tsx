import { createQuestionMarkIcon } from "./icon";

export { alt, contentType } from "./icon";

export const runtime = "edge";

export const size = {
  width: 180,
  height: 180,
};

export default function AppleIcon() {
  return createQuestionMarkIcon(size);
}
