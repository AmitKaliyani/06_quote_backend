import { env } from "../config/env.js";
const baseOption = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
};
export const setCookie = ({ res, name, value, maxAge }) => {
  res.cookie(name, value, { ...baseOption, maxAge });
};

export const removeCookie = (res, name) => {
  res.clearCookie(name, { ...baseOption });
};
