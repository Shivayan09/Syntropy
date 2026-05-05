import { shadow } from "@/theme/tokens";

export const boxShadow = (color: string, offset = shadow.offset) => ({
  boxShadow: `${offset}px ${offset}px 0px ${color}`,
});
